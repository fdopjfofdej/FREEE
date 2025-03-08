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
}