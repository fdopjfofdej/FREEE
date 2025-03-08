import { CarQueryVehicle } from '@/types'

const NHTSA_API = 'https://vpic.nhtsa.dot.gov/api'

interface NHTSAResponse {
  Count: number
  Message: string
  Results: any[]
}

export async function searchVehicles(query: string): Promise<CarQueryVehicle[]> {
  try {
    if (query.length < 2) return []

    const response = await fetch(
      `${NHTSA_API}/vehicles/getallmanufacturers?format=json`
    )
    const data: NHTSAResponse = await response.json()

    const normalizedQuery = query.toLowerCase()
    return data.Results
      .filter(manufacturer => 
        manufacturer.Mfr_CommonName?.toLowerCase().includes(normalizedQuery) ||
        manufacturer.Mfr_Name?.toLowerCase().includes(normalizedQuery)
      )
      .map(manufacturer => ({
        make_id: manufacturer.Mfr_ID.toString(),
        make_display: manufacturer.Mfr_CommonName || manufacturer.Mfr_Name,
        model_name: "",
        model_year: new Date().getFullYear().toString()
      }))
      .filter(make => make.make_display)
      .slice(0, 10)
  } catch (error) {
    console.error('Error searching vehicles:', error)
    return []
  }
}