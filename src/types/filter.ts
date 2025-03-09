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
  searchTerms?: string;
  city?: string;
  garantie?: boolean;
}