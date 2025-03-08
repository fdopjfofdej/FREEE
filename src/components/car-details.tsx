import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Car } from "@/types"
import { supabase } from "@/lib/supabase"
import { formatCurrency, slugify, generateMetaDescription } from "@/lib/utils"
import { AuthDialog } from "@/components/auth-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthPreference } from "@/hooks/use-auth-preference"
import { ReportDialog } from "@/components/report-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  CarFront,
  Calendar,
  Gauge,
  Power,
  Fuel,
  Info,
  Cog,
  Phone,
  Building2,
  MapPin,
  Award,
  ShieldCheck,
  Shield,
  MessageSquare,
  Check,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Flag,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export function CarDetails() {
  const { id, slug } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPhone, setShowPhone] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { showPaywall, setShowPaywall, skipPaywall } = useAuthPreference()
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    fetchCar()
    checkAuth()
  }, [id])

  useEffect(() => {
    if (!isAuthenticated) {
      setShowPaywall(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!carouselApi) return;
  
    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };
  
    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  const fetchCar = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      setCar(data)
      
      // Redirect to the canonical URL if the slug is missing or incorrect
      if (data && !slug) {
        const correctSlug = slugify(`${data.brand}-${data.model}-${data.year}`)
        navigate(`/annonce/${data.id}/${correctSlug}`, { replace: true })
      }
    } catch (error) {
      console.error("Error fetching car:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handlePhoneClick = async () => {
    if (!isAuthenticated) return
    setShowPhone(true)
  }

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl)
  }

  const closeFullscreen = () => {
    setFullscreenImage(null)
  }

  const navigateFullscreenImage = (direction: 'next' | 'prev') => {
    if (!car || !car.images.length) return

    const currentIndex = car.images.findIndex(img => img === fullscreenImage)
    if (currentIndex === -1) return

    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % car.images.length
      : (currentIndex - 1 + car.images.length) % car.images.length

    setFullscreenImage(car.images[newIndex])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 loading-logo">
            <span className="text-4xl font-serif">FreeAuto</span>
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
              <div className="text-white font-bold text-xl">+</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Annonce introuvable</h1>
          <p className="mt-2 text-gray-600">Cette annonce n'existe plus ou a été supprimée.</p>
          <Button asChild className="mt-4">
            <Link to="/">Retour aux annonces</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Vehicle",
    "name": car.title,
    "description": car.description,
    "model": car.model,
    "brand": {
      "@type": "Brand",
      "name": car.brand
    },
    "modelDate": car.year,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": car.mileage,
      "unitCode": "KMT"
    },
    "vehicleTransmission": car.transmission,
    "fuelType": car.carburant,
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "enginePower": {
        "@type": "QuantitativeValue",
        "value": car.puissance,
        "unitCode": "BHP"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": car.price,
      "priceCurrency": "CHF",
      "availability": "https://schema.org/InStock"
    },
    "image": car.images.length > 0 ? car.images[0] : null
  };

  // Generate canonical URL
  const canonicalUrl = `${window.location.origin}/annonce/${car.id}/${slugify(`${car.brand}-${car.model}-${car.year}`)}`;
  
  // Generate meta description
  const metaDescription = generateMetaDescription(car);

  return (
    <>
      <Helmet>
        <title>{car.title} - {car.price.toLocaleString('fr-CH')} CHF - FreeAuto</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${car.title} - ${car.price.toLocaleString('fr-CH')} CHF`} />
        <meta property="og:description" content={metaDescription} />
        {car.images.length > 0 && <meta property="og:image" content={car.images[0]} />}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${car.title} - ${car.price.toLocaleString('fr-CH')} CHF`} />
        <meta name="twitter:description" content={metaDescription} />
        {car.images.length > 0 && <meta name="twitter:image" content={car.images[0]} />}
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 mx-auto">
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {car.images.length > 0 ? (
                  <div className="relative">
                    <Carousel className="w-full" setApi={setCarouselApi}>
                      <CarouselContent>
                        {car.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-video relative overflow-hidden group">
                              <img
                                src={image}
                                alt={`${car.brand} ${car.model} ${car.year} - Photo ${index + 1}`}
                                className="object-cover w-full h-full cursor-pointer"
                                onClick={() => openFullscreen(image)}
                              />
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white hover:bg-black/70"
                                onClick={() => openFullscreen(image)}
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {car.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-4" />
                          <CarouselNext className="right-4" />
                        </>
                      )}
                    </Carousel>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <CarFront className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="text-xl sm:text-2xl font-bold break-words">{car.title}</h1>
                      <div className="flex flex-wrap gap-2">
                        {car.premiere_main && (
                          <Badge 
                            className="bg-primary text-white font-medium flex items-center gap-1"
                          >
                            <Award className="h-3 w-3" />
                            1ère main
                          </Badge>
                        )}
                        {car.expertisee && (
                          <Badge 
                            className="bg-green-600 text-white font-medium flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Expertisée
                          </Badge>
                        )}
                        {car.is_professional && (
                          <Badge 
                            className="bg-blue-600 text-white font-medium flex items-center gap-1"
                          >
                            <Building2 className="h-3 w-3" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {formatCurrency(car.price)}
                      </div>
                      {car.garantie && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Garantie {car.garantie} mois
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl bg-secondary/50">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">{car.year}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Année</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl bg-secondary/50">
                      <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">
                        {car.mileage}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Km</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl bg-secondary/50">
                      <Power className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">
                        {car.puissance || "-"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">ch</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl bg-secondary/50">
                      <Fuel className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div className="text-xs sm:text-sm font-medium">
                        {car.carburant?.slice(0, 6) || "-"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Carburant</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Description
                  </h2>
                  <div className={cn(
                    "prose prose-neutral max-w-none",
                    !isAuthenticated && "blur-content"
                  )}>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {car.description || "Aucune description fournie"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Cog className="h-5 w-5" />
                    Caractéristiques
                  </h2>
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
                    !isAuthenticated && "blur-content"
                  )}>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Transmission</span>
                        <span className="font-medium truncate ml-2">{car.transmission || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Places</span>
                        <span className="font-medium truncate ml-2">{car.places || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Portes</span>
                        <span className="font-medium truncate ml-2">{car.portes || "-"}</span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Couleur</span>
                        <span className="font-medium truncate ml-2">{car.couleur || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Cylindrée</span>
                        <span className="font-medium truncate ml-2">
                          {car.cylindree ? `${car.cylindree} cm³` : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Consommation</span>
                        <span className="font-medium truncate ml-2">
                          {car.consommation ? `${car.consommation}L/100km` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {car.options && car.options.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Cog className="h-5 w-5" />
                        Options et équipements
                      </h2>
                      <div className={cn(
                        "grid grid-cols-2 gap-3",
                        !isAuthenticated && "blur-content"
                      )}>
                        {car.options.map((option) => (
                          <div
                            key={option}
                            className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg"
                          >
                            <Check className="h-4 w-4 text-primary" />
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg space-y-6 sticky top-24">
                {car.is_professional && car.company_name && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold">Professionnel</h2>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{car.company_name}</p>
                      {car.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {car.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {car.phone_number && (
                    <Button
                      className="w-full gap-2"
                      onClick={handlePhoneClick}
                      disabled={!isAuthenticated}
                    >
                      <Phone className="h-4 w-4" />
                      {showPhone && isAuthenticated ? car.phone_number : "Voir le numéro"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={!isAuthenticated}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Envoyer un message
                  </Button>
                  
                  {isAuthenticated ? (
                    <ReportDialog 
                      carId={car.id} 
                      isAuthenticated={isAuthenticated}
                      variant="outline"
                      className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Signaler cette annonce
                    </ReportDialog>
                  ) : (
                    <AuthDialog>
                      <Button 
                        variant="outline"
                        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Signaler cette annonce
                      </Button>
                    </AuthDialog>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="text-sm text-center">
                    <AuthDialog>
                      <Button variant="default" size="sm" className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Créer une annonce
                      </Button>
                    </AuthDialog>
                  </div>
                )}

                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <p>Ne payez jamais à l'avance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <p>Méfiez-vous des prix trop bas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
                <h2 className="font-semibold">Annonces similaires</h2>
                <div className="text-sm text-muted-foreground text-center py-8">
                  Fonctionnalité à venir
                </div>
              </div>
            </div>
          </div>
        </main>

        {!isAuthenticated && showPaywall && (
          <Sheet open={showPaywall} onOpenChange={setShowPaywall}>
            <SheetContent side="bottom" className="h-[90vh] sm:h-auto">
              <SheetHeader className="text-center mb-6">
                <SheetTitle className="text-2xl">Accédez à toutes les informations</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Vendeurs vérifiés</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Contact direct</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Détails complets</p>
                  </div>
                </div>

                <AuthDialog>
                  <Button className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une annonce
                  </Button>
                </AuthDialog>

                <button
                  onClick={skipPaywall}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continuer sans compte
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <Dialog open={!!fullscreenImage} onOpenChange={() => closeFullscreen()}>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/95 border-none">
              <div className="relative w-full h-full flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                  onClick={closeFullscreen}
                >
                  <X className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateFullscreenImage('prev')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateFullscreenImage('next')}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                <img 
                  src={fullscreenImage} 
                  alt="Vue agrandie" 
                  className="max-h-full max-w-full object-contain"
                />
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {car.images.findIndex(img => img === fullscreenImage) + 1} / {car.images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}