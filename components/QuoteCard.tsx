
import React, { useState, useEffect } from 'react';
import { Quote, Language, TRANSLATIONS } from '../types';

interface QuoteCardProps {
  quote: Quote;
  onLike: () => void;
  onShare: (quote: Quote) => void;
  language: Language;
  isLowEndDevice?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onLike, onShare, language, isLowEndDevice }) => {
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [likesCount, setLikesCount] = useState(quote.likesCount || 0);
  const lastTap = React.useRef<number>(0);
  const t = TRANSLATIONS[language] || TRANSLATIONS['English'];

  useEffect(() => {
    // Fetch global likes count on mount
    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/likes/count?quoteText=${encodeURIComponent(quote.text)}`);
        if (res.ok) {
          const data = await res.json();
          setLikesCount(data.likesCount);
        }
      } catch (e) {}
    };
    fetchLikes();
  }, [quote.text]);

  const handleLike = async () => {
    const wasLiked = quote.isLiked;
    onLike();
    
    // Optimistic update
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    if (!wasLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }

    // Sync with server
    try {
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteText: quote.text, increment: !wasLiked })
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likesCount);
      }
    } catch (e) {}
  };

  const handleTouchStart = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      handleLike();
    }
    lastTap.current = now;
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const attribution = quote.isAI ? t.aiGenerated : quote.author;
    const textToShare = `"${quote.text}" — ${attribution}`;
    if (navigator.share) {
      try { await navigator.share({ title: t.appName, text: textToShare, url: window.location.href }); }
      catch (err) { if ((err as Error).name !== 'AbortError') copyToClipboard(textToShare); }
    } else {
      copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => alert(t.copied)).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); alert(t.copied); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const placeholderGradient = `linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)`;

  return (
    <div 
      className="snap-item relative bg-black flex flex-col items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: placeholderGradient }}>
        {quote.imageUrl && (
          <img 
            src={isLowEndDevice ? quote.imageUrl.replace('1080/1920', '400/700') : quote.imageUrl} 
            alt="Background" 
            className={`w-full h-full object-cover opacity-50 transition-opacity duration-1000 ${isLowEndDevice ? '' : 'ken-burns'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
      </div>

      {/* Quote Content - Centered */}
      <div className="relative z-10 px-10 pb-48 text-center w-full max-w-2xl pointer-events-none select-none">
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight italic drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] text-reveal" style={{ animationDelay: '0.2s' }}>
          "{quote.text}"
        </h2>
        
        {/* Signature Stack - Positioned below the quote */}
        <div className="mt-12 flex flex-col items-center gap-5 text-reveal" style={{ animationDelay: '0.6s' }}>
          <div className="w-8 h-[1px] bg-white/30" />
          <h3 className="font-ancient text-sm tracking-[1em] text-white/40 uppercase">
            Aletheia
          </h3>
          <div className="flex flex-col items-center gap-1">
            <p className="text-white/20 font-bold text-[9px] tracking-[0.4em] uppercase">
              {quote.isAI ? t.aiGenerated : quote.author}
            </p>
            {!quote.isAI && (
               <p className="text-white/5 text-[7px] font-bold tracking-[0.2em] uppercase">
                {t.humanSource}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Sidebar Style */}
      <div className="absolute right-6 bottom-44 flex flex-col items-center gap-10 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="flex flex-col items-center gap-2 group active:scale-75 transition-transform duration-300"
        >
          <div className={`p-4 rounded-full glass transition-all duration-500 ${quote.isLiked ? 'bg-red-600 border-transparent shadow-[0_0_50px_rgba(220,38,38,0.5)]' : 'hover:bg-white/10'}`}>
            <svg 
              className={`w-8 h-8 transition-all duration-300 ${quote.isLiked ? 'fill-white scale-110' : 'fill-none stroke-white stroke-[2.5]'}`}
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-[11px] font-bold mb-0.5">{likesCount > 0 ? likesCount : ''}</span>
            <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">{quote.isLiked ? t.likedBtn : t.like}</span>
          </div>
        </button>

        <button 
          onClick={handleShareClick}
          className="flex flex-col items-center gap-2 group active:scale-75 transition-transform duration-300"
        >
          <div className="p-4 rounded-full glass hover:bg-white/10 transition-all duration-500">
            <svg className="w-8 h-8 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
          </div>
          <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">{t.share}</span>
        </button>
      </div>

      {/* Heart Animation Overlay */}
      {showHeartAnim && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <svg className="w-48 h-48 fill-red-600 drop-shadow-[0_0_80px_rgba(220,38,38,0.8)] heart-pop" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default QuoteCard;
