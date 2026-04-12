import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { fetchStations, fetchCityLines, fetchAllLines } from '../api/client'
import { useState, useEffect } from 'react'
import { useCity } from '../context/CityContext'
import 'leaflet/dist/leaflet.css'

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom])
  return null
}

export default function RouteExplorer() {
  const { selectedCity } = useCity()
  const cityId = selectedCity?.id
  const { data: stations } = useQuery({ queryKey: ['stations', cityId], queryFn: () => fetchStations(cityId) })
  const { data: lines } = useQuery({
    queryKey: ['lines', cityId],
    queryFn: () => cityId ? fetchCityLines(cityId) : fetchAllLines()
  })
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  useEffect(() => { setSelectedLine(null) }, [cityId])

  const filtered = selectedLine
    ? stations?.filter((s: any) => s.line_id === selectedLine)
    : stations

  const mapCenter: [number, number] = selectedCity
    ? [selectedCity.center_lat, selectedCity.center_lng]
    : [20.5937, 78.9629]
  const mapZoom = selectedCity ? selectedCity.zoom_level : 5

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">
        {selectedCity ? `${selectedCity.name} Route Explorer` : 'Route Explorer'}
      </h1>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedLine(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            selectedLine === null ? 'bg-slate-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Lines
        </button>
        {lines?.map((line: any) => (
          <button
            key={line.id}
            onClick={() => setSelectedLine(line.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              selectedLine === line.id ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={selectedLine === line.id ? { backgroundColor: line.color_hex } : {}}
          >
            {line.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4 flex gap-6">
        <div><p className="text-xs text-gray-500">Showing stations</p><p className="text-2xl font-bold text-blue-600">{filtered?.length ?? 0}</p></div>
        <div><p className="text-xs text-gray-500">Total lines</p><p className="text-2xl font-bold text-green-600">{lines?.length ?? 0}</p></div>
        <div><p className="text-xs text-gray-500">Interchange stations</p><p className="text-2xl font-bold text-amber-600">{filtered?.filter((s: any) => s.is_interchange).length ?? 0}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden" style={{ height: '500px' }}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          {filtered?.map((station: any) => (
            <CircleMarker
              key={station.id}
              center={[station.latitude, station.longitude]}
              radius={station.is_interchange ? 10 : 7}
              fillColor={station.lines?.color_hex || '#3B82F6'}
              color="white"
              weight={2}
              fillOpacity={0.9}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold">{station.name}</p>
                  <p className="text-sm text-gray-500">{station.lines?.name}</p>
                  <p className="text-xs mt-1">Zone {station.zone}</p>
                  {station.is_interchange && <p className="text-xs text-blue-600 font-medium">Interchange Station</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}