import { useState } from 'react'
import { api, fetchCityLines, fetchAllLines } from '../api/client'
import { useQuery } from '@tanstack/react-query'
import { fetchStations } from '../api/client'
import { useCity } from '../context/CityContext'

export default function PredictDelay() {
  const { selectedCity } = useCity()
  const cityId = selectedCity?.id

  const { data: lines } = useQuery({
    queryKey: ['lines', cityId],
    queryFn: () => cityId ? fetchCityLines(cityId) : fetchAllLines()
  })
  const { data: stations } = useQuery({
    queryKey: ['stations', cityId],
    queryFn: () => fetchStations(cityId)
  })

  const [form, setForm] = useState({ line_id: '', station_id: '', hour: '8', day_of_week: '1' })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredStations = form.line_id
    ? stations?.filter((s: any) => s.line_id === parseInt(form.line_id))
    : stations

  const handleSubmit = async () => {
    if (!form.line_id || !form.station_id) {
      setError('Please select a line and station')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/analytics/predict-delay', {
        line_id: parseInt(form.line_id),
        station_id: parseInt(form.station_id),
        hour: parseInt(form.hour),
        day_of_week: parseInt(form.day_of_week),
      })
      setResult(res.data)
    } catch (e) {
      setError('Prediction failed. Please try again.')
    }
    setLoading(false)
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Predict Delay</h1>
      <p className="text-gray-500">
        {selectedCity ? `${selectedCity.name} metro` : 'All cities'} — ML-based delay prediction
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Trip Details</h2>

          <div>
            <label className="text-sm text-gray-600 font-medium">Metro Line</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.line_id}
              onChange={e => setForm({ ...form, line_id: e.target.value, station_id: '' })}
            >
              <option value="">Select a line</option>
              {lines?.map((l: any) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Station</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.station_id}
              onChange={e => setForm({ ...form, station_id: e.target.value })}
            >
              <option value="">Select a station</option>
              {filteredStations?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Hour of Day</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.hour}
              onChange={e => setForm({ ...form, hour: e.target.value })}
            >
              {Array.from({ length: 18 }, (_, i) => i + 5).map(h => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Day of Week</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.day_of_week}
              onChange={e => setForm({ ...form, day_of_week: e.target.value })}
            >
              {days.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Predict Delay'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
          {result ? (
            <div className="text-center space-y-3">
              <p className="text-gray-500 text-sm">Predicted delay</p>
              <p className="text-7xl font-bold text-blue-600">{result.predicted_delay_minutes}</p>
              <p className="text-2xl text-gray-600">minutes</p>
              <div className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                result.predicted_delay_minutes <= 3 ? 'bg-green-100 text-green-700' :
                result.predicted_delay_minutes <= 7 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {result.predicted_delay_minutes <= 3 ? 'On time expected' :
                 result.predicted_delay_minutes <= 7 ? 'Minor delay expected' :
                 'Significant delay expected'}
              </div>
              <p className="text-xs text-gray-400 mt-2">Model: {result.model}</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-5xl mb-4">?</p>
              <p>Fill in the form to get a prediction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}