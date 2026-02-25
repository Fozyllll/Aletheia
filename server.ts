
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

// Initialize users file if not exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

const app = express();
const PORT = 3000;

const stripe = (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "temp") 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const googleClient = new OAuth2Client(
  (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "temp") 
    ? process.env.GOOGLE_CLIENT_ID 
    : "placeholder-id"
);

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['aletheia-secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  sameSite: 'none'
}));

// Helper to get/save users
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
const saveUsers = (users: any) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// --- AUTH ROUTES ---

app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    redirect_uri: redirectUri
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
  
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
        credits: 5 // 5 free credits for new users
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
  res.json(users[userId]);
});

app.post("/api/auth/logout", (req, res) => {
  (req as any).session = null;
  res.json({ success: true });
});

// --- PAYMENT ROUTES ---

app.post("/api/payments/create-checkout", async (req, res) => {
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
              name: "50 Crédits Aletheia",
              description: "50 générations de citations par l'IA",
            },
            unit_amount: 200, // 2.00€
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL}/?payment=success`,
      cancel_url: `${process.env.APP_URL}/?payment=cancel`,
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const users = getUsers();
    if (users[userId]) {
      users[userId].credits += 50;
      saveUsers(users);
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

  if (user && user.credits > 0) {
    user.credits -= 1;
    saveUsers(users);
    res.json({ credits: user.credits });
  } else {
    res.status(403).json({ error: "No credits" });
  }
});

// --- START SERVER ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Only listen if not running as a serverless function (Vercel)
  if (process.env.VITE_DEV || process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export for Vercel
export default app;
