import { useState } from "react"
import { CarQueryVehicle } from "@/types"
import { searchVehicles } from "@/lib/car-api"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2, Car } from "lucide-react"

interface VehicleSearchProps {
  onSelect: (vehicle: CarQueryVehicle) => void
  placeholder?: string
}

export function VehicleSearch({ onSelect, placeholder }: VehicleSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<CarQueryVehicle[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (value: string) => {
    setQuery(value)
    setError(null)
    
    if (value.length < 2) {
      setVehicles([])
      return
    }

    setLoading(true)
    try {
      const results = await searchVehicles(value)
      setVehicles(results)
      if (results.length === 0) {
        setError("Aucun résultat trouvé")
      }
    } catch (error) {
      console.error('Error searching vehicles:', error)
      setError("Une erreur est survenue lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (vehicle: CarQueryVehicle) => {
    onSelect(vehicle)
    setQuery(`${vehicle.make_display}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <Car className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {query || placeholder || "Rechercher une marque..."}
            </span>
          </span>
          {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Commencez à taper une marque..."
            value={query}
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading && (
              <CommandEmpty className="py-6 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Recherche en cours...
                </p>
              </CommandEmpty>
            )}
            {!loading && vehicles.length === 0 && (
              <CommandEmpty>
                {error ? (
                  <p className="text-sm text-muted-foreground py-6">
                    {error}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground py-6">
                    {query.length < 2 
                      ? "Entrez au moins 2 caractères..."
                      : "Aucune marque trouvée"}
                  </p>
                )}
              </CommandEmpty>
            )}
            {vehicles.length > 0 && (
              <CommandGroup heading="Marques">
                {vehicles.map((vehicle) => (
                  <CommandItem
                    key={vehicle.make_id}
                    value={vehicle.make_display}
                    onSelect={() => handleSelect(vehicle)}
                    className="flex items-center gap-2"
                  >
                    <Car className="h-4 w-4 shrink-0 opacity-50" />
                    <span>{vehicle.make_display}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}