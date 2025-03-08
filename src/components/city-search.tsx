import { useState } from "react"
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
import { Loader2, MapPin } from "lucide-react"
import { CitySearchResult } from "@/types"
import { searchSwissCities } from "@/lib/city-api"

interface CitySearchProps {
  onSelect: (city: CitySearchResult) => void
  placeholder?: string
  value?: string
}

export function CitySearch({ onSelect, placeholder, value }: CitySearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cities, setCities] = useState<CitySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (value: string) => {
    setQuery(value)
    setError(null)
    
    if (value.length < 2) {
      setCities([])
      return
    }

    setLoading(true)
    try {
      const results = await searchSwissCities(value)
      setCities(results)
      if (results.length === 0) {
        setError("Aucune ville trouvée")
      }
    } catch (error) {
      console.error('Error searching cities:', error)
      setError("Une erreur est survenue lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (city: CitySearchResult) => {
    onSelect(city)
    setQuery(city.display_name)
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
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {value || query || placeholder || "Rechercher une ville..."}
            </span>
          </span>
          {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher une ville..."
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
            {!loading && cities.length === 0 && (
              <CommandEmpty>
                {error ? (
                  <p className="text-sm text-muted-foreground py-6">
                    {error}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground py-6">
                    {query.length < 2 
                      ? "Entrez au moins 2 caractères..."
                      : "Aucune ville trouvée"}
                  </p>
                )}
              </CommandEmpty>
            )}
            {cities.length > 0 && (
              <CommandGroup heading="Villes">
                {cities.map((city) => (
                  <CommandItem
                    key={`${city.lat}-${city.lon}`}
                    value={city.display_name}
                    onSelect={() => handleSelect(city)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                    <span>{city.display_name}</span>
                    {city.zip && (
                      <span className="ml-auto text-muted-foreground">
                        {city.zip}
                      </span>
                    )}
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