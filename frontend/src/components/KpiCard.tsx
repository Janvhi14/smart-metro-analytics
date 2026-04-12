interface KpiCardProps {
  title: string
  value: string | number
  subtitle: string
  color: string
}

export default function KpiCard({ title, value, subtitle, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}