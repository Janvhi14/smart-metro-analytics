import { createContext, useContext, useState, ReactNode } from 'react'

interface City {
  id: number
  name: string
  center_lat: number
  center_lng: number
  zoom_level: number
}

interface CityContextType {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
}

const CityContext = createContext<CityContextType>({
  selectedCity: null,
  setSelectedCity: () => {},
})

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => useContext(CityContext)