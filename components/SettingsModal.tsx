
import React from 'react';
import { AppSettings, Language, TRANSLATIONS, UserProfile } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onLogout: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onLogout, onClose }) => {
  const languages: Language[] = ['English', 'French', 'Spanish', 'German', 'Italian'];
  const avatars = ['✨', '🕊️', '🌿', '💡', '🎭', '🏔️', '🌊', '🌌'];
  const t = TRANSLATIONS[settings.language];
  
  const frequencies = [
    { label: t.freq_1h, value: '1h' },
    { label: t.freq_4h, value: '4h' },
    { label: t.freq_daily, value: 'daily' },
  ];

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return alert("Not supported");
    }

    if (Notification.permission === 'denied') {
      return alert("Notifications are blocked.");
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      onUpdate({ ...settings, notificationsEnabled: true });
    } else {
      onUpdate({ ...settings, notificationsEnabled: false });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    onUpdate({
      ...settings,
      profile: { ...settings.profile, ...updates }
    });
  };

  const handleToggleNotifications = () => {
    if (settings.notificationsEnabled) {
      onUpdate({ ...settings, notificationsEnabled: false });
    } else {
      requestPermission();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#121212] border border-white/5 rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white font-serif text-2xl font-bold opacity-0">Settings</h2>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <label className="text-white/40 text-[11px] font-bold uppercase tracking-wider block mb-4">{t.avatar}</label>
            <div className="flex flex-wrap gap-3">
              {avatars.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => updateProfile({ avatarEmoji: emoji })}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    settings.profile?.avatarEmoji === emoji ? 'bg-white scale-110 shadow-lg' : 'bg-[#1c1c1c] hover:bg-white/5'
                  }`}
                >
                  <span className={settings.profile?.avatarEmoji === emoji ? '' : 'grayscale opacity-40'}>{emoji}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-white/40 text-[11px] font-bold uppercase tracking-wider block mb-4">{t.quoteLang}</label>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onUpdate({ ...settings, language: lang })}
                  className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                    settings.language === lang ? 'bg-white text-black' : 'bg-[#1c1c1c] text-white/40 hover:text-white/60'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </section>

          <section className="flex justify-between items-center py-2">
            <label className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{t.notifications}</label>
            <button 
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${settings.notificationsEnabled ? 'bg-green-500' : 'bg-[#1c1c1c]'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </section>

          {settings.notificationsEnabled && (
            <div className="space-y-2">
              {frequencies.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onUpdate({ ...settings, notificationFrequency: f.value as any })}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${settings.notificationFrequency === f.value ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full py-5 bg-white text-black rounded-[24px] font-extrabold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all mt-4">
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
