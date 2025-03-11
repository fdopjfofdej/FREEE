export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  mileage: number;
  brand: string;
  model: string;
  images: string[];
  user_id: string;
  created_at: string;
  type_vehicule?: string;
  carburant?: string;
  transmission?: string;
  puissance?: number;
  cylindree?: number;
  portes?: number;
  places?: number;
  couleur?: string;
  premiere_main?: boolean;
  garantie?: number;
  options?: string[];
  phone_number: string;
  expertisee?: boolean;
  is_professional?: boolean;
  company_name?: string;
  consommation?: number;
  location?: string;
  city?: string;
  slug?: string;
}

export interface CarFilter {
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  brands?: string[];
  type_vehicule?: string[];
  carburant?: string[];
  transmission?: string[];
  minPuissance?: number;
  maxPuissance?: number;
  portes?: number;
  places?: number;
  couleur?: string[];
  premiere_main?: boolean;
  expertisee?: boolean;
  is_professional?: boolean;
  searchTerms?: string[];
  city?: string;
  garantie?: boolean;
}

export interface CarQueryVehicle {
  make_id: string;
  make_display: string;
  model_name: string;
  model_year: string;
}

export interface CitySearchResult {
  display_name: string;
  lat: string;
  lon: string;
  zip?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  banned_until: string | null;
  role: 'user' | 'admin';
}

export interface CarReport {
  id: string;
  car_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export const TYPE_VEHICULES = [
  "Berline",
  "Break",
  "Cabriolet",
  "Coupé",
  "SUV",
  "Monospace",
  "Citadine",
  "4x4",
  "Pick-up",
] as const;

export const CARBURANTS = [
  "Essence",
  "Diesel",
  "Hybride",
  "Électrique",
  "GPL",
  "Hydrogène",
] as const;

export const TRANSMISSIONS = [
  "Manuelle",
  "Automatique",
  "Semi-automatique",
] as const;

export const COULEURS = [
  "Noir",
  "Blanc",
  "Gris",
  "Argent",
  "Bleu",
  "Rouge",
  "Vert",
  "Jaune",
  "Marron",
  "Beige",
  "Orange",
] as const;

export const OPTIONS = [
  "Climatisation",
  "GPS",
  "Toit ouvrant",
  "Sièges chauffants",
  "Caméra de recul",
  "Régulateur de vitesse",
  "Bluetooth",
  "Jantes alu",
  "Aide au stationnement",
  "Phares LED",
  "Système Start/Stop",
  "Vitres électriques",
  "Rétroviseurs électriques",
  "Volant multifonction",
  "Apple CarPlay",
  "Android Auto",
] as const;

export const REPORT_REASONS = [
  { value: "fraudulent", label: "Annonce frauduleuse" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "misleading", label: "Information trompeuse" },
  { value: "duplicate", label: "Annonce en double" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Autre raison" },
] as const;