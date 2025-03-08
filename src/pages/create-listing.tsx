import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import confetti from 'canvas-confetti'
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { VehicleSearch } from "@/components/vehicle-search"
import { CitySearch } from "@/components/city-search"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { TYPE_VEHICULES, CARBURANTS, TRANSMISSIONS, COULEURS, OPTIONS, CarQueryVehicle, CitySearchResult, Car } from "@/types"
import { Camera, FileText, Settings, Phone, Loader2, ArrowLeft } from "lucide-react"

const carSchema = z.object({
  images: z.array(z.string()).default([]),
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.string().min(1, "Le prix est requis").transform(Number).transform(String),
  year: z.string()
    .min(1, "L'année est requise")
    .transform(Number)
    .refine((val) => val >= 1900 && val <= new Date().getFullYear(), {
      message: "L'année doit être valide"
    })
    .transform(String),
  mileage: z.string().min(1, "Le kilométrage est requis").transform(Number).transform(String),
  type_vehicule: z.string().min(1, "Le type de véhicule est requis"),
  carburant: z.string().min(1, "Le type de carburant est requis"),
  transmission: z.string().min(1, "Le type de transmission est requis"),
  couleur: z.string().min(1, "La couleur est requise"),
  puissance: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  cylindree: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  portes: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  places: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  consommation: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  garantie: z.string().transform(val => val ? Number(val) : undefined).transform(String),
  options: z.array(z.string()).default([]),
  premiere_main: z.boolean().default(false),
  expertisee: z.boolean().default(false),
  phone_number: z.string()
    .min(1, "Le numéro de téléphone est requis")
    .refine((val) => /^(\+41|0)[1-9][0-9]{8}$/.test(val), {
      message: "Format invalide (ex: 0791234567 ou +41791234567)"
    }),
  is_professional: z.boolean().default(false),
  company_name: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
}).transform((data) => ({
  ...data,
  title: `${data.brand} ${data.model}`,
}))

type CarFormValues = z.infer<typeof carSchema>

interface CreateListingProps {
  initialData?: Car
}

const steps = [
  {
    id: 1,
    title: "Photos",
    description: "Ajoutez des photos de votre véhicule",
    icon: <Camera className="h-4 w-4" />,
  },
  {
    id: 2,
    title: "Informations",
    description: "Décrivez votre véhicule",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 3,
    title: "Caractéristiques",
    description: "Spécifiez les détails techniques",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 4,
    title: "Contact",
    description: "Ajoutez vos informations de contact",
    icon: <Phone className="h-4 w-4" />,
  },
]

const triggerConfetti = () => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })

  fire(0.2, {
    spread: 60,
  })

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export default function CreateListing({ initialData }: CreateListingProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      description: initialData?.description || "",
      price: initialData?.price?.toString() || "",
      year: initialData?.year?.toString() || "",
      mileage: initialData?.mileage?.toString() || "",
      images: initialData?.images || [],
      type_vehicule: initialData?.type_vehicule || "",
      carburant: initialData?.carburant || "",
      transmission: initialData?.transmission || "",
      puissance: initialData?.puissance?.toString() || "",
      cylindree: initialData?.cylindree?.toString() || "",
      portes: initialData?.portes?.toString() || "",
      places: initialData?.places?.toString() || "",
      couleur: initialData?.couleur || "",
      premiere_main: initialData?.premiere_main || false,
      garantie: initialData?.garantie?.toString() || "",
      options: initialData?.options || [],
      phone_number: initialData?.phone_number || "",
      expertisee: initialData?.expertisee || false,
      is_professional: initialData?.is_professional || false,
      company_name: initialData?.company_name || "",
      consommation: initialData?.consommation?.toString() || "",
      city: initialData?.city || "",
    },
  })

  const getStepFields = (stepNumber: number): (keyof CarFormValues)[] => {
    switch (stepNumber) {
      case 1:
        return [] // Les images sont optionnelles
      case 2:
        return ['brand', 'model', 'description', 'price', 'year', 'mileage']
      case 3:
        return ['type_vehicule', 'carburant', 'transmission', 'couleur']
      case 4:
        return ['phone_number', 'city']
      default:
        return []
    }
  }

  const isStepValid = async (stepNumber: number) => {
    const fields = getStepFields(stepNumber)
    if (fields.length === 0) return true

    const results = await Promise.all(
      fields.map(field => form.trigger(field))
    )
    return results.every(isValid => isValid)
  }

  const nextStep = async () => {
    const isValid = await isStepValid(step)
    if (isValid) {
      setStep(step + 1)
    } else {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleVehicleSelect = (vehicle: CarQueryVehicle) => {
    form.setValue("brand", vehicle.make_display)
    form.setValue("model", vehicle.model_name)
    form.setValue("year", vehicle.model_year)
  }

  const handleCitySelect = (city: CitySearchResult) => {
    form.setValue("city", city.display_name)
  }

  const onSubmit = async (data: CarFormValues) => {
    try {
      setIsSubmitting(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Vous devez être connecté pour créer une annonce")
      }

      if (initialData) {
        // Mise à jour
        const { error } = await supabase
          .from("cars")
          .update({
            ...data,
            user_id: user.id,
          })
          .eq('id', initialData.id)

        if (error) {
          if (error.message.includes('phone_number')) {
            throw new Error("Le format du numéro de téléphone est invalide. Utilisez le format 0791234567 ou +41791234567")
          }
          throw error
        }

        toast({
          title: "🎉 Annonce mise à jour !",
          description: "Votre annonce a été modifiée avec succès",
        })
      } else {
        // Création
        const { error } = await supabase.from("cars").insert({
          ...data,
          user_id: user.id,
        })

        if (error) {
          if (error.message.includes('phone_number')) {
            throw new Error("Le format du numéro de téléphone est invalide. Utilisez le format 0791234567 ou +41791234567")
          }
          throw error
        }

        triggerConfetti()
        toast({
          title: "🎉 Annonce créée avec succès !",
          description: "Votre annonce est maintenant visible sur FreeAuto",
        })
      }
      
      navigate('/mes-annonces')
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchIsProfessional = form.watch("is_professional")

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">
                {initialData ? "Modifier l'annonce" : steps[step - 1].title}
              </h1>
              <p className="text-muted-foreground">
                {initialData ? "Modifiez les informations de votre annonce" : steps[step - 1].description}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/mes-annonces')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>

          {!initialData && (
            <div className="relative mb-8">
              <div className="absolute top-4 w-full h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                        step > s.id 
                          ? "bg-primary text-primary-foreground scale-110"
                          : step === s.id
                          ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                          : "bg-muted text-muted-foreground scale-100"
                      )}
                    >
                      {s.icon}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 font-medium transition-colors duration-300 hidden sm:block",
                      step === s.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {(step === 1 || initialData) && (
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photos du véhicule</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          maxFiles={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Ajoutez jusqu'à 5 photos de votre véhicule
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(step === 2 || initialData) && (
                <>
                  <FormItem>
                    <FormLabel>Rechercher un véhicule</FormLabel>
                    <VehicleSearch 
                      onSelect={handleVehicleSelect}
                      placeholder="Rechercher une marque ou un modèle"
                    />
                    <FormDescription>
                      Recherchez votre véhicule pour remplir automatiquement les informations
                    </FormDescription>
                  </FormItem>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marque</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Peugeot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modèle</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 308" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre véhicule en détail..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="25000"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>En francs suisses (CHF)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={new Date().getFullYear().toString()}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilométrage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="75000"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>En kilomètres</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {(step === 3 || initialData) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type_vehicule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de véhicule</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TYPE_VEHICULES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carburant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carburant</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un carburant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CARBURANTS.map((carburant) => (
                                <SelectItem key={carburant} value={carburant}>
                                  {carburant}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une transmission" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TRANSMISSIONS.map((transmission) => (
                                <SelectItem key={transmission} value={transmission}>
                                  {transmission}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="couleur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une couleur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COULEURS.map((couleur) => (
                                <SelectItem key={couleur} value={couleur}>
                                  {couleur}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="puissance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puissance (ch)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cylindree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cylindrée (cm³)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1998" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de portes</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="places"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de places</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consommation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consommation (L/100km)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="5.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garantie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garantie (mois)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="premiere_main"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Première main</FormLabel>
                            <FormDescription>
                              Vous êtes le premier propriétaire
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expertisee"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Expertisée</FormLabel>
                            <FormDescription>
                              Le véhicule a passé l'expertise
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="options"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Options</FormLabel>
                          <FormDescription>
                            Sélectionnez les options du véhicule
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {OPTIONS.map((option) => (
                            <FormField
                              key={option}
                              control={form.control}
                              name="options"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                         </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {(step === 4 || initialData) && (
                <>
                  <FormField
                    control={form.control}
                    name="is_professional"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Professionnel</FormLabel>
                          <FormDescription>
                            Vous êtes un professionnel de l'automobile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchIsProfessional && (
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'entreprise</FormLabel>
                          <FormControl>
                            <Input placeholder="Garage XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="0791234567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Format: 0791234567 ou +41791234567
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <CitySearch
                      onSelect={handleCitySelect}
                      placeholder="Rechercher une ville"
                      value={form.getValues("city")}
                    />
                    <FormMessage />
                  </FormItem>
                </>
              )}

              <div className="flex justify-between pt-4">
                {!initialData && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                    >
                      Précédent
                    </Button>
                    {step < steps.length ? (
                      <Button type="button" onClick={nextStep}>
                        Suivant
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Publier l'annonce
                      </Button>
                    )}
                  </>
                )}
                {initialData && (
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enregistrer les modifications
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}