import { useQuery } from '@tanstack/react-query'
import { fetchSummary, fetchOntimePerformance, fetchRidershipTrend } from '../api/client'
import { useState } from 'react'

export default function Reports() {
  const { data: summary } = useQuery({ queryKey: ['summary'], queryFn: fetchSummary })
  const { data: ontime } = useQuery({ queryKey: ['ontime'], queryFn: fetchOntimePerformance })
  const { data: ridership } = useQuery({ queryKey: ['ridership'], queryFn: fetchRidershipTrend })
  const [exported, setExported] = useState('')

  const exportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setExported(filename)
    setTimeout(() => setExported(''), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      <p className="text-gray-500">Export analytics data for further analysis</p>

      {exported && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Downloaded: {exported}
        </div>
      )}

      {/* Summary card */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">System Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Lines', value: summary?.total_lines },
            { label: 'Total Stations', value: summary?.total_stations },
            { label: 'On-Time %', value: `${summary?.on_time_percentage}%` },
            { label: 'Avg Delay', value: `${summary?.avg_delay_minutes} min` },
            { label: 'Active Alerts', value: summary?.active_alerts },
          ].map(item => (
            <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{item.value ?? '--'}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">On-Time Performance</h3>
          <p className="text-sm text-gray-500">Per-line breakdown with trip counts and delay averages</p>
          <p className="text-xs text-gray-400">{ontime?.length ?? 0} rows</p>
          <button
            onClick={() => exportCSV(ontime, 'ontime-performance.csv')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">Ridership Trend</h3>
          <p className="text-sm text-gray-500">Daily entries and exits for the last 30 days</p>
          <p className="text-xs text-gray-400">{ridership?.length ?? 0} rows</p>
          <button
            onClick={() => exportCSV(ridership, 'ridership-trend.csv')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">System Summary</h3>
          <p className="text-sm text-gray-500">Overall KPIs and system health metrics</p>
          <p className="text-xs text-gray-400">1 row</p>
          <button
            onClick={() => exportCSV([summary], 'system-summary.csv')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}