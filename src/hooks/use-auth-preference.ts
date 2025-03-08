import { useState, useEffect } from 'react';

const COOKIE_NAME = 'auth_preference';
const COOKIE_EXPIRY_DAYS = 30;

export function useAuthPreference() {
  const [showPaywall, setShowPaywall] = useState(true);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà fait un choix
    const preference = getCookie(COOKIE_NAME);
    if (preference === 'skip') {
      setShowPaywall(false);
    }
  }, []);

  const skipPaywall = () => {
    // Enregistre le choix dans un cookie
    setCookie(COOKIE_NAME, 'skip', COOKIE_EXPIRY_DAYS);
    setShowPaywall(false);
  };

  return {
    showPaywall,
    setShowPaywall,
    skipPaywall,
  };
}

// Fonction utilitaire pour définir un cookie
function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

// Fonction utilitaire pour lire un cookie
function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}