
import express from "express";
import { createServer as createViteServer } from "vite";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";
import cookieSession from "cookie-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "users.json");
const LIKES_FILE = path.join(__dirname, "likes_stats.json");

// Initialize files if not exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}
if (!fs.existsSync(LIKES_FILE)) {
  fs.writeFileSync(LIKES_FILE, JSON.stringify({}));
}

const app = express();
const PORT = 3000;

// Trust proxy is required for secure cookies on Render/Vercel
app.set('trust proxy', 1);

// Priority: Environment Variable > Render URL > Localhost
const APP_URL = process.env.APP_URL || (process.env.RENDER_EXTERNAL_URL ? process.env.RENDER_EXTERNAL_URL : `http://localhost:${PORT}`);

const stripe = (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "temp") 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const googleClient = new OAuth2Client(
  (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "temp") 
    ? process.env.GOOGLE_CLIENT_ID 
    : "placeholder-id",
  (process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== "temp")
    ? process.env.GOOGLE_CLIENT_SECRET
    : "placeholder-secret"
);

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['aletheia-secret-key-v1'],
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
}));

// Helper to get/save users
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
const saveUsers = (users: any) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const getLikesStats = () => JSON.parse(fs.readFileSync(LIKES_FILE, "utf-8"));
const saveLikesStats = (stats: any) => fs.writeFileSync(LIKES_FILE, JSON.stringify(stats, null, 2));

// --- AUTH ROUTES ---

app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = `${APP_URL}/auth/google/callback`;
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    redirect_uri: redirectUri
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${APP_URL}/auth/google/callback`;
  
  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri
    });
    
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) throw new Error("No payload");

    const users = getUsers();
    if (!users[payload.sub]) {
      users[payload.sub] = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        credits: 5, // 5 free credits for new users
        isPremium: false,
        likedQuotes: []
      };
      saveUsers(users);
    }

    (req as any).session.userId = payload.sub;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentification réussie. Fermeture de la fenêtre...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Auth error", error);
    res.status(500).send("Erreur d'authentification");
  }
});

app.get("/api/auth/me", (req, res) => {
  const userId = (req as any).session.userId;
  if (!userId) return res.status(401).json({ error: "Not logged in" });
  
  const users = getUsers();
  const user = users[userId];
  if (user && user.email === 'fozyllll.yt@gmail.com') {
    user.isPremium = true;
    user.credits = 999999;
  }
  res.json(user);
});

app.post("/api/auth/logout", (req, res) => {
  (req as any).session = null;
  res.json({ success: true });
});

// --- PAYMENT ROUTES ---

app.post("/api/payments/create-subscription", async (req, res) => {
  const userId = (req as any).session.userId;
  if (!userId || !stripe) return res.status(401).json({ error: "Unauthorized" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Aletheia Premium",
              description: "Accès illimité à toute la sagesse d'Aletheia",
            },
            unit_amount: 299, // 2.99€
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${APP_URL}/?payment=success`,
      cancel_url: `${APP_URL}/?payment=cancel`,
      metadata: { userId }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Stripe error" });
  }
});

// Webhook for Stripe (simplified for demo, in production use stripe.webhooks.constructEvent)
app.post("/api/payments/webhook", express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  // In a real app, verify signature here
  const event = JSON.parse(req.body.toString());

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      const users = getUsers();
      if (users[userId]) {
        users[userId].isPremium = true;
        users[userId].credits = 999999;
        saveUsers(users);
      }
    }
  }
  res.json({received: true});
});

// --- CREDIT TRACKING ---

app.post("/api/credits/deduct", (req, res) => {
  const userId = (req as any).session.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const users = getUsers();
  const user = users[userId];

  if (user && (user.email === 'fozyllll.yt@gmail.com' || user.isPremium)) {
    return res.json({ credits: 999999 });
  }

  if (user && user.credits > 0) {
    user.credits -= 1;
    saveUsers(users);
    res.json({ credits: user.credits });
  } else {
    res.status(403).json({ error: "No credits" });
  }
});

// --- LIKES SYNC ---

app.get("/api/likes", (req, res) => {
  const userId = (req as any).session.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const users = getUsers();
  res.json(users[userId]?.likedQuotes || []);
});

app.post("/api/likes", (req, res) => {
  const userId = (req as any).session.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { likes } = req.body;
  if (!Array.isArray(likes)) return res.status(400).json({ error: "Invalid data" });

  const users = getUsers();
  if (users[userId]) {
    users[userId].likedQuotes = likes;
    saveUsers(users);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/api/likes/toggle", (req, res) => {
  const { quoteText, increment } = req.body;
  if (!quoteText) return res.status(400).json({ error: "Missing quote text" });

  const stats = getLikesStats();
  const current = stats[quoteText] || 0;
  stats[quoteText] = Math.max(0, current + (increment ? 1 : -1));
  saveLikesStats(stats);
  res.json({ likesCount: stats[quoteText] });
});

app.get("/api/likes/count", (req, res) => {
  const { quoteText } = req.query;
  const stats = getLikesStats();
  res.json({ likesCount: stats[quoteText as string] || 0 });
});

// --- START SERVER ---

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      // Catch-all for SPA in production
      app.use((req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }
  } catch (err) {
    console.error("Vite/Middleware setup error:", err);
    // Fallback if Vite fails
    app.use((req, res) => {
      res.status(500).send("Server initialization error. Please check logs.");
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
