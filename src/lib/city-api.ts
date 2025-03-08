import { CitySearchResult } from '@/types'

const NOMINATIM_API = import.meta.env.VITE_NOMINATIM_API_URL
const APP_NAME = import.meta.env.VITE_APP_NAME
const APP_VERSION = import.meta.env.VITE_APP_VERSION

export async function searchSwissCities(query: string): Promise<CitySearchResult[]> {
  if (query.length < 2) return []

  try {
    const response = await fetch(
      `${NOMINATIM_API}/search?` + new URLSearchParams({
        q: `${query} suisse`,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        'accept-language': 'fr',
        countrycodes: 'ch'
      }),
      {
        headers: {
          'User-Agent': `${APP_NAME}/${APP_VERSION}`,
          'Accept-Language': 'fr'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('Format de réponse invalide')
    }

    const results = data
      .filter((item: any) => {
        const type = item.type || item.class
        const isValidType = type === 'city' || 
                          type === 'town' || 
                          type === 'village' ||
                          type === 'municipality' ||
                          type === 'administrative'
        const isInSwitzerland = item.address?.country_code === 'ch'
        return isValidType && isInSwitzerland
      })
      .map((item: any) => {
        const cityName = item.address?.city || 
                        item.address?.town || 
                        item.address?.village || 
                        item.address?.municipality ||
                        item.display_name.split(',')[0].trim()

        return {
          display_name: cityName,
          lat: item.lat,
          lon: item.lon,
          zip: item.address?.postcode
        }
      })
      .filter((city: CitySearchResult) => {
        const isValidName = city.display_name && 
                          !city.display_name.includes(',') && 
                          !city.display_name.includes('Canton') &&
                          !city.display_name.includes('District')
        return isValidName
      })

    const uniqueResults = Array.from(
      new Map(results.map(city => [city.display_name, city])).values()
    )

    return uniqueResults.slice(0, 10)

  } catch (error) {
    console.error('Error searching cities:', error)
    return []
  }
}