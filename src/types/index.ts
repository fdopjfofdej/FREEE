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

export const SWISS_CITIES: CitySearchResult[] = [
  { display_name: "Zürich", zip: "8000", lat: "47.3769", lon: "8.5417" },
  { display_name: "Genève", zip: "1200", lat: "46.2044", lon: "6.1432" },
  { display_name: "Basel", zip: "4000", lat: "47.5596", lon: "7.5886" },
  { display_name: "Lausanne", zip: "1000", lat: "46.5197", lon: "6.6323" },
  { display_name: "Bern", zip: "3000", lat: "46.9480", lon: "7.4474" },
  { display_name: "Winterthur", zip: "8400", lat: "47.5000", lon: "8.7500" },
  { display_name: "Lucerne", zip: "6000", lat: "47.0502", lon: "8.3093" },
  { display_name: "St. Gallen", zip: "9000", lat: "47.4244", lon: "9.3767" },
  { display_name: "Lugano", zip: "6900", lat: "46.0037", lon: "8.9511" },
  { display_name: "Biel/Bienne", zip: "2500", lat: "47.1368", lon: "7.2467" },
  { display_name: "Thun", zip: "3600", lat: "46.7580", lon: "7.6280" },
  { display_name: "Bellinzona", zip: "6500", lat: "46.1947", lon: "9.0242" },
  { display_name: "Fribourg", zip: "1700", lat: "46.8032", lon: "7.1533" },
  { display_name: "Schaffhausen", zip: "8200", lat: "47.6957", lon: "8.6319" },
  { display_name: "Chur", zip: "7000", lat: "46.8500", lon: "9.5333" },
  { display_name: "Sion", zip: "1950", lat: "46.2333", lon: "7.3667" },
  { display_name: "Neuchâtel", zip: "2000", lat: "46.9900", lon: "6.9300" },
  { display_name: "Uster", zip: "8610", lat: "47.3500", lon: "8.7167" },
  { display_name: "Zug", zip: "6300", lat: "47.1667", lon: "8.5167" },
  { display_name: "Yverdon", zip: "1400", lat: "46.7783", lon: "6.6411" },
  { display_name: "Montreux", zip: "1820", lat: "46.4312", lon: "6.9107" },
  { display_name: "Rapperswil", zip: "8640", lat: "47.2267", lon: "8.8183" },
  { display_name: "Davos", zip: "7270", lat: "46.8011", lon: "9.8383" },
  { display_name: "Aarau", zip: "5000", lat: "47.3927", lon: "8.0443" },
  { display_name: "Vevey", zip: "1800", lat: "46.4628", lon: "6.8419" }
] as const;

export const REPORT_REASONS = [
  { value: "fraudulent", label: "Annonce frauduleuse" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "misleading", label: "Information trompeuse" },
  { value: "duplicate", label: "Annonce en double" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Autre raison" },
] as const;