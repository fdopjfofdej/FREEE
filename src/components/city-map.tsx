import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { supabase } from '@/lib/supabase'
import { CitySearchResult } from '@/types'
import { Car } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Création d'une icône personnalisée pour les marqueurs
const customIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div style="
      background-color: #2563eb;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      border: 2px solid white;
      color: white;
      font-weight: bold;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92L1 17h2"/>
        <path d="M14 17V6"/>
        <path d="M10 17V6"/>
        <path d="M3 17h18"/>
        <path d="M6 3h12"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
})

// Composant pour centrer la carte sur une ville sélectionnée
function CenterMap({ city }: { city?: CitySearchResult }) {
  const map = useMap()
  
  useEffect(() => {
    if (city) {
      map.setView([Number(city.lat), Number(city.lon)], 12)
    }
  }, [city, map])
  
  return null
}

interface CityMapProps {
  cities: CitySearchResult[]
  onCitySelect?: (city: CitySearchResult) => void
  selectedCity?: CitySearchResult
  className?: string
}

export function CityMap({ cities, onCitySelect, selectedCity, className = "h-[400px]" }: CityMapProps) {
  const [citiesWithCars, setCitiesWithCars] = useState<(CitySearchResult & { count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const defaultCenter: [number, number] = [46.8182, 8.2275] // Centre de la Suisse
  const defaultZoom = 8

  useEffect(() => {
    async function fetchCitiesWithCars() {
      try {
        setLoading(true)
        
        // Récupérer le nombre de voitures par ville
        const { data, error } = await supabase
          .from('cars')
          .select('city')

        if (error) throw error

        // Compter manuellement les voitures par ville
        const cityCounts = data.reduce((acc: Record<string, number>, car) => {
          if (car.city) {
            acc[car.city] = (acc[car.city] || 0) + 1
          }
          return acc
        }, {})

        // Fusionner les données des villes avec le nombre de voitures
        const citiesData = cities
          .map(city => {
            const count = cityCounts[city.display_name] || 0
            return { ...city, count }
          })
          .filter(city => city.count > 0)

        setCitiesWithCars(citiesData)
      } catch (error) {
        console.error('Error fetching cities with cars:', error)
        // En cas d'erreur, on n'affiche aucun marqueur
        setCitiesWithCars([])
      } finally {
        setLoading(false)
      }
    }

    if (cities.length > 0) {
      fetchCitiesWithCars()
    }
  }, [cities])

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <div className="animate-pulse text-primary">Chargement de la carte...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <MapContainer
        center={selectedCity ? [Number(selectedCity.lat), Number(selectedCity.lon)] : defaultCenter}
        zoom={selectedCity ? 12 : defaultZoom}
        className="h-full w-full rounded-lg"
        zoomControl={false}
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        {citiesWithCars.map((city) => (
          <Marker
            key={`${city.lat}-${city.lon}`}
            position={[Number(city.lat), Number(city.lon)]}
            icon={customIcon}
            eventHandlers={{
              click: () => onCitySelect?.(city),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <div className="font-medium text-lg mb-1">{city.display_name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {city.count} {city.count > 1 ? 'annonces' : 'annonce'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <CenterMap city={selectedCity} />
      </MapContainer>
    </div>
  )
}