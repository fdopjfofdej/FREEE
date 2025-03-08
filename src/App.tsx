import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Home from '@/pages/home'
import { CarDetails } from '@/pages/car-details'
import { MyListings } from '@/pages/my-listings'
import CreateListing from '@/pages/create-listing'
import EditListing from '@/pages/edit-listing'
import AdminPanel from '@/pages/admin'

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check current auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/annonce/:id" element={<CarDetails />} />
        <Route path="/annonce/:id/:slug" element={<CarDetails />} />
        <Route path="/mes-annonces" element={<MyListings />} />
        <Route path="/creer-annonce" element={<CreateListing />} />
        <Route path="/modifier-annonce/:id" element={<EditListing />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <Toaster />
    </>
  )
}