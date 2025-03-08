import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(amount);
}

/**
 * Creates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param text The text to truncate
 * @param length The maximum length
 * @returns The truncated text
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generates a meta description from car details
 * @param car The car object
 * @returns A formatted meta description
 */
export function generateMetaDescription(car: any): string {
  if (!car) return '';
  
  const details = [
    `${car.brand} ${car.model} ${car.year}`,
    `${car.mileage} km`,
    car.carburant,
    car.transmission,
    car.puissance ? `${car.puissance} ch` : null,
  ].filter(Boolean).join(', ');
  
  const description = car.description 
    ? truncate(car.description, 80)
    : 'Annonce automobile sur FreeAuto';
    
  return `${details}. ${description}`;
}