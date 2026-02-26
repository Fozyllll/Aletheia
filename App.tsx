
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, AppTab, AppSettings, Language, TRANSLATIONS, UserProfile, User } from './types';
import { generateQuotes, generateQuoteImage } from './services/geminiService';
import QuoteCard from './components/QuoteCard';
import SettingsPage from './components/SettingsPage';

const STARTER_QUOTES: Quote[] = [
  { id: 's1', text: "Connais-toi toi-même.", author: "Socrate", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s1/1080/1920" },
  { id: 's2', text: "La vérité est une terre sans chemin.", author: "Jiddu Krishnamurti", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s2/1080/1920" },
  { id: 's3', text: "Le bonheur est parfois caché dans l'inconnu.", author: "Victor Hugo", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s3/1080/1920" },
  { id: 's4', text: "L'important n'est pas ce qu'on fait de nous, mais ce que nous faisons nous-mêmes.", author: "Jean-Paul Sartre", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s4/1080/1920" },
  { id: 's5', text: "Rien n'est permanent, sauf le changement.", author: "Héraclite", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s5/1080/1920" },
  { id: 's6', text: "Le voyage de mille lieues commence par un pas.", author: "Lao Tseu", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s6/1080/1920" },
  { id: 's7', text: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Antoine de Saint-Exupéry", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s7/1080/1920" },
  { id: 's8', text: "La vie, c'est ce qui arrive quand on a d'autres projets.", author: "John Lennon", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s8/1080/1920" },
  { id: 's9', text: "L'imagination est plus importante que le savoir.", author: "Albert Einstein", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s9/1080/1920" },
  { id: 's10', text: "On ne voit bien qu'avec le cœur.", author: "Antoine de Saint-Exupéry", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s10/1080/1920" },
  { id: 's11', text: "La seule chose que je sais, c'est que je ne sais rien.", author: "Socrate", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s11/1080/1920" },
  { id: 's12', text: "Le bonheur est la seule chose qui se double si on le partage.", author: "Albert Schweitzer", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s12/1080/1920" },
  { id: 's13', text: "Soyez le changement que vous voulez voir dans le monde.", author: "Mahatma Gandhi", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s13/1080/1920" },
  { id: 's14', text: "La musique est la langue des émotions.", author: "Emmanuel Kant", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s14/1080/1920" },
  { id: 's15', text: "Le silence est le langage de la conscience pure.", author: "Aletheia", category: "Wisdom", isAI: true, imageUrl: "https://picsum.photos/seed/s15/1080/1920" },
  { id: 's16', text: "Vivre, c'est naître lentement.", author: "Antoine de Saint-Exupéry", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s16/1080/1920" },
  { id: 's17', text: "L'avenir appartient à ceux qui croient à la beauté de leurs rêves.", author: "Eleanor Roosevelt", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s17/1080/1920" },
  { id: 's18', text: "Le plus grand risque est de ne prendre aucun risque.", author: "Mark Zuckerberg", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s18/1080/1920" },
  { id: 's19', text: "La patience est amère, mais son fruit est doux.", author: "Jean-Jacques Rousseau", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s19/1080/1920" },
  { id: 's20', text: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Nelson Mandela", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s20/1080/1920" },
  { id: 's21', text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s21/1080/1920" },
  { id: 's22', text: "Aimez-vous les uns les autres.", author: "Jésus", category: "Love", isAI: false, imageUrl: "https://picsum.photos/seed/s22/1080/1920" },
  { id: 's23', text: "Tout ce que nous sommes est le résultat de nos pensées.", author: "Bouddha", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s23/1080/1920" },
  { id: 's24', text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s24/1080/1920" },
  { id: 's25', text: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", author: "Gandhi", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s25/1080/1920" },
  { id: 's26', text: "Le cœur a ses raisons que la raison ne connaît point.", author: "Blaise Pascal", category: "Love", isAI: false, imageUrl: "https://picsum.photos/seed/s26/1080/1920" },
  { id: 's27', text: "L'homme est condamné à être libre.", author: "Jean-Paul Sartre", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s27/1080/1920" },
  { id: 's28', text: "La beauté sauvera le monde.", author: "Fiodor Dostoïevski", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s28/1080/1920" },
  { id: 's29', text: "Agis comme s'il était impossible d'échouer.", author: "Winston Churchill", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s29/1080/1920" },
  { id: 's30', text: "La vie est courte, l'art est long.", author: "Hippocrate", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s30/1080/1920" },
  { id: 's31', text: "Le savoir est le seul bien qui s'accroît quand on le partage.", author: "Sacha Guitry", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s31/1080/1920" },
  { id: 's32', text: "L'amour est la force la plus puissante du monde.", author: "Gandhi", category: "Love", isAI: false, imageUrl: "https://picsum.photos/seed/s32/1080/1920" },
  { id: 's33', text: "La liberté commence où l'ignorance finit.", author: "Victor Hugo", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s33/1080/1920" },
  { id: 's34', text: "Le doute est le commencement de la sagesse.", author: "Aristote", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s34/1080/1920" },
  { id: 's35', text: "La vérité vous rendra libres.", author: "Bible", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s35/1080/1920" },
  { id: 's36', text: "Penser, c'est dire non.", author: "Alain", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s36/1080/1920" },
  { id: 's37', text: "L'essentiel est invisible pour les yeux.", author: "Saint-Exupéry", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s37/1080/1920" },
  { id: 's38', text: "Le temps est un grand maître.", author: "Corneille", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s38/1080/1920" },
  { id: 's39', text: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui.", author: "Franklin D. Roosevelt", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s39/1080/1920" },
  { id: 's40', text: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.", author: "Nelson Mandela", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s40/1080/1920" },
  { id: 's41', text: "La vie est un défi à relever, un bonheur à mériter, une aventure à tenter.", author: "Mère Teresa", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s41/1080/1920" },
  { id: 's42', text: "L'art de vivre consiste en un mélange subtil entre lâcher prise et tenir bon.", author: "Henri Lewis", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s42/1080/1920" },
  { id: 's43', text: "Le bonheur n'est pas quelque chose de tout fait. Il découle de vos propres actions.", author: "Dalaï Lama", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s43/1080/1920" },
  { id: 's44', text: "La persévérance est la clé du succès.", author: "Anonyme", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s44/1080/1920" },
  { id: 's45', text: "L'échec est le fondement de la réussite.", author: "Lao Tseu", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s45/1080/1920" },
  { id: 's46', text: "La confiance en soi est le premier secret du succès.", author: "Ralph Waldo Emerson", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s46/1080/1920" },
  { id: 's47', text: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.", author: "Albert Schweitzer", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s47/1080/1920" },
  { id: 's48', text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s48/1080/1920" },
  { id: 's49', text: "Votre temps est limité, ne le gâchez pas en menant une existence qui n'est pas la vôtre.", author: "Steve Jobs", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s49/1080/1920" },
  { id: 's50', text: "L'innovation distingue un leader d'un suiveur.", author: "Steve Jobs", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s50/1080/1920" },
  { id: 's51', text: "La créativité, c'est l'intelligence qui s'amuse.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s51/1080/1920" },
  { id: 's52', text: "Tout le monde est un génie. Mais si vous jugez un poisson sur sa capacité à grimper à un arbre, il passera sa vie entière à croire qu'il est stupide.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s52/1080/1920" },
  { id: 's53', text: "La mesure de l'intelligence est la capacité de changer.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s53/1080/1920" },
  { id: 's54', text: "Au milieu de la difficulté se trouve l'opportunité.", author: "Albert Einstein", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s54/1080/1920" },
  { id: 's55', text: "La logique vous mènera d'un point A à un point B. L'imagination vous mènera partout.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s55/1080/1920" },
  { id: 's56', text: "Apprendre d'hier, vivre pour aujourd'hui, espérer pour demain.", author: "Albert Einstein", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s56/1080/1920" },
  { id: 's57', text: "La vie est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s57/1080/1920" },
  { id: 's58', text: "Celui qui n'a jamais commis d'erreur n'a jamais rien essayé de nouveau.", author: "Albert Einstein", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s58/1080/1920" },
  { id: 's59', text: "Ne cherchez pas à devenir un homme de succès, mais plutôt un homme de valeur.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s59/1080/1920" },
  { id: 's60', text: "La paix ne peut pas être maintenue par la force ; elle ne peut être atteinte que par la compréhension.", author: "Albert Einstein", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s60/1080/1920" },
  { id: 's61', text: "L'obscurité ne peut pas chasser l'obscurité ; seule la lumière peut le faire.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s61/1080/1920" },
  { id: 's62', text: "La haine ne peut pas chasser la haine ; seul l'amour peut le faire.", author: "Martin Luther King Jr.", category: "Love", isAI: false, imageUrl: "https://picsum.photos/seed/s62/1080/1920" },
  { id: 's63', text: "La liberté n'est jamais donnée volontairement par l'oppresseur ; elle doit être exigée par l'opprimé.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s63/1080/1920" },
  { id: 's64', text: "Nos vies commencent à finir le jour où nous devenons silencieux sur les choses qui comptent.", author: "Martin Luther King Jr.", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s64/1080/1920" },
  { id: 's65', text: "L'injustice où qu'elle soit est une menace pour la justice partout.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s65/1080/1920" },
  { id: 's66', text: "La foi, c'est faire le premier pas même quand on ne voit pas tout l'escalier.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s66/1080/1920" },
  { id: 's67', text: "À la fin, nous nous souviendrons non pas des mots de nos ennemis, mais du silence de nos amis.", author: "Martin Luther King Jr.", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s67/1080/1920" },
  { id: 's68', text: "Si vous ne pouvez pas voler, alors courez ; si vous ne pouvez pas courir, alors marchez ; si vous ne pouvez pas marcher, alors rampez ; mais quoi que vous fassiez, vous devez continuer à avancer.", author: "Martin Luther King Jr.", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s68/1080/1920" },
  { id: 's69', text: "La vraie mesure d'un homme n'est pas sa position dans des moments de confort et de commodité, mais sa position dans des moments de défi et de controverse.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s69/1080/1920" },
  { id: 's70', text: "L'intelligence plus le caractère - c'est le but de la véritable éducation.", author: "Martin Luther King Jr.", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s70/1080/1920" },
  { id: 's71', text: "Soyez vous-même ; tous les autres sont déjà pris.", author: "Oscar Wilde", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s71/1080/1920" },
  { id: 's72', text: "Vivre est la chose la plus rare du monde. La plupart des gens existent, c'est tout.", author: "Oscar Wilde", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s72/1080/1920" },
  { id: 's73', text: "L'expérience est le nom que chacun donne à ses erreurs.", author: "Oscar Wilde", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s73/1080/1920" },
  { id: 's74', text: "On devrait toujours être amoureux. C'est la raison pour laquelle on ne devrait jamais se marier.", author: "Oscar Wilde", category: "Love", isAI: false, imageUrl: "https://picsum.photos/seed/s74/1080/1920" },
  { id: 's75', text: "Le cynisme, c'est l'art de voir les choses telles qu'elles sont, et non telles qu'elles devraient être.", author: "Oscar Wilde", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s75/1080/1920" },
  { id: 's76', text: "La seule façon de se débarrasser d'une tentation est d'y céder.", author: "Oscar Wilde", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s76/1080/1920" },
  { id: 's77', text: "Le succès est un mauvais professeur. Il pousse les gens intelligents à croire qu'ils ne peuvent pas perdre.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s77/1080/1920" },
  { id: 's78', text: "C'est bien de célébrer le succès, mais il est plus important de tenir compte des leçons de l'échec.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s78/1080/1920" },
  { id: 's79', text: "Vos clients les plus mécontents sont votre plus grande source d'apprentissage.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s79/1080/1920" },
  { id: 's80', text: "La vie n'est pas juste, habituez-vous-y.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s80/1080/1920" },
  { id: 's81', text: "Le monde ne se souciera pas de votre estime de soi. Le monde s'attendra à ce que vous accomplissiez quelque chose AVANT que vous ne vous sentiez bien dans votre peau.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s81/1080/1920" },
  { id: 's82', text: "Si vous pensez que votre professeur est dur, attendez d'avoir un patron.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s82/1080/1920" },
  { id: 's83', text: "Vendre des hamburgers n'est pas au-dessous de votre dignité. Vos grands-parents avaient un mot différent pour la vente de hamburgers : ils appelaient cela une opportunité.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s83/1080/1920" },
  { id: 's84', text: "Si vous vous plantez, ce n'est pas la faute de vos parents, alors ne gémissez pas sur vos erreurs, apprenez d'elles.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s84/1080/1920" },
  { id: 's85', text: "Avant votre naissance, vos parents n'étaient pas aussi ennuyeux qu'ils le sont maintenant. Ils sont devenus comme ça en payant vos factures, en nettoyant vos vêtements et en vous écoutant parler de la façon dont vous êtes cool.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s85/1080/1920" },
  { id: 's86', text: "Votre école a peut-être supprimé les gagnants et les perdants, mais la vie ne l'a pas fait.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s86/1080/1920" },
  { id: 's87', text: "La vie n'est pas divisée en semestres. Vous n'avez pas l'été de libre et très peu d'employeurs sont intéressés à vous aider à vous trouver. Trouvez-vous sur votre propre temps.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s87/1080/1920" },
  { id: 's88', text: "La télévision n'est PAS la vraie vie. Dans la vraie vie, les gens doivent quitter le café et aller travailler.", author: "Bill Gates", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s88/1080/1920" },
  { id: 's89', text: "Soyez gentil avec les geeks. Il y a de fortes chances que vous finissiez par travailler pour l'un d'eux.", author: "Bill Gates", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s89/1080/1920" },
  { id: 's90', text: "Le secret du succès est de savoir quelque chose que personne d'autre ne sait.", author: "Aristote Onassis", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s90/1080/1920" },
  { id: 's91', text: "La seule chose qui se dresse entre vous et votre objectif est l'histoire de merde que vous continuez à vous raconter sur la raison pour laquelle vous ne pouvez pas l'atteindre.", author: "Jordan Belfort", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s91/1080/1920" },
  { id: 's92', text: "Le succès n'est pas définitif, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Winston Churchill", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s92/1080/1920" },
  { id: 's93', text: "Le pessimiste voit la difficulté dans chaque opportunité. L'optimiste voit l'opportunité dans chaque difficulté.", author: "Winston Churchill", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s93/1080/1920" },
  { id: 's94', text: "Si vous traversez l'enfer, continuez.", author: "Winston Churchill", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s94/1080/1920" },
  { id: 's95', text: "On ne peut pas diriger le vent, mais on peut ajuster les voiles.", author: "Anonyme", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s95/1080/1920" },
  { id: 's96', text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s96/1080/1920" },
  { id: 's97', text: "Le seul endroit où le succès vient avant le travail est dans le dictionnaire.", author: "Vidal Sassoon", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s97/1080/1920" },
  { id: 's98', text: "Ne comptez pas les jours, faites que les jours comptent.", author: "Muhammad Ali", category: "Life", isAI: false, imageUrl: "https://picsum.photos/seed/s98/1080/1920" },
  { id: 's99', text: "L'impossible n'est qu'un mot dans le dictionnaire des imbéciles.", author: "Napoléon Bonaparte", category: "Success", isAI: false, imageUrl: "https://picsum.photos/seed/s99/1080/1920" },
  { id: 's100', text: "La vérité est le soleil de l'âme.", author: "Victor Hugo", category: "Wisdom", isAI: false, imageUrl: "https://picsum.photos/seed/s100/1080/1920" }
];

const DEFAULT_PROFILE: UserProfile = {
  avatarEmoji: '✨'
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'French',
  notificationsEnabled: false,
  notificationFrequency: 'daily',
  profile: DEFAULT_PROFILE,
  tutorialSeen: false
};

const CACHE_SIZE = 10;
const PREFETCH_THRESHOLD = 3;
const FREE_DAILY_LIMIT = 20;

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>(STARTER_QUOTES);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.FEED);
  const [loading, setLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aletheia_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [dailyCount, setDailyCount] = useState(() => {
    const saved = localStorage.getItem('daily_count');
    const today = new Date().toDateString();
    if (saved) {
      const { date, count } = JSON.parse(saved);
      return date === today ? count : 0;
    }
    return 0;
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenQuotesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const savedSeen = localStorage.getItem('seen_quotes');
    if (savedSeen) {
      const arr = JSON.parse(savedSeen);
      seenQuotesRef.current = new Set(arr);
    } else {
      STARTER_QUOTES.forEach(q => seenQuotesRef.current.add(q.text));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aletheia_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('daily_count', JSON.stringify({ date: today, count: dailyCount }));
  }, [dailyCount]);

  useEffect(() => {
    const arr = Array.from(seenQuotesRef.current).slice(-200); // Keep last 200 to avoid bloat
    localStorage.setItem('seen_quotes', JSON.stringify(arr));
  }, [quotes]);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['French'];

  const closeTutorial = () => {
    setSettings(prev => ({ ...prev, tutorialSeen: true }));
  };

  // Refresh feed when language changes
  useEffect(() => {
    const refreshFeed = async () => {
      setLoading(true);
      setQuotes([]);
      seenQuotesRef.current.clear();
      
      try {
        const newQuotes = await generateQuotes(5, settings.language, []);
        setQuotes(newQuotes);
        newQuotes.forEach(q => seenQuotesRef.current.add(q.text));
        fillImagesForQuotes(newQuotes);
      } catch (e) {
        setQuotes(STARTER_QUOTES);
      } finally {
        setLoading(false);
      }
    };
    
    // Only refresh if it's not the first load (starter quotes are French)
    if (settings.language !== 'French' || quotes.length === 0) {
      refreshFeed();
    }
  }, [settings.language]);

  const getCachedPool = (): Quote[] => {
    try {
      const pool = localStorage.getItem('quote_pool');
      return pool ? JSON.parse(pool) : [];
    } catch { return []; }
  };

  const saveCachedPool = (pool: Quote[]) => {
    try {
      // Strip large base64 images before saving to localStorage to save space
      const optimizedPool = pool.map(q => ({
        ...q,
        imageUrl: q.imageUrl?.startsWith('data:') ? undefined : q.imageUrl
      })).slice(0, 10); // Limit to 10 items max in cache
      
      localStorage.setItem('quote_pool', JSON.stringify(optimizedPool));
    } catch (e) {
      console.warn("LocalStorage full, clearing pool cache");
      localStorage.removeItem('quote_pool');
    }
  };

  const fillImagesForQuotes = useCallback(async (batch: Quote[]) => {
    for (const q of batch) {
      if (!q.imageUrl) {
        try {
          const url = await generateQuoteImage(q.text);
          setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, imageUrl: url } : item));
          const pool = getCachedPool();
          const updatedPool = pool.map(item => item.id === q.id ? { ...item, imageUrl: url } : item);
          saveCachedPool(updatedPool);
        } catch (err) {
          console.error("Image generation failed for", q.id, err);
        }
      }
    }
  }, []);

  const syncLikesWithCloud = useCallback(async (likes: Quote[]) => {
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes })
      });
    } catch (e) {
      console.error("Failed to sync likes", e);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        
        // Sync likes from cloud
        const likesRes = await fetch("/api/likes");
        if (likesRes.ok) {
          const cloudLikes = await likesRes.json();
          setLikedQuotes(prev => {
            // Merge local and cloud likes, avoiding duplicates by text
            const localMap = new Map(prev.map(q => [q.text, q]));
            cloudLikes.forEach((q: Quote) => localMap.set(q.text, q));
            const merged = Array.from(localMap.values());
            localStorage.setItem('liked_quotes', JSON.stringify(merged));
            
            // If local had more, sync back to cloud
            if (merged.length > cloudLikes.length) {
              syncLikesWithCloud(merged);
            }
            
            return merged;
          });
          
          // Update current quotes isLiked status
          setQuotes(prev => prev.map(q => ({
            ...q,
            isLiked: cloudLikes.some((l: Quote) => l.text === q.text)
          })));
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=500,height=600');
    } catch (e) {
      console.error("Login error", e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const handleBuyCredits = async () => {
    try {
      const res = await fetch("/api/payments/create-subscription", { method: "POST" });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error("Payment error", e);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    fetchUser();
    return () => window.removeEventListener('message', handleMessage);
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
    
    // Simplified check for Vite/Browser compatibility
    const apiKey = process.env.GEMINI_API_KEY;
    const hasKey = apiKey && apiKey !== "undefined" && apiKey !== "";
    
    if (!hasKey) {
      setApiAvailable(false);
      return;
    }

    // Check credits if logged in
    if (user && user.credits <= 0) {
      setApiAvailable(false);
      return;
    }

    setIsGeneratingMore(true);
    try {
      const more = await generateQuotes(CACHE_SIZE, lang, Array.from(seenQuotesRef.current));
      
      if (more.length === 0) {
        console.log("No quotes generated this time");
        return;
      }

      // Deduct credit on backend if logged in
      if (user) {
        const res = await fetch("/api/credits/deduct", { method: "POST" });
        if (res.ok) {
          const { credits } = await res.json();
          setUser((prev: User | null) => prev ? { ...prev, credits } : null);
        }
      }

      const currentPool = getCachedPool();
      const updatedPool = [...currentPool, ...more].slice(0, 15);
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
    } catch (err) {
      console.error("Prefetch error", err);
      // We don't setApiAvailable(false) here to allow future retries
    } finally {
      setIsGeneratingMore(false);
    }
  }, [isGeneratingMore, apiAvailable, fillImagesForQuotes]);

  const handleLike = useCallback((quoteToLike: Quote) => {
    const id = quoteToLike.id;
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, isLiked: !q.isLiked } : q));
    setLikedQuotes(prev => {
      const exists = prev.find(l => l.text === quoteToLike.text);
      let updated;
      if (exists) {
        updated = prev.filter(l => l.text !== quoteToLike.text);
      } else {
        updated = [{ ...quoteToLike, isLiked: true }, ...prev];
      }
      localStorage.setItem('liked_quotes', JSON.stringify(updated));
      if (user) syncLikesWithCloud(updated);
      return updated;
    });
  }, [user, syncLikesWithCloud]);

  const handleRemoveLike = (text: string) => {
    setLikedQuotes(prev => {
      const updated = prev.filter(l => l.text !== text);
      localStorage.setItem('liked_quotes', JSON.stringify(updated));
      if (user) syncLikesWithCloud(updated);
      return updated;
    });
    setQuotes(prev => prev.map(q => q.text === text ? { ...q, isLiked: false } : q));
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPosition = scrollTop + clientHeight;
    
    // Check daily limit for free users
    const isPro = user && (user.credits > 0 || user.isPremium);
    if (!isPro && dailyCount >= FREE_DAILY_LIMIT) {
      return;
    }

    if (activeTab === AppTab.FEED && scrollHeight - scrollPosition < clientHeight * 3) {
      const pool = getCachedPool();
      if (pool.length > 0) {
        const nextBatch = pool.slice(0, 2);
        nextBatch.forEach(q => seenQuotesRef.current.add(q.text));
        setQuotes(prev => [...prev, ...nextBatch]);
        setDailyCount((prev: number) => prev + nextBatch.length);
        saveCachedPool(pool.slice(2));
        fillImagesForQuotes(nextBatch);
      }
      
      if (pool.length < PREFETCH_THRESHOLD && apiAvailable) {
        prefetchQuotes(settings.language);
      }
    }
  }, [activeTab, settings.language, prefetchQuotes, fillImagesForQuotes, apiAvailable, dailyCount, user]);

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
    <div className="relative w-full bg-zinc-900 overflow-hidden font-sans" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      
      {/* Immersive View: No App Name Header */}

      {/* Main Feed Layer */}
      <div className={`tab-transition h-full ${activeTab === AppTab.FEED ? 'opacity-100' : 'opacity-0 pointer-events-none scale-95'}`}>
        <div ref={scrollRef} onScroll={handleScroll} className="snap-container bg-zinc-900" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onLike={() => handleLike(quote)} onShare={() => {}} language={settings.language} />
            ))
          ) : (
             <div className="h-full w-full flex items-center justify-center bg-black">
                <div className="text-white/20 font-ancient uppercase tracking-widest text-[10px] animate-pulse">
                  RECHERCHE DE VÉRITÉ...
                </div>
             </div>
          )}
          
          {/* Daily Limit Message */}
          {!(user && (user.credits > 0 || user.isPremium)) && dailyCount >= FREE_DAILY_LIMIT && (
            <div className="snap-item flex flex-col items-center justify-center bg-black p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-white/70 font-ancient text-[12px] tracking-[0.4em] uppercase leading-loose mb-6">
                Limite journalière atteinte
              </p>
              <p className="text-white/30 text-[10px] leading-relaxed mb-10 max-w-xs">
                Vous avez exploré 20 vérités aujourd'hui. Connectez-vous ou passez au forfait Premium pour une sagesse illimitée.
              </p>
              <button 
                onClick={() => setActiveTab(AppTab.SETTINGS)}
                className="px-8 py-4 bg-white text-black font-ancient text-[10px] tracking-[0.3em] uppercase rounded-full"
              >
                Débloquer l'infini
              </button>
            </div>
          )}
          {isGeneratingMore && apiAvailable && (
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
          {!apiAvailable && (
            <div className="snap-item flex flex-col items-center justify-center bg-black p-12 text-center">
              <div className="w-12 h-[1px] bg-white/10 mb-8" />
              <p className="text-white/30 font-ancient text-[10px] tracking-[0.4em] uppercase leading-loose">
                Vous avez atteint les limites de la sagesse actuelle.
              </p>
              <p className="mt-4 text-white/10 text-[8px] uppercase tracking-widest">
                Revenez plus tard pour de nouvelles vérités.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liked Gallery Layer */}
      <div className={`tab-transition absolute inset-0 overflow-y-auto bg-[#050505] pt-32 pb-48 px-8 scrollbar-hide ${activeTab === AppTab.LIKED ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`} style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
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
      <SettingsPage 
        settings={settings} 
        onUpdate={setSettings} 
        isActive={activeTab === AppTab.SETTINGS} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onBuyCredits={handleBuyCredits}
      />

      {/* Liked Gallery Layer */}

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

      {/* Tutorial Overlay */}
      {!settings.tutorialSeen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-12 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <h2 className="text-white font-ancient text-3xl tracking-[0.3em] uppercase mb-6">Bienvenue sur Aletheia</h2>
          <p className="text-white/40 text-[11px] tracking-widest leading-loose mb-12 max-w-xs">
            Faites glisser vers le haut pour découvrir de nouvelles vérités. Double-cliquez pour aimer une citation.
          </p>
          <button 
            onClick={closeTutorial}
            className="px-12 py-5 bg-white text-black font-ancient text-[10px] tracking-[0.4em] uppercase rounded-full hover:scale-105 transition-transform"
          >
            Commencer l'éveil
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
