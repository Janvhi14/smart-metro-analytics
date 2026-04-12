import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCities } from '../api/client'
import { useCity } from '../context/CityContext'

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/map', label: 'Route Explorer' },
  { path: '/alerts', label: 'Alerts' },
  { path: '/trips', label: 'Trip Analytics' },
  { path: '/predict', label: 'Predict Delay' },
  { path: '/reports', label: 'Reports' },
]

export default function Navbar() {
  const location = useLocation()
  const { selectedCity, setSelectedCity } = useCity()
  const { data: cities } = useQuery({ queryKey: ['cities'], queryFn: fetchCities })

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-6 shadow-lg flex-wrap">
      <span className="text-lg font-bold text-blue-400 whitespace-nowrap">
        Metro Analytics
      </span>

      {/* City selector */}
      <select
        className="bg-slate-700 text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-400"
        value={selectedCity?.id || ''}
        onChange={e => {
          const city = cities?.find((c: any) => c.id === parseInt(e.target.value))
          setSelectedCity(city || null)
        }}
      >
        <option value="">All Cities</option>
        {cities?.map((city: any) => (
          <option key={city.id} value={city.id}>{city.name}</option>
        ))}
      </select>

      <div className="flex gap-2 flex-wrap">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {selectedCity && (
        <span className="text-xs text-blue-300 ml-auto">
          Showing: {selectedCity.name}
        </span>
      )}
    </nav>
  )
}