import { useQuery } from '@tanstack/react-query'
import { fetchOntimePerformance, fetchDelayByCause } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']

export default function TripAnalytics() {
  const { data: ontime } = useQuery({ queryKey: ['ontime'], queryFn: fetchOntimePerformance })
  const { data: delayCause } = useQuery({ queryKey: ['delay-cause'], queryFn: fetchDelayByCause })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Trip Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* On-time by line */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">On-Time % by Line</h2>
          <p className="text-xs text-gray-400 mb-4">Trips with delay under 5 minutes</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ontime ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="line_name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Bar dataKey="on_time_pct" name="On-Time %" radius={[4, 4, 0, 0]}>
                {ontime?.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg delay by line */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Avg Delay by Line</h2>
          <p className="text-xs text-gray-400 mb-4">Average delay in minutes per line</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ontime ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="line_name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(v: any) => `${v} min`} />
              <Bar dataKey="avg_delay" name="Avg Delay (min)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delay cause pie */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Delay Causes</h2>
          <p className="text-xs text-gray-400 mb-4">Breakdown by cause type</p>
          {delayCause && delayCause.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={delayCause} dataKey="count" nameKey="cause" cx="50%" cy="50%" outerRadius={100} label={({ cause, percent }) => `${cause} ${(percent * 100).toFixed(0)}%`}>
                  {delayCause.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No delay event data yet
            </div>
          )}
        </div>

        {/* Line performance table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Line Performance Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Line</th>
                <th className="pb-2">Total Trips</th>
                <th className="pb-2">On-Time %</th>
                <th className="pb-2">Avg Delay</th>
              </tr>
            </thead>
            <tbody>
              {ontime?.map((line: any) => (
                <tr key={line.line_id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{line.line_name}</td>
                  <td className="py-2">{line.total_trips}</td>
                  <td className="py-2">
                    <span className={`font-semibold ${line.on_time_pct >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                      {line.on_time_pct}%
                    </span>
                  </td>
                  <td className="py-2">{line.avg_delay} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}