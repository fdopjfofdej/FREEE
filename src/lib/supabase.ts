import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': import.meta.env.VITE_APP_NAME,
      'x-application-version': import.meta.env.VITE_APP_VERSION,
    },
  },
  db: {
    schema: 'public',
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check for network errors
  if (error?.message?.includes('Failed to fetch')) {
    return {
      title: "Erreur de connexion",
      description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.",
    }
  }

  // Check for duplicate user errors
  if (error?.message?.includes('User already registered') || 
      error?.message?.includes('already been registered')) {
    return {
      title: "Utilisateur déjà inscrit",
      description: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.",
    }
  }

  // Check for invalid credentials
  if (error?.message?.includes('Invalid login credentials') || 
      error?.code === 'invalid_credentials') {
    return {
      title: "Identifiants incorrects",
      description: "Email ou mot de passe incorrect. Veuillez réessayer.",
    }
  }

  // Check for rate limiting
  if (error?.status === 429 || (error?.message && error?.message.includes('rate limit'))) {
    return {
      title: "Trop de tentatives",
      description: "Vous avez effectué trop de tentatives. Veuillez réessayer plus tard.",
    }
  }

  // Database errors
  if (error?.message?.includes('Database error')) {
    return {
      title: "Erreur de base de données",
      description: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer plus tard.",
    }
  }

  // Unexpected errors
  if (error?.code === 'unexpected_failure') {
    return {
      title: "Erreur inattendue",
      description: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
    }
  }

  // Default error message
  return {
    title: "Erreur",
    description: error?.message || error?.error_description || "Une erreur inattendue est survenue",
  }
}