
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, AppTab, AppSettings, Language, TRANSLATIONS, UserProfile } from './types';
import { generateQuotes, generateQuoteImage } from './services/geminiService';
import QuoteCard from './components/QuoteCard';
import SettingsPage from './components/SettingsPage';

const STARTER_QUOTES: Quote[] = [
  {
    id: 'starter-1',
    text: "Connais-toi toi-même et tu connaîtras l'univers et les dieux.",
    author: "Socrate",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-2',
    text: "La vérité est une terre sans chemin.",
    author: "Jiddu Krishnamurti",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-3',
    text: "Le bonheur est parfois caché dans l'inconnu.",
    author: "Victor Hugo",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-4',
    text: "L'important n'est pas ce qu'on fait de nous, mais ce que nous faisons nous-mêmes de ce qu'on a fait de nous.",
    author: "Jean-Paul Sartre",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-5',
    text: "Rien n'est permanent, sauf le changement.",
    author: "Héraclite",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-6',
    text: "Le voyage de mille lieues commence par un pas.",
    author: "Lao Tseu",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-7',
    text: "Fais de ta vie un rêve, et d'un rêve, une réalité.",
    author: "Antoine de Saint-Exupéry",
    category: "Life",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-8',
    text: "La vie, c'est ce qui arrive quand on a d'autres projets.",
    author: "John Lennon",
    category: "Life",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-9',
    text: "L'imagination est plus importante que le savoir.",
    author: "Albert Einstein",
    category: "Success",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-10',
    text: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.",
    author: "Antoine de Saint-Exupéry",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-11',
    text: "La seule chose que je sais, c'est que je ne sais rien.",
    author: "Socrate",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-12',
    text: "Le bonheur est la seule chose qui se double si on le partage.",
    author: "Albert Schweitzer",
    category: "Life",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-13',
    text: "Soyez le changement que vous voulez voir dans le monde.",
    author: "Mahatma Gandhi",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-14',
    text: "La musique est la langue des émotions.",
    author: "Emmanuel Kant",
    category: "Wisdom",
    isAI: false,
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1080"
  },
  {
    id: 'starter-15',
    text: "Le silence est le langage de la conscience pure.",
    author: "Aletheia",
    category: "Wisdom",
    isAI: true,
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1080"
  }
];

const DEFAULT_PROFILE: UserProfile = {
  avatarEmoji: '✨'
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'French',
  notificationsEnabled: false,
  notificationFrequency: 'daily',
  profile: DEFAULT_PROFILE
};

const CACHE_SIZE = 10;
const PREFETCH_THRESHOLD = 3;

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>(STARTER_QUOTES);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.FEED);
  const [loading, setLoading] = useState(false); // Start immediately with starter quotes
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenQuotesRef = useRef<Set<string>>(new Set(STARTER_QUOTES.map(q => q.text)));

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['French'];

  const getCachedPool = (): Quote[] => {
    try {
      const pool = localStorage.getItem('quote_pool');
      return pool ? JSON.parse(pool) : [];
    } catch { return []; }
  };

  const saveCachedPool = (pool: Quote[]) => {
    localStorage.setItem('quote_pool', JSON.stringify(pool));
  };

  const fillImagesForQuotes = useCallback(async (batch: Quote[]) => {
    batch.forEach(async (q) => {
      if (!q.imageUrl) {
        const url = await generateQuoteImage(q.text);
        setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, imageUrl: url } : item));
        const pool = getCachedPool();
        const updatedPool = pool.map(item => item.id === q.id ? { ...item, imageUrl: url } : item);
        saveCachedPool(updatedPool);
      }
    });
  }, []);

  useEffect(() => {
    console.log("App Initialized with", STARTER_QUOTES.length, "quotes");
    const init = async () => {
      const savedLikes = localStorage.getItem('liked_quotes');
      if (savedLikes) {
        try {
          const parsed = JSON.parse(savedLikes);
          setLikedQuotes(parsed);
          parsed.forEach((l: Quote) => seenQuotesRef.current.add(l.text));
        } catch (e) {}
      }

      const savedSettings = localStorage.getItem('app_settings');
      let currentLang: Language = settings.language;
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          currentLang = parsed.language;
        } catch (e) {}
      }

      const pool = getCachedPool();
      if (pool.length > 0) {
        const cachedQuotes = pool.slice(0, 5);
        setQuotes(prev => [...prev, ...cachedQuotes]);
        cachedQuotes.forEach(q => seenQuotesRef.current.add(q.text));
        saveCachedPool(pool.slice(5));
        fillImagesForQuotes(cachedQuotes);
      }
      
      
      // Prefetch fresh ones in background without blocking the UI
      prefetchQuotes(currentLang).catch(err => {
        console.error("Background prefetch failed", err);
      });
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const prefetchQuotes = useCallback(async (lang: Language) => {
    if (isGeneratingMore) return;
    setIsGeneratingMore(true);
    try {
      const more = await generateQuotes(CACHE_SIZE, lang, Array.from(seenQuotesRef.current));
      const currentPool = getCachedPool();
      const updatedPool = [...currentPool, ...more].slice(0, 25);
      saveCachedPool(updatedPool);
      
      // If we were low on quotes in the UI, push some immediately
      setQuotes(prev => {
        if (prev.length < 10) {
          const nextBatch = updatedPool.slice(0, 3);
          nextBatch.forEach(q => seenQuotesRef.current.add(q.text));
          saveCachedPool(updatedPool.slice(3));
          fillImagesForQuotes(nextBatch);
          return [...prev, ...nextBatch];
        }
        return prev;
      });

      more.forEach(async (q) => {
        const url = await generateQuoteImage(q.text);
        const pool = getCachedPool();
        const poolIdx = pool.findIndex(item => item.id === q.id);
        if (poolIdx !== -1) {
          pool[poolIdx].imageUrl = url;
          saveCachedPool(pool);
        }
      });
    } finally {
      setIsGeneratingMore(false);
    }
  }, [isGeneratingMore, fillImagesForQuotes]);

  const handleLike = useCallback((id: string) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, isLiked: !q.isLiked } : q));
    setLikedQuotes(prev => {
      const q = quotes.find(x => x.id === id);
      if (!q) return prev;
      const exists = prev.find(l => l.text === q.text);
      let updated;
      if (exists) {
        updated = prev.filter(l => l.text !== q.text);
      } else {
        updated = [{ ...q, isLiked: true }, ...prev];
      }
      localStorage.setItem('liked_quotes', JSON.stringify(updated));
      return updated;
    });
  }, [quotes]);

  const handleRemoveLike = (text: string) => {
    setLikedQuotes(prev => {
      const updated = prev.filter(l => l.text !== text);
      localStorage.setItem('liked_quotes', JSON.stringify(updated));
      return updated;
    });
    setQuotes(prev => prev.map(q => q.text === text ? { ...q, isLiked: false } : q));
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPosition = scrollTop + clientHeight;
    
    if (activeTab === AppTab.FEED && scrollHeight - scrollPosition < clientHeight * 3) {
      const pool = getCachedPool();
      if (pool.length > 0) {
        const nextBatch = pool.slice(0, 2);
        nextBatch.forEach(q => seenQuotesRef.current.add(q.text));
        setQuotes(prev => [...prev, ...nextBatch]);
        saveCachedPool(pool.slice(2));
        fillImagesForQuotes(nextBatch);
      }
      
      if (pool.length < PREFETCH_THRESHOLD) {
        prefetchQuotes(settings.language);
      }
    }
  }, [activeTab, settings.language, prefetchQuotes, fillImagesForQuotes]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-12 transition-opacity duration-1000 z-[100]">
        <div className="flex flex-col items-center justify-center gap-12 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-white/60 animate-spin mb-4" />
          <p className="text-white/40 font-ancient text-[12px] tracking-[0.6em] uppercase animate-pulse leading-loose max-w-[240px]">
            {t.curating}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-zinc-900 overflow-hidden font-sans">
      
      {/* Immersive View: No App Name Header */}

      {/* Main Feed Layer */}
      <div className={`tab-transition h-full ${activeTab === AppTab.FEED ? 'opacity-100' : 'opacity-0 pointer-events-none scale-95'}`}>
        <div ref={scrollRef} onScroll={handleScroll} className="snap-container h-screen bg-zinc-900">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onLike={handleLike} onShare={() => {}} language={settings.language} />
            ))
          ) : (
             <div className="h-full w-full flex items-center justify-center bg-black">
                <div className="text-white/20 font-ancient uppercase tracking-widest text-[10px] animate-pulse">
                  RECHERCHE DE VÉRITÉ...
                </div>
             </div>
          )}
          {isGeneratingMore && (
            <div className="snap-item flex flex-col items-center justify-center bg-black">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-t-2 border-white/40 rounded-full animate-spin"></div>
              </div>
              <p className="mt-8 text-white/20 font-ancient text-[11px] tracking-[0.5em] uppercase animate-pulse">
                {t.curating}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liked Gallery Layer */}
      <div className={`tab-transition absolute inset-0 h-screen overflow-y-auto bg-[#050505] pt-32 pb-48 px-8 scrollbar-hide ${activeTab === AppTab.LIKED ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
        <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-white/70 font-ancient text-3xl tracking-[0.3em] uppercase mb-3">{t.favorites}</h2>
            <div className="w-16 h-[1px] bg-white/10" />
        </div>

        {likedQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-48 text-center opacity-10">
            <svg className="w-32 h-32 mb-8 stroke-[0.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <p className="text-xl font-ancient tracking-[0.3em] uppercase">{t.noLikes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {likedQuotes.map((q) => (
              <div key={q.id} className="relative aspect-[9/16] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group">
                <img src={q.imageUrl || `https://picsum.photos/seed/${q.id}/1080/1920`} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[5s] group-hover:scale-110" />
                <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                  <p className="text-white font-serif text-2xl italic mb-8 leading-relaxed line-clamp-6">"{q.text}"</p>
                  <div className="flex justify-between items-center">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">{q.isAI ? t.aiGenerated : q.author}</p>
                    <button onClick={() => handleRemoveLike(q.text)} className="text-red-500/90 p-5 glass rounded-full active:scale-75 transition-all">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Page Layer */}
      <SettingsPage settings={settings} onUpdate={setSettings} isActive={activeTab === AppTab.SETTINGS} />

      {/* Liquid Navigation Dock */}
      <div className="fixed bottom-12 left-0 right-0 z-[60] flex justify-center px-8 pointer-events-none">
        <nav className="glass rounded-[50px] flex items-center gap-3 p-2.5 shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] pointer-events-auto border border-white/5">
          <button 
            onClick={() => setActiveTab(AppTab.FEED)} 
            className={`relative flex items-center gap-4 px-8 py-4 rounded-full transition-all duration-700 ${activeTab === AppTab.FEED ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <svg className="w-6 h-6 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {activeTab === AppTab.FEED && <span className="text-[11px] font-black uppercase tracking-[0.25em]">{t.feed}</span>}
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.LIKED)} 
            className={`relative flex items-center gap-4 px-8 py-4 rounded-full transition-all duration-700 ${activeTab === AppTab.LIKED ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <svg className={`w-6 h-6 fill-none stroke-current stroke-[2.5] ${activeTab === AppTab.LIKED ? 'fill-current' : ''}`} viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {activeTab === AppTab.LIKED && <span className="text-[11px] font-black uppercase tracking-[0.25em]">{t.liked}</span>}
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.SETTINGS)} 
            className={`relative flex items-center gap-4 px-8 py-4 rounded-full transition-all duration-700 ${activeTab === AppTab.SETTINGS ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white/50'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-all duration-500 ${activeTab === AppTab.SETTINGS ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
              <span>{settings.profile.avatarEmoji}</span>
            </div>
            {activeTab === AppTab.SETTINGS && <span className="text-[11px] font-black uppercase tracking-[0.25em]">{t.settings}</span>}
          </button>
        </nav>
      </div>

    </div>
  );
};

export default App;
