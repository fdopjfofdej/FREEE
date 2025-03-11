import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Home from "@/pages/home";
import { CarDetails } from "@/pages/car-details";
import { MyListings } from "@/pages/my-listings";
import CreateListing from "@/pages/create-listing";
import EditListing from "@/pages/edit-listing";
import AdminPanel from "@/pages/admin";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("selectedLanguage")) {
      if (window.location.pathname.includes("/de")) {
        localStorage.setItem("selectedLanguage", "de");
        window.location.reload();
      } else if (window.location.pathname.includes("/fr")) {
        localStorage.setItem("selectedLanguage", "fr");
        window.location.reload();
      } else if (window.location.pathname.includes("/en")) {
        localStorage.setItem("selectedLanguage", "en");
        window.location.reload();
      } else if (window.location.pathname === "/") {
        localStorage.setItem("selectedLanguage", "fr");
        navigate("/fr");
      }
    }
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/fr" />} />

        {/* French Routes */}
        <Route path="/fr" element={<Home user={user} />} />
        <Route path="/fr/annonce/:slug" element={<CarDetails />} />
        <Route path="/fr/mes-annonces" element={<MyListings />} />
        <Route path="/fr/creer-annonce" element={<CreateListing />} />
        <Route path="/fr/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/fr/admin" element={<AdminPanel />} />

        {/* German Routes */}
        <Route path="/de" element={<Home user={user} />} />
        <Route path="/de/annonce/:slug" element={<CarDetails />} />
        <Route path="/de/mes-annonces" element={<MyListings />} />
        <Route path="/de/creer-annonce" element={<CreateListing />} />
        <Route path="/de/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/de/admin" element={<AdminPanel />} />

        {/* English Routes */}
        <Route path="/en" element={<Home user={user} />} />
        <Route path="/en/annonce/:slug" element={<CarDetails />} />
        <Route path="/en/mes-annonces" element={<MyListings />} />
        <Route path="/en/creer-annonce" element={<CreateListing />} />
        <Route path="/en/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/en/admin" element={<AdminPanel />} />
      </Routes>
      <Toaster />
    </>
  );
}
