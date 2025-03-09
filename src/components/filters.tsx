import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarFilter, TYPE_VEHICULES, CARBURANTS, TRANSMISSIONS, COULEURS, SWISS_CITIES } from "@/types"
import { CityMap } from "@/components/city-map"
import { CitySearch } from "@/components/city-search"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { SlidersHorizontal, X, MapPin, Euro, Calendar, Gauge, Power, Car, Paintbrush, Search } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface FiltersProps {
  onFilterChange: (filters: CarFilter) => void
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<CarFilter>({})
  const [open, setOpen] = useState(false)
  const [brandQuery, setBrandQuery] = useState("")
  const [modelQuery, setModelQuery] = useState("")

  const handleFilterChange = (key: keyof CarFilter, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (!value) {
      delete newFilters[key]
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleMultiSelect = (key: keyof CarFilter, value: string) => {
    const currentValues = filters[key] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined)
  }

  const getSelectedCount = (key: keyof CarFilter) => {
    return (filters[key] as string[] || []).length
  }

  const resetFilters = () => {
    setFilters({})
    setBrandQuery("")
    setModelQuery("")
    onFilterChange({})
    setOpen(false)
  }

  const getActiveFilterCount = () => {
    return Object.keys(filters).length
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchTerms = [brandQuery, modelQuery]
      .filter(Boolean)
      .join(" ")
    handleFilterChange("searchTerms", searchTerms || undefined)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="relative group hover:border-primary/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </span>
          {getActiveFilterCount() > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1"
            >
              {getActiveFilterCount()}
            </Badge>
          )}
          <span className="absolute inset-x-0 h-px bottom-0 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Filtres</SheetTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Réinitialiser
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-6">
            <Accordion type="single" collapsible defaultValue="location" className="space-y-2">
              <AccordionItem value="location" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Localisation et recherche</span>
                    {(filters.city || filters.searchTerms) && (
                      <Badge variant="secondary" className="ml-2">
                        {[filters.city, filters.searchTerms].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Ville</Label>
                      <CitySearch
                        onSelect={(city) => handleFilterChange("city", city.display_name)}
                        placeholder="Sélectionner une ville"
                        value={filters.city}
                      />
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Marque</Label>
                        <Input
                          placeholder="Rechercher une marque..."
                          value={brandQuery}
                          onChange={(e) => setBrandQuery(e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Modèle</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Rechercher un modèle..."
                            value={modelQuery}
                            onChange={(e) => setModelQuery(e.target.value)}
                            className="flex-1 bg-white"
                          />
                          <Button type="submit" size="icon" className="shrink-0">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </form>

                    <CityMap
                      cities={SWISS_CITIES}
                      onCitySelect={(city) => handleFilterChange("city", city.display_name)}
                      selectedCity={SWISS_CITIES.find(city => city.display_name === filters.city)}
                      className="h-[300px] border rounded-lg mt-4"
                    />

                    {filters.city && (
                      <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{filters.city}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFilterChange("city", undefined)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-primary" />
                    <span>Prix</span>
                    {(filters.minPrice || filters.maxPrice) && (
                      <Badge variant="secondary" className="ml-2">
                        {[filters.minPrice, filters.maxPrice].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Minimum</Label>
                      <Input
                        type="number"
                        placeholder="Prix min"
                        value={filters.minPrice || ""}
                        onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Maximum</Label>
                      <Input
                        type="number"
                        placeholder="Prix max"
                        value={filters.maxPrice || ""}
                        onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="year-mileage" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Année et kilométrage</span>
                    {(filters.minYear || filters.maxMileage) && (
                      <Badge variant="secondary" className="ml-2">
                        {[filters.minYear, filters.maxMileage].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Année minimum</Label>
                      <Input
                        type="number"
                        placeholder="Année min"
                        value={filters.minYear || ""}
                        onChange={(e) => handleFilterChange("minYear", e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Kilométrage max</Label>
                      <Input
                        type="number"
                        placeholder="Km max"
                        value={filters.maxMileage || ""}
                        onChange={(e) => handleFilterChange("maxMileage", e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="type" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    <span>Type de véhicule</span>
                    {getSelectedCount("type_vehicule") > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getSelectedCount("type_vehicule")}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-2">
                    {TYPE_VEHICULES.map((type) => {
                      const isSelected = (filters.type_vehicule || []).includes(type)
                      return (
                        <Button
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                          onClick={() => handleMultiSelect("type_vehicule", type)}
                        >
                          {type}
                        </Button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fuel" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span>Carburant</span>
                    {getSelectedCount("carburant") > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getSelectedCount("carburant")}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-2">
                    {CARBURANTS.map((carburant) => {
                      const isSelected = (filters.carburant || []).includes(carburant)
                      return (
                        <Button
                          key={carburant}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                          onClick={() => handleMultiSelect("carburant", carburant)}
                        >
                          {carburant}
                        </Button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="transmission" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Power className="h-4 w-4 text-primary" />
                    <span>Transmission</span>
                    {getSelectedCount("transmission") > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getSelectedCount("transmission")}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSMISSIONS.map((transmission) => {
                      const isSelected = (filters.transmission || []).includes(transmission)
                      return (
                        <Button
                          key={transmission}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                          onClick={() => handleMultiSelect("transmission", transmission)}
                        >
                          {transmission}
                        </Button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="color" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="h-4 w-4 text-primary" />
                    <span>Couleur</span>
                    {getSelectedCount("couleur") > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {getSelectedCount("couleur")}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="grid grid-cols-2 gap-2">
                    {COULEURS.map((couleur) => {
                      const isSelected = (filters.couleur || []).includes(couleur)
                      return (
                        <Button
                          key={couleur}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "justify-start h-auto py-2 px-3 bg-white hover:bg-white/80",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                          onClick={() => handleMultiSelect("couleur", couleur)}
                        >
                          {couleur}
                        </Button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="options" className="border-none [&[data-state=open]>div]:bg-secondary/50">
                <AccordionTrigger className="py-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors data-[state=open]:rounded-b-none hover:no-underline">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span>Options</span>
                    {(filters.premiere_main || filters.expertisee || filters.is_professional) && (
                      <Badge variant="secondary" className="ml-2">
                        {[filters.premiere_main, filters.expertisee, filters.is_professional].filter(Boolean).length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4 rounded-b-lg bg-secondary/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                      <Label className="cursor-pointer">Première main</Label>
                      <Switch
                        checked={filters.premiere_main}
                        onCheckedChange={(checked) => handleFilterChange("premiere_main", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                      <Label className="cursor-pointer">Véhicules expertisés</Label>
                      <Switch
                        checked={filters.expertisee}
                        onCheckedChange={(checked) => handleFilterChange("expertisee", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-secondary/20">
                      <Label className="cursor-pointer">Vendeurs professionnels</Label>
                      <Switch
                        checked={filters.is_professional}
                        onCheckedChange={(checked) => handleFilterChange("is_professional", checked)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
        
        <div className="sticky bottom-0 p-4 border-t bg-background flex justify-end md:hidden">
          <SheetClose asChild>
            <Button>Appliquer les filtres</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}