
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  imageUrl?: string;
  isLiked?: boolean;
  isAI: boolean;
}

export enum AppTab {
  FEED = 'FEED',
  LIKED = 'LIKED',
  SETTINGS = 'SETTINGS',
  ACCOUNT = 'ACCOUNT'
}

export type Language = 'English' | 'French' | 'Spanish' | 'German' | 'Italian';

export interface UserProfile {
  avatarEmoji: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  credits: number;
}

export interface AppSettings {
  language: Language;
  notificationsEnabled: boolean;
  notificationFrequency: '1h' | '4h' | 'daily';
  profile: UserProfile;
  tutorialSeen: boolean;
}

export const TRANSLATIONS: Record<Language, any> = {
  English: {
    appName: 'Aletheia',
    aiGenerated: 'Aletheia Wisdom',
    humanSource: 'Historical Truth',
    feed: 'Feed',
    liked: 'Liked',
    settings: 'Settings',
    share: 'Share',
    like: 'Like',
    likedBtn: 'Liked',
    curating: 'Gathering truths...',
    favorites: 'Treasured Wisdom',
    noLikes: "Silence remains.",
    save: 'Preserve',
    quoteLang: 'Language of Mind',
    notifications: 'Visions',
    freq_1h: 'Every hour',
    freq_4h: 'Every 4 hours',
    freq_daily: 'Daily cycle',
    notifTitle: 'Aletheia Call',
    wisdom: 'Wisdom',
    love: 'Love',
    success: 'Ascension',
    life: 'Existence',
    avatar: 'Vessel Identity',
    copied: 'Captured in mind',
    login: 'Connect with Google',
    logout: 'Disconnect',
    credits: 'Credits',
    buyCredits: 'Buy Credits (50)',
    account: 'Account',
    noCredits: 'No credits remaining'
  },
  French: {
    appName: 'Aletheia',
    aiGenerated: 'Intelligence Aletheia',
    humanSource: 'Vérité Historique',
    feed: 'Flux',
    liked: 'Favoris',
    settings: 'Réglages',
    share: 'Partager',
    like: "J'aime",
    likedBtn: 'Aimé',
    curating: 'Collecte des vérités...',
    favorites: 'Sagesse Précieuse',
    noLikes: "Le silence demeure.",
    save: 'Préserver',
    quoteLang: 'Langue de l\'esprit',
    notifications: 'Visions',
    freq_1h: 'Chaque heure',
    freq_4h: 'Toutes les 4 heures',
    freq_daily: 'Cycle journalier',
    notifTitle: 'L\'Appel d\'Aletheia',
    wisdom: 'Sagesse',
    love: 'Amour',
    success: 'Ascension',
    life: 'Existence',
    avatar: 'Identité du Vaisseau',
    copied: 'Capturé dans l\'esprit',
    login: 'Se connecter avec Google',
    logout: 'Se déconnecter',
    credits: 'Crédits',
    buyCredits: 'Acheter des crédits (50)',
    account: 'Compte',
    noCredits: 'Plus de crédits'
  },
  // Added Spanish translations to complete the Record type
  Spanish: {
    appName: 'Aletheia',
    aiGenerated: 'Sabiduría de Aletheia',
    humanSource: 'Verdad Histórica',
    feed: 'Inicio',
    liked: 'Favoritos',
    settings: 'Ajustes',
    share: 'Compartir',
    like: 'Me gusta',
    likedBtn: 'Te gusta',
    curating: 'Reuniendo verdades...',
    favorites: 'Sabiduría Preciada',
    noLikes: 'El silencio permanece.',
    save: 'Preservar',
    quoteLang: 'Lenguaje de la Mente',
    notifications: 'Visiones',
    freq_1h: 'Cada hora',
    freq_4h: 'Cada 4 horas',
    freq_daily: 'Ciclo diario',
    notifTitle: 'Llamada de Aletheia',
    wisdom: 'Sabiduría',
    love: 'Amor',
    success: 'Ascensión',
    life: 'Existencia',
    avatar: 'Identidad del Recipiente',
    copied: 'Capturado en la mente'
  },
  // Added German translations to complete the Record type
  German: {
    appName: 'Aletheia',
    aiGenerated: 'Aletheia Weisheit',
    humanSource: 'Historische Wahrheit',
    feed: 'Feed',
    liked: 'Favoriten',
    settings: 'Einstellungen',
    share: 'Teilen',
    like: 'Gefällt mir',
    likedBtn: 'Gemerkt',
    curating: 'Wahrheiten sammeln...',
    favorites: 'Kostbare Weisheit',
    noLikes: 'Stille bleibt.',
    save: 'Bewahren',
    quoteLang: 'Sprache des Geistes',
    notifications: 'Visionen',
    freq_1h: 'Jede Stunde',
    freq_4h: 'Alle 4 Stunden',
    freq_daily: 'Täglicher Zyklus',
    notifTitle: 'Aletheias Ruf',
    wisdom: 'Weisheit',
    love: 'Liebe',
    success: 'Aufstieg',
    life: 'Existenz',
    avatar: 'Gefäß-Identität',
    copied: 'Im Geist festgehalten'
  },
  // Added Italian translations to complete the Record type
  Italian: {
    appName: 'Aletheia',
    aiGenerated: 'Saggezza di Aletheia',
    humanSource: 'Verità Storica',
    feed: 'Feed',
    liked: 'Preferiti',
    settings: 'Impostazioni',
    share: 'Condividi',
    like: 'Mi piace',
    likedBtn: 'Ti piace',
    curating: 'Raccogliendo verità...',
    favorites: 'Saggezza Preziosa',
    noLikes: 'Il silenzio rimane.',
    save: 'Preservare',
    quoteLang: 'Linguaggio della Mente',
    notifications: 'Visioni',
    freq_1h: 'Ogni ora',
    freq_4h: 'Ogni 4 ore',
    freq_daily: 'Ciclo giornaliero',
    notifTitle: 'Il Richiamo di Aletheia',
    wisdom: 'Saggezza',
    love: 'Amore',
    success: 'Ascensione',
    life: 'Esistenza',
    avatar: 'Identità del Vascello',
    copied: 'Catturato nella mente'
  }
};
