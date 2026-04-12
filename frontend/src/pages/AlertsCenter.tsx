import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useState } from 'react'

const fetchAlerts = () => api.get('/api/stations/../alerts' ).then(r => r.data)
const fetchAllAlerts = () => api.get('/api/analytics/summary').then(r => r.data)

const severityColor: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function AlertsCenter() {
  const [filter, setFilter] = useState('all')
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts-list'],
    queryFn: () => api.get('/api/alerts/').then(r => r.data),
    refetchInterval: 15000,
  })

  const filtered = filter === 'all'
    ? alerts
    : alerts?.filter((a: any) => a.severity === filter)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Alerts Center</h1>
        <span className="text-sm text-gray-500">Auto-refreshes every 15s</span>
      </div>

      {/* Severity filter */}
      <div className="flex gap-2">
        {['all', 'critical', 'high', 'medium', 'low'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-slate-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {isLoading && <p className="text-gray-500">Loading alerts...</p>}
        {filtered?.map((alert: any) => (
          <div key={alert.id} className="bg-white rounded-xl shadow p-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${severityColor[alert.severity]}`}>
                  {alert.severity}
                </span>
                <span className="text-sm font-medium text-gray-700 capitalize">{alert.type.replace('_', ' ')}</span>
              </div>
              <p className="text-gray-800">{alert.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              {alert.resolved_at
                ? <span className="text-xs text-green-600 font-medium">Resolved</span>
                : <span className="text-xs text-red-500 font-medium">Active</span>
              }
            </div>
          </div>
        ))}
        {!isLoading && filtered?.length === 0 && (
          <p className="text-gray-500 text-center py-8">No alerts found</p>
        )}
      </div>
    </div>
  )
}