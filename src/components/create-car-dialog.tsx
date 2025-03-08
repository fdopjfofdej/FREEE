import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import confetti from 'canvas-confetti'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { VehicleSearch } from "@/components/vehicle-search"
import { Plus, Camera, FileText, Settings, Shield, Phone, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { TYPE_VEHICULES, CARBURANTS, TRANSMISSIONS, COULEURS, OPTIONS, CarQueryVehicle } from "@/types"
import { cn } from "@/lib/utils"

const carSchema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.string().min(1, "Le prix est requis").transform(Number),
  year: z.string()
    .min(1, "L'année est requise")
    .transform(Number)
    .refine((val) => val >= 1900 && val <= new Date().getFullYear(), {
      message: "L'année doit être valide"
    }),
  mileage: z.string().min(1, "Le kilométrage est requis").transform(Number),
  images: z.array(z.string()).default([]),
  type_vehicule: z.string().min(1, "Le type de véhicule est requis"),
  carburant: z.string().min(1, "Le type de carburant est requis"),
  transmission: z.string().min(1, "Le type de transmission est requis"),
  puissance: z.string().transform((val) => val ? Number(val) : undefined),
  cylindree: z.string().transform((val) => val ? Number(val) : undefined),
  portes: z.string().transform((val) => val ? Number(val) : undefined),
  places: z.string().transform((val) => val ? Number(val) : undefined),
  couleur: z.string().min(1, "La couleur est requise"),
  premiere_main: z.boolean().default(false),
  garantie: z.string().transform((val) => val ? Number(val) : undefined),
  options: z.array(z.string()).default([]),
  phone_number: z.string()
    .min(1, "Le numéro de téléphone est requis")
    .refine((val) => /^(\+41|0)[1-9][0-9]{8}$/.test(val), {
      message: "Format invalide (ex: 0791234567 ou +41791234567)"
    }),
  expertisee: z.boolean().default(false),
  is_professional: z.boolean().default(false),
  company_name: z.string().optional(),
  consommation: z.string().transform((val) => val ? Number(val) : undefined),
}).transform((data) => ({
  ...data,
  title: `${data.brand} ${data.model}`,
}))

type CarFormValues = z.infer<typeof carSchema>

interface CreateCarDialogProps {
  onSuccess?: () => void
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

export function CreateCarDialog({ onSuccess }: CreateCarDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: "",
      model: "",
      description: "",
      price: 0,
      year: 0,
      mileage: 0,
      images: [],
      type_vehicule: "",
      carburant: "",
      transmission: "",
      puissance: 0,
      cylindree: 0,
      portes: 0,
      places: 0,
      couleur: "",
      premiere_main: false,
      garantie: 0,
      options: [],
      phone_number: "",
      expertisee: false,
      is_professional: false,
      company_name: "",
      consommation: 0,
    },
  })

  const currentStep = steps[step - 1]

  const nextStep = () => {
    if (step < steps.length) {
      setStep(step + 1)
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
    form.setValue("year", parseInt(vehicle.model_year))
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

      setOpen(false)
      form.reset()
      setStep(1)
      triggerConfetti()
      toast({
        title: "🎉 Annonce créée avec succès !",
        description: "Votre annonce est maintenant visible sur FreeAuto",
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de l'annonce",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchIsProfessional = form.watch("is_professional")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Créer une annonce</span>
          <span className="sm:hidden">Créer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
            {currentStep.title}
            <span className="text-sm text-muted-foreground">
              Étape {step} sur {steps.length}
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {currentStep.description}
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="relative mb-6 sm:mb-8 mt-4">
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-6 pr-4">
            {step === 1 && (
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

            {step === 2 && (
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

            {step === 3 && (
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
                </div>

                <FormField
                  control={form.control}
                  name="options"
                  render={() => (
                    <FormItem>
                      <FormLabel>Options et équipements</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {OPTIONS.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name="options"
                            render={({ field }) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const updatedOptions = checked
                                        ? [...field.value, option]
                                        : field.value?.filter((value) => value !== option)
                                      field.onChange(updatedOptions)
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 4 && (
              <>
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0791234567"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: 0791234567 ou +41791234567
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_professional"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel>Je suis un professionnel</FormLabel>
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
                          <Input
                            placeholder="Nom de votre entreprise"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="premiere_main"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel>Première main</FormLabel>
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
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel>Véhicule expertisé</FormLabel>
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
              </>
            )}
          </form>
        </Form>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
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
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Créer l'annonce
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}