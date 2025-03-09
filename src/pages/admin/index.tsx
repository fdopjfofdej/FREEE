import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AdminUser, Car, CarReport } from '@/types'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Car as CarIcon,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  AlertTriangle,
  Shield,
  ExternalLink,
  Lock
} from 'lucide-react'
import { formatDistance } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [cars, setCars] = useState<Car[]>([])
  const [reports, setReports] = useState<CarReport[]>([])
  const [pendingReportsCount, setPendingReportsCount] = useState(0)
  const [permissionError, setPermissionError] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/')
        return
      }

      // Vérifier si l'utilisateur est un admin en utilisant la fonction sécurisée
      const { data, error } = await supabase.rpc('is_admin_secure')

      if (error) {
        console.error('Error checking admin status:', error)
        setPermissionError(true)
        navigate('/')
        return
      }

      if (!data) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration",
          variant: "destructive",
        })
        navigate('/')
        return
      }

      setIsAdmin(true)
      fetchUsers()
      fetchData()
    } catch (error) {
      console.error('Error checking admin status:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Récupérer les profils depuis la table profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (profilesError) throw profilesError
      
      if (!profiles || profiles.length === 0) {
        setUsers([])
        return
      }
      
      try {
        // Récupérer les emails depuis la fonction RPC sécurisée
        const { data: emailsData, error: emailsError } = await supabase.rpc('get_user_emails')
        
        if (emailsError) {
          console.error('Error fetching emails:', emailsError)
          throw emailsError
        }
        
        // Créer un mapping des emails par ID
        const userEmails: Record<string, string> = {}
        if (emailsData && Array.isArray(emailsData)) {
          emailsData.forEach((item: any) => {
            if (item && item.id && item.email) {
              userEmails[item.id] = item.email
            }
          })
        }
        
        // Transformer les données pour correspondre au format AdminUser
        const formattedUsers: AdminUser[] = profiles.map(profile => ({
          id: profile.id,
          email: userEmails[profile.id] || `utilisateur-${profile.id.substring(0, 8)}`,
          created_at: profile.created_at,
          banned_until: profile.banned_until,
          role: profile.role || 'user'
        }))
        
        setUsers(formattedUsers)
      } catch (error) {
        // En cas d'erreur, on utilise des identifiants génériques
        console.error('Falling back to generic user IDs')
        const formattedUsers: AdminUser[] = profiles.map(profile => ({
          id: profile.id,
          email: `utilisateur-${profile.id.substring(0, 8)}`,
          created_at: profile.created_at,
          banned_until: profile.banned_until,
          role: profile.role || 'user'
        }))
        
        setUsers(formattedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    }
  }

  const banUser = async (userId: string, days: number) => {
    try {
      setActionLoading(userId)
      const banUntil = new Date()
      banUntil.setDate(banUntil.getDate() + days)

      const { error } = await supabase
        .from('profiles')
        .update({ banned_until: banUntil.toISOString() })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Utilisateur banni",
        description: `L'utilisateur a été banni pour ${days} jours`,
      })

      fetchUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      toast({
        title: "Erreur",
        description: "Impossible de bannir l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const unbanUser = async (userId: string) => {
    try {
      setActionLoading(userId)
      const { error } = await supabase
        .from('profiles')
        .update({ banned_until: null })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Utilisateur débanni",
        description: "L'utilisateur a été débanni avec succès",
      })

      fetchUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
      toast({
        title: "Erreur",
        description: "Impossible de débannir l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const makeAdmin = async (userId: string) => {
    try {
      setActionLoading(userId)
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Rôle modifié",
        description: "L'utilisateur est maintenant administrateur",
      })

      fetchUsers()
    } catch (error) {
      console.error('Error making user admin:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const removeAdmin = async (userId: string) => {
    try {
      setActionLoading(userId)
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Rôle modifié",
        description: "L'utilisateur n'est plus administrateur",
      })

      fetchUsers()
    } catch (error) {
      console.error('Error removing admin role:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch cars
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (carsError) throw carsError
      
      // Fetch reports
      const { data: reports, error: reportsError } = await supabase
        .from('car_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (reportsError) throw reportsError

      // Count pending reports
      try {
        const { data: pendingCount, error: countError } = await supabase.rpc('count_pending_reports')
        
        if (countError) throw countError
        setPendingReportsCount(pendingCount || 0)
      } catch (error) {
        console.error('Error counting pending reports:', error)
        // Fallback: count manually
        const pendingReports = reports?.filter(r => r.status === 'pending') || []
        setPendingReportsCount(pendingReports.length)
      }

      setCars(cars || [])
      setReports(reports || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    }
  }

  const deleteCar = async (carId: string) => {
    try {
      setActionLoading(carId)
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)

      if (error) throw error

      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès",
      })

      fetchData()
    } catch (error) {
      console.error('Error deleting car:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const resolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      setActionLoading(reportId)
      
      const { error } = await supabase.rpc('resolve_report', {
        p_report_id: reportId,
        p_status: status
      })

      if (error) throw error

      toast({
        title: "Signalement traité",
        description: "Le signalement a été traité avec succès",
      })

      fetchData()
    } catch (error) {
      console.error('Error resolving report:', error)
      toast({
        title: "Erreur",
        description: "Impossible de traiter le signalement",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (permissionError || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="mt-2 text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page d'administration.
          </p>
          <Button asChild className="w-full">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Administration</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Retour au site
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Utilisateurs
              </div>
            </TabsTrigger>
            <TabsTrigger value="cars" className="gap-2">
              <CarIcon className="h-4 w-4" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 relative">
              <Flag className="h-4 w-4" />
              Signalements
              {pendingReportsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1">
                  {pendingReportsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users
                      .filter(user => 
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.id.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.email}</TableCell>
                          <TableCell>
                            {formatDistance(new Date(user.created_at), new Date(), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <Badge variant="default" className="bg-primary">
                                Administrateur
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Utilisateur
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.banned_until && new Date(user.banned_until) > new Date() ? (
                              <Badge variant="destructive">
                                Banni jusqu'au {new Date(user.banned_until).toLocaleDateString()}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Actif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.banned_until && new Date(user.banned_until) > new Date() ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unbanUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Débannir
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={actionLoading === user.id}
                                      className="text-destructive border-destructive hover:bg-destructive/10"
                                    >
                                      {actionLoading === user.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Ban className="h-4 w-4 mr-2" />
                                          Bannir
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Bannir l'utilisateur</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Pour combien de temps souhaitez-vous bannir cet utilisateur ?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => banUser(user.id, 1)}
                                      >
                                        1 jour
                                      </AlertDialogAction>
                                      <AlertDialogAction
                                        onClick={() => banUser(user.id, 7)}
                                      >
                                        7 jours
                                      </AlertDialogAction>
                                      <AlertDialogAction
                                        onClick={() => banUser(user.id, 30)}
                                      >
                                        30 jours
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
      
                              {user.role === 'admin' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAdmin(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Retirer admin
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => makeAdmin(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Faire admin
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cars" className="mt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars
                    .filter(car => 
                      car.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(car => (
                      <TableRow key={car.id}>
                        <TableCell>{car.title}</TableCell>
                        <TableCell>
                          {users.find(u => u.id === car.user_id)?.email || car.user_id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          {formatDistance(new Date(car.created_at), new Date(), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/annonce/${car.id}`)}
                            >
                              Voir
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={actionLoading === car.id}
                                >
                                  {actionLoading === car.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Supprimer"
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Supprimer l'annonce
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCar(car.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Annonce</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports
                    .filter(report => 
                      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (report.details && report.details.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(report => {
                      const car = cars.find(c => c.id === report.car_id)
                      const reporter = users.find(u => u.id === report.reporter_id)
                      
                      // Traduire les raisons
                      const reasonLabels: Record<string, string> = {
                        'fraudulent': 'Annonce frauduleuse',
                        'inappropriate': 'Contenu inapproprié',
                        'misleading': 'Information trompeuse',
                        'duplicate': 'Annonce en double',
                        'spam': 'Spam',
                        'other': 'Autre raison'
                      }
                      
                      return (
                        <TableRow key={report.id} className={report.status === 'pending' ? 'bg-yellow-50' : ''}>
                          <TableCell>
                            {car ? (
                              <div className="flex flex-col">
                                <span>{car.title}</span>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0 h-auto justify-start text-xs text-muted-foreground"
                                  onClick={() => window.open(`/annonce/${car.id}`, '_blank')}
                                >
                                  Voir l'annonce <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Annonce supprimée</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {reasonLabels[report.reason] || report.reason}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {report.details || <span className="text-muted-foreground italic">Aucun détail</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {formatDistance(new Date(report.created_at), new Date(), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                par {reporter?.email || report.reporter_id.substring(0, 8)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === 'pending'
                                  ? 'default'
                                  : report.status === 'resolved'
                                  ? 'outline'
                                  : 'secondary'
                              }
                            >
                              {report.status === 'pending' && "En attente"}
                              {report.status === 'resolved' && "Résolu"}
                              {report.status === 'dismissed' && "Rejeté"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => resolveReport(report.id, 'resolved')}
                                  disabled={actionLoading === report.id}
                                >
                                  {actionLoading === report.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Résoudre
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => resolveReport(report.id, 'dismissed')}
                                  disabled={actionLoading === report.id}
                                >
                                  {actionLoading === report.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeter
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}