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
import { NotFound } from "./pages/not-found";

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
        <Route path="/fr/ads/:slug" element={<CarDetails />} />
        <Route path="/fr/my-ads" element={<MyListings />} />
        <Route path="/fr/create-ad" element={<CreateListing />} />
        <Route path="/fr/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/fr/dashboard" element={<AdminPanel />} />

        {/* German Routes */}
        <Route path="/de" element={<Home user={user} />} />
        <Route path="/de/ads/:slug" element={<CarDetails />} />
        <Route path="/de/my-ads" element={<MyListings />} />
        <Route path="/de/create-ad" element={<CreateListing />} />
        <Route path="/de/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/de/dashboard" element={<AdminPanel />} />

        {/* English Routes */}
        <Route path="/en" element={<Home user={user} />} />
        <Route path="/en/ads/:slug" element={<CarDetails />} />
        <Route path="/en/my-ads" element={<MyListings />} />
        <Route path="/en/create-ad" element={<CreateListing />} />
        <Route path="/en/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/en/dashboard" element={<AdminPanel />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}
