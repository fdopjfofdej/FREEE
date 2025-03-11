import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Car } from "@/types"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import CreateListing from "./create-listing"
import { useRedirectToLanguagePath } from "@/lib/utils"

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        toast({
          title: "Annonce introuvable",
          description: "Cette annonce n'existe pas ou a été supprimée",
          variant: "destructive",
        })
        navigate('/mes-annonces')
        return
      }

      // Vérifier que l'utilisateur est bien le propriétaire
      if (data.user_id !== user.id) {
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à modifier cette annonce",
          variant: "destructive",
        })
        navigate('/mes-annonces')
        return
      }

      setCar(data)
      setIsOwner(true)
    } catch (error) {
      console.error('Error fetching car:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement de l'annonce",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isOwner || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
          <p className="mt-2 text-gray-600">Vous n'êtes pas autorisé à modifier cette annonce.</p>
          <Button asChild className="mt-4">
            <Link to={useRedirectToLanguagePath("/mes-annonces")}>Retour à mes annonces</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <CreateListing initialData={car} />
}