// Mock data for the entire application

export interface Field {
  id: number;
  name: string;
  status: 'active' | 'maintenance';
}

export interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
}

export interface FieldReservation {
  id: string;
  fieldId: number;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
}

export interface HallReservation {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  eventType: string;
  guestCount: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  date: string;
  time: string;
  endTime?: string;
  category: 'movie' | 'gaming' | 'party' | 'kids' | 'tournament' | 'special';
  price: number;
  maxCapacity: number;
  currentReservations: number;
  location: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface EventReservation {
  id: string;
  eventId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: 'new' | 'processed' | 'archived';
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
}

// ============== MOCK DATA ==============

export const fields: Field[] = [
  { id: 1, name: "Terrain 1", status: 'active' },
  { id: 2, name: "Terrain 2", status: 'active' },
];

export const timeSlots: TimeSlot[] = [
  { id: "1", time: "06:00", duration: 90 },
  { id: "2", time: "07:30", duration: 90 },
  { id: "3", time: "09:00", duration: 90 },
  { id: "4", time: "10:30", duration: 90 },
  { id: "5", time: "12:00", duration: 90 },
  { id: "6", time: "13:30", duration: 90 },
  { id: "7", time: "15:00", duration: 90 },
  { id: "8", time: "16:30", duration: 90 },
  { id: "9", time: "18:00", duration: 90 },
  { id: "10", time: "19:30", duration: 90 },
  { id: "11", time: "21:00", duration: 90 },
  { id: "12", time: "22:30", duration: 90 },
];

export const fieldReservations: FieldReservation[] = [
  { id: "fr1", fieldId: 1, date: "2026-01-20", timeSlot: "09:00", customerName: "Ahmed Ben Ali", customerPhone: "0555123456", status: 'confirmed', createdAt: "2026-01-18T10:00:00Z" },
  { id: "fr2", fieldId: 1, date: "2026-01-20", timeSlot: "18:00", customerName: "Mohamed Khelifi", customerPhone: "0555789012", status: 'confirmed', createdAt: "2026-01-18T14:00:00Z" },
  { id: "fr3", fieldId: 2, date: "2026-01-20", timeSlot: "15:00", customerName: "Youcef Mansouri", customerPhone: "0555345678", status: 'pending', createdAt: "2026-01-19T09:00:00Z" },
  { id: "fr4", fieldId: 1, date: "2026-01-21", timeSlot: "19:30", customerName: "Karim Benali", customerPhone: "0555901234", status: 'confirmed', createdAt: "2026-01-19T16:00:00Z" },
  { id: "fr5", fieldId: 2, date: "2026-01-22", timeSlot: "10:30", customerName: "Sofiane Hadj", customerPhone: "0555567890", status: 'pending', createdAt: "2026-01-20T08:00:00Z" },
];

export const hallReservations: HallReservation[] = [
  { id: "hr1", date: "2026-01-25", customerName: "Famille Boudiaf", customerPhone: "0555111222", eventType: "Mariage", guestCount: 150, status: 'confirmed', createdAt: "2026-01-10T10:00:00Z" },
  { id: "hr2", date: "2026-01-26", customerName: "Amina Kaddour", customerPhone: "0555333444", eventType: "Fiançailles", guestCount: 80, status: 'confirmed', createdAt: "2026-01-12T14:00:00Z" },
  { id: "hr3", date: "2026-02-01", customerName: "Entreprise TechDZ", customerPhone: "0555555666", eventType: "Réunion d'entreprise", guestCount: 50, message: "Besoin de matériel de projection", status: 'pending', createdAt: "2026-01-15T09:00:00Z" },
  { id: "hr4", date: "2026-02-14", customerName: "Famille Zeroual", customerPhone: "0555777888", eventType: "Anniversaire", guestCount: 100, status: 'confirmed', createdAt: "2026-01-18T11:00:00Z" },
];

export const menuCategories: MenuCategory[] = [
  { id: "cat1", name: "Boissons Chaudes", icon: "Coffee", order: 1, isActive: true },
  { id: "cat2", name: "Boissons Fraîches", icon: "IceCream", order: 2, isActive: true },
  { id: "cat3", name: "Snacks & Sandwichs", icon: "UtensilsCrossed", order: 3, isActive: true },
  { id: "cat4", name: "Plats du Jour", icon: "Wine", order: 4, isActive: true },
  { id: "cat5", name: "Pâtisseries & Desserts", icon: "Cake", order: 5, isActive: true },
];

export const menuItems: MenuItem[] = [
  // Boissons Chaudes
  { id: "mi1", categoryId: "cat1", name: "Café Express", price: 100, isActive: true },
  { id: "mi2", categoryId: "cat1", name: "Café Crème", price: 150, isActive: true },
  { id: "mi3", categoryId: "cat1", name: "Cappuccino", price: 200, isActive: true },
  { id: "mi4", categoryId: "cat1", name: "Thé à la menthe", price: 100, isActive: true },
  { id: "mi5", categoryId: "cat1", name: "Chocolat Chaud", price: 180, isActive: true },
  // Boissons Fraîches
  { id: "mi6", categoryId: "cat2", name: "Jus d'orange frais", price: 150, isActive: true },
  { id: "mi7", categoryId: "cat2", name: "Limonade maison", price: 120, isActive: true },
  { id: "mi8", categoryId: "cat2", name: "Smoothie fruits", price: 250, isActive: true },
  { id: "mi9", categoryId: "cat2", name: "Milkshake", price: 280, isActive: true },
  { id: "mi10", categoryId: "cat2", name: "Eau minérale", price: 60, isActive: true },
  // Snacks
  { id: "mi11", categoryId: "cat3", name: "Sandwich poulet", price: 350, isActive: true },
  { id: "mi12", categoryId: "cat3", name: "Panini thon", price: 300, isActive: true },
  { id: "mi13", categoryId: "cat3", name: "Croque-monsieur", price: 280, isActive: true },
  { id: "mi14", categoryId: "cat3", name: "Salade César", price: 400, isActive: true },
  { id: "mi15", categoryId: "cat3", name: "Pizza individuelle", price: 450, isActive: true },
  // Plats
  { id: "mi16", categoryId: "cat4", name: "Couscous (Vendredi)", price: 600, isActive: true },
  { id: "mi17", categoryId: "cat4", name: "Grillades mixtes", price: 800, isActive: true },
  { id: "mi18", categoryId: "cat4", name: "Escalope panée", price: 550, isActive: true },
  { id: "mi19", categoryId: "cat4", name: "Tajine poulet", price: 650, isActive: true },
  { id: "mi20", categoryId: "cat4", name: "Pâtes bolognaise", price: 450, isActive: true },
  // Pâtisseries
  { id: "mi21", categoryId: "cat5", name: "Croissant", price: 80, isActive: true },
  { id: "mi22", categoryId: "cat5", name: "Pain au chocolat", price: 100, isActive: true },
  { id: "mi23", categoryId: "cat5", name: "Gâteau du jour", price: 150, isActive: true },
  { id: "mi24", categoryId: "cat5", name: "Crêpe Nutella", price: 200, isActive: true },
  { id: "mi25", categoryId: "cat5", name: "Glace (2 boules)", price: 180, isActive: true },
];

export const events: Event[] = [
  {
    id: "ev1",
    slug: "soiree-cinema-plein-air",
    title: "Soirée Cinéma en Plein Air",
    description: "Venez profiter d'une projection de film sous les étoiles avec popcorn et boissons offertes.",
    longDescription: "Rejoignez-nous pour une soirée cinéma exceptionnelle en plein air ! Installez-vous confortablement sur nos poufs géants et profitez d'un film culte projeté sur grand écran. Popcorn, boissons et bonne ambiance garantis. Amenez vos couvertures pour plus de confort !",
    image: "/placeholder.svg",
    date: "2026-01-25",
    time: "19:00",
    endTime: "22:00",
    category: "movie",
    price: 500,
    maxCapacity: 100,
    currentReservations: 45,
    location: "Espace extérieur",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "ev2",
    slug: "tournoi-fifa-2026",
    title: "Tournoi FIFA 2026",
    description: "Affrontez les meilleurs joueurs de la région dans notre tournoi FIFA avec des prix à gagner !",
    longDescription: "Le plus grand tournoi FIFA de la région ! 32 joueurs s'affronteront dans une compétition intense. Inscrivez-vous et tentez de remporter le titre de champion ainsi que des prix exceptionnels. Restauration sur place.",
    image: "/placeholder.svg",
    date: "2026-01-28",
    time: "14:00",
    endTime: "20:00",
    category: "gaming",
    price: 1000,
    maxCapacity: 32,
    currentReservations: 28,
    location: "Salle de jeux",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "ev3",
    slug: "fete-enfants-carnaval",
    title: "Fête des Enfants - Carnaval",
    description: "Une après-midi de magie pour les enfants avec clown, maquillage et jeux gonflables.",
    longDescription: "Offrez à vos enfants une après-midi inoubliable ! Au programme : spectacle de clown, ateliers de maquillage, structures gonflables, et bien plus encore. Goûter inclus pour tous les enfants.",
    image: "/placeholder.svg",
    date: "2026-02-01",
    time: "14:00",
    endTime: "18:00",
    category: "kids",
    price: 800,
    maxCapacity: 50,
    currentReservations: 35,
    location: "Salle des fêtes",
    isActive: true,
    isFeatured: false,
  },
  {
    id: "ev4",
    slug: "tournoi-mini-foot-inter-quartiers",
    title: "Tournoi Mini-Foot Inter-Quartiers",
    description: "Le grand tournoi annuel opposant les équipes des différents quartiers d'El Alia.",
    longDescription: "Le rendez-vous incontournable des footballeurs d'El Alia ! 16 équipes représentant les différents quartiers s'affronteront pour le titre. Inscrivez votre équipe et venez supporter vos favoris !",
    image: "/placeholder.svg",
    date: "2026-02-08",
    time: "09:00",
    endTime: "18:00",
    category: "tournament",
    price: 5000,
    maxCapacity: 16,
    currentReservations: 12,
    location: "Terrains 1 & 2",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "ev5",
    slug: "soiree-speciale-saint-valentin",
    title: "Soirée Spéciale Saint-Valentin",
    description: "Un dîner romantique aux chandelles avec musique live et menu spécial.",
    longDescription: "Célébrez l'amour dans un cadre magique ! Menu gastronomique spécialement conçu pour l'occasion, musique live, décoration romantique et surprises pour les couples. Réservation obligatoire.",
    image: "/placeholder.svg",
    date: "2026-02-14",
    time: "19:00",
    endTime: "23:00",
    category: "special",
    price: 3500,
    maxCapacity: 30,
    currentReservations: 18,
    location: "Café-Restaurant",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "ev6",
    slug: "apres-midi-jeux-de-societe",
    title: "Après-midi Jeux de Société",
    description: "Découvrez notre collection de jeux de société dans une ambiance conviviale.",
    longDescription: "Passionnés de jeux de société ou simple curieux, cette après-midi est faite pour vous ! Venez découvrir notre collection de plus de 50 jeux et rencontrer d'autres joueurs. Boissons et encas disponibles.",
    image: "/placeholder.svg",
    date: "2026-02-15",
    time: "14:00",
    endTime: "19:00",
    category: "gaming",
    price: 300,
    maxCapacity: 40,
    currentReservations: 15,
    location: "Café-Restaurant",
    isActive: true,
    isFeatured: false,
  },
];

export const eventReservations: EventReservation[] = [
  { id: "er1", eventId: "ev1", customerName: "Famille Benmoussa", customerPhone: "0555112233", attendees: 4, status: 'confirmed', createdAt: "2026-01-18T10:00:00Z" },
  { id: "er2", eventId: "ev1", customerName: "Rachid Hamidi", customerPhone: "0555445566", customerEmail: "r.hamidi@email.com", attendees: 2, status: 'confirmed', createdAt: "2026-01-19T14:00:00Z" },
  { id: "er3", eventId: "ev2", customerName: "Amine Bouaziz", customerPhone: "0555778899", attendees: 1, status: 'confirmed', createdAt: "2026-01-20T09:00:00Z" },
  { id: "er4", eventId: "ev3", customerName: "Sarah Khelil", customerPhone: "0555001122", attendees: 3, status: 'pending', createdAt: "2026-01-20T11:00:00Z" },
  { id: "er5", eventId: "ev4", customerName: "Équipe Quartier Nord", customerPhone: "0555334455", attendees: 7, status: 'confirmed', createdAt: "2026-01-15T16:00:00Z" },
];

export const contactMessages: ContactMessage[] = [
  { id: "cm1", name: "Farida Slimane", phone: "0555667788", email: "farida.s@email.com", subject: "Organisation d'événement", message: "Je souhaite organiser un anniversaire surprise pour 40 personnes début mars. Pouvez-vous me contacter ?", status: 'new', createdAt: "2026-01-20T08:00:00Z" },
  { id: "cm2", name: "Mehdi Boukhris", phone: "0555990011", subject: "Réservation terrain", message: "Est-il possible de réserver un terrain pour une ligue amateur chaque dimanche matin ?", status: 'processed', createdAt: "2026-01-19T15:00:00Z" },
  { id: "cm3", name: "Lamia Cherif", phone: "0555223344", email: "lamia.c@email.com", subject: "Commande café-restaurant", message: "Nous organisons un séminaire et souhaitons commander des plateaux repas pour 25 personnes.", status: 'new', createdAt: "2026-01-20T10:00:00Z" },
];

export const admins: Admin[] = [
  { id: "admin1", username: "admin", email: "admin@parcbayouta.dz", role: 'admin' },
  { id: "admin2", username: "staff1", email: "staff@parcbayouta.dz", role: 'staff' },
];

// Helper functions
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    movie: 'Cinéma',
    gaming: 'Gaming',
    party: 'Soirée',
    kids: 'Enfants',
    tournament: 'Tournoi',
    special: 'Spécial',
  };
  return labels[category] || 'Événement';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    movie: 'bg-purple-500/10 text-purple-600',
    gaming: 'bg-blue-500/10 text-blue-600',
    party: 'bg-pink-500/10 text-pink-600',
    kids: 'bg-orange-500/10 text-orange-600',
    tournament: 'bg-green-500/10 text-green-600',
    special: 'bg-amber-500/10 text-amber-600',
  };
  return colors[category] || 'bg-primary/10 text-primary';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    confirmed: 'bg-green-500/10 text-green-600',
    canceled: 'bg-red-500/10 text-red-600',
    new: 'bg-blue-500/10 text-blue-600',
    processed: 'bg-green-500/10 text-green-600',
    archived: 'bg-gray-500/10 text-gray-600',
    blocked: 'bg-destructive/10 text-destructive',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusLabel = (status: 'pending' | 'confirmed' | 'canceled' | 'new' | 'processed' | 'archived' | 'blocked'): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    canceled: 'Annulé',
    new: 'Nouveau',
    processed: 'Traité',
    archived: 'Archivé',
    blocked: 'Bloqué',
  };
  return labels[status];
};
