import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import {
  fetchSummary,
  fetchCongestionByHour,
  fetchOntimePerformance,
  fetchRidershipTrend
} from '../api/client'
import { useCity } from '../context/CityContext'
import KpiCard from '../components/KpiCard'

export default function Dashboard() {
  const { selectedCity } = useCity()
  const cityId = selectedCity?.id

  const { data: summary } = useQuery({ queryKey: ['summary', cityId], queryFn: () => fetchSummary(cityId), refetchInterval: 30000 })
  const { data: congestion } = useQuery({ queryKey: ['congestion', cityId], queryFn: () => fetchCongestionByHour(cityId) })
  const { data: ontime } = useQuery({ queryKey: ['ontime', cityId], queryFn: () => fetchOntimePerformance(cityId) })
  const { data: ridership } = useQuery({ queryKey: ['ridership', cityId], queryFn: () => fetchRidershipTrend(cityId) })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedCity ? `${selectedCity.name} Metro Analytics` : 'Smart Metro Analytics'}
        </h1>
        {!selectedCity && <p className="text-sm text-gray-500">Showing all cities — select a city from the navbar to filter</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="On-Time Performance" value={`${summary?.on_time_percentage ?? '--'}%`} subtitle="Last 180 days" color="#3B82F6" />
        <KpiCard title="Avg Delay" value={`${summary?.avg_delay_minutes ?? '--'} min`} subtitle="Per trip" color="#F59E0B" />
        <KpiCard title="Active Alerts" value={summary?.active_alerts ?? '--'} subtitle="Unresolved" color="#EF4444" />
        <KpiCard title="Total Stations" value={summary?.total_stations ?? '--'} subtitle={`Across ${summary?.total_lines ?? '--'} lines`} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Congestion by Hour</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={congestion ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_entries" fill="#3B82F6" name="Avg Entries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">On-Time Performance by Line</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ontime ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="line_name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="on_time_pct" name="On-Time %" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Daily Ridership Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ridership ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_entries" stroke="#3B82F6" name="Entries" dot={false} />
            <Line type="monotone" dataKey="total_exits" stroke="#10B981" name="Exits" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}