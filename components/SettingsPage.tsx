
import React from 'react';
import { AppSettings, Language, TRANSLATIONS, UserProfile, User } from '../types';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  isActive: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onBuyCredits: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdate, isActive, user, onLogin, onLogout, onBuyCredits }) => {
  const languages: Language[] = ['English', 'French', 'Spanish', 'German', 'Italian'];
  const avatars = ['✨', '🕊️', '🌿', '💡', '🎭', '🏔️', '🌊', '🌌'];
  const t = TRANSLATIONS[settings.language];
  
  const frequencies = [
    { label: t.freq_1h, value: '1h' },
    { label: t.freq_4h, value: '4h' },
    { label: t.freq_daily, value: 'daily' },
  ];

  const requestPermission = async () => {
    if (!('Notification' in window)) return alert("Not supported");
    if (Notification.permission === 'denied') return alert("Notifications are blocked.");
    const permission = await Notification.requestPermission();
    onUpdate({ ...settings, notificationsEnabled: permission === 'granted' });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    onUpdate({ ...settings, profile: { ...settings.profile, ...updates } });
  };

  const handleToggleNotifications = () => {
    if (settings.notificationsEnabled) {
      onUpdate({ ...settings, notificationsEnabled: false });
    } else {
      requestPermission();
    }
  };

  return (
    <div 
      className={`tab-transition absolute inset-0 overflow-y-auto bg-[#030303] pt-40 pb-48 px-10 scrollbar-hide ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-white font-ancient text-2xl tracking-[0.2em] uppercase opacity-60 mb-2">{t.settings}</h2>
        <div className="w-12 h-[1px] bg-white/10" />
      </div>
      
      <div className="space-y-16 max-w-lg mx-auto">
        <section>
          <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] block mb-8 text-center">{t.avatar}</label>
          <div className="grid grid-cols-4 gap-6">
            {avatars.map(emoji => (
              <button
                key={emoji}
                onClick={() => updateProfile({ avatarEmoji: emoji })}
                className={`aspect-square rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-500 ${
                  settings.profile?.avatarEmoji === emoji ? 'bg-white scale-110 shadow-[0_20px_40px_rgba(255,255,255,0.15)]' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={settings.profile?.avatarEmoji === emoji ? '' : 'grayscale opacity-30'}>{emoji}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] block mb-8 text-center">{t.quoteLang}</label>
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => onUpdate({ ...settings, language: lang })}
                className={`w-full px-8 py-6 rounded-[2.5rem] text-xs font-black tracking-widest flex justify-between items-center transition-all duration-500 ${
                  settings.language === lang ? 'bg-white text-black shadow-xl' : 'bg-white/5 text-white/30 hover:text-white/50'
                }`}
              >
                {lang.toUpperCase()}
                {settings.language === lang && (
                  <div className="w-2 h-2 rounded-full bg-black" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white/5 rounded-[3rem] p-10 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-white/90 font-ancient text-xl tracking-wider block">{t.notifications}</label>
              <p className="text-white/20 text-[10px] font-medium mt-2 tracking-wide">Wisdom calls in silence.</p>
            </div>
            <button 
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-500 ${settings.notificationsEnabled ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-7 w-7 transform rounded-full transition-all duration-500 ${settings.notificationsEnabled ? 'translate-x-8 bg-black' : 'translate-x-1 bg-white/20'}`} />
            </button>
          </div>

          {settings.notificationsEnabled && (
            <div className="pt-8 border-t border-white/5 space-y-3">
              {frequencies.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onUpdate({ ...settings, notificationFrequency: f.value as any })}
                  className={`w-full text-center px-6 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${settings.notificationFrequency === f.value ? 'bg-white/10 text-white' : 'text-white/10 hover:text-white/30'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-white/5 pt-16">
          <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] block mb-8 text-center">{t.account}</label>
          
          {!user ? (
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={onLogin}
                className="w-full py-6 bg-white text-black font-ancient text-xs tracking-[0.3em] uppercase rounded-[2.5rem] hover:scale-[1.02] transition-transform"
              >
                {t.login}
              </button>
              <p className="text-white/10 text-[8px] uppercase tracking-widest text-center px-10 leading-relaxed">
                Connectez-vous pour sauvegarder vos favoris et générer des images personnalisées.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2.5rem]">
                <img src={user.picture} className="w-16 h-16 rounded-full border border-white/10" alt={user.name} />
                <div>
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-white/30 text-[10px]">{user.email}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-white/30 text-[9px] tracking-[0.4em] uppercase mb-1">{t.credits}</p>
                  <p className="text-white text-4xl font-serif italic">
                    {user.credits >= 999999 ? '∞' : user.credits}
                  </p>
                </div>
                <button 
                  onClick={onBuyCredits}
                  className="w-full py-4 bg-white/10 text-white border border-white/10 font-ancient text-[9px] tracking-[0.3em] uppercase rounded-2xl hover:bg-white/20 transition-colors"
                >
                  {t.buyCredits}
                </button>
              </div>

              <button 
                onClick={onLogout}
                className="w-full text-center text-white/20 text-[9px] tracking-[0.4em] uppercase hover:text-white/40 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          )}
        </section>

        <div className="text-center pt-8 pb-12">
            <p className="text-white/5 text-[9px] uppercase font-black tracking-[0.6em]">Aletheia AI • Digital Truth</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
