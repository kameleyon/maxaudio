import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock, Activity, HardDrive, Zap, Database } from 'lucide-react'
import { format } from 'date-fns'
import { LucideIcon } from 'lucide-react'

interface Analytics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  usage: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    peakHour: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    bandwidth: number;
  };
  performance: {
    uptime: number;
    averageLoad: number;
    cacheHitRate: number;
    queueLength: number;
  };
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface ChartData {
  userActivity: TimeSeriesData[];
  systemLoad: TimeSeriesData[];
  errorRates: TimeSeriesData[];
  responseTime: TimeSeriesData[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  suffix?: string;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsResponse, chartResponse] = await Promise.all([
          fetch('/api/admin/analytics'),
          fetch(`/api/admin/analytics/charts?range=${timeRange}`)
        ])

        if (analyticsResponse.ok && chartResponse.ok) {
          const [analyticsData, chartData] = await Promise.all([
            analyticsResponse.json(),
            chartResponse.json()
          ])

          setAnalytics(analyticsData)
          setChartData(chartData)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (isLoading || !analytics || !chartData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, trend = 0, suffix = '' }: StatCardProps) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend !== 0 && (
          <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium text-white/60">{title}</h3>
      <p className="mt-2 text-2xl font-semibold">
        {value.toLocaleString()}{suffix}
      </p>
    </div>
  )

  const Chart = ({ data, label }: { data: TimeSeriesData[], label: string }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-6">
      <h3 className="text-lg font-medium mb-4">{label}</h3>
      <div className="h-48 flex items-end gap-1">
        {data.map((point, index) => {
          const height = `${(point.value / Math.max(...data.map(d => d.value)) * 100)}%`
          return (
            <div
              key={index}
              className="flex-1 bg-primary/20 hover:bg-primary/30 transition-colors rounded-t"
              style={{ height }}
              title={`${format(new Date(point.timestamp), 'PPp')}: ${point.value}`}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.users.total}
          icon={Users}
          trend={analytics.users.growth}
        />
        <StatCard
          title="Active Users"
          value={analytics.users.active}
          icon={Activity}
        />
        <StatCard
          title="New Users Today"
          value={analytics.users.newToday}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Response Time"
          value={analytics.usage.averageResponseTime}
          icon={Clock}
          suffix="ms"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Chart data={chartData.userActivity} label="User Activity" />
        <Chart data={chartData.systemLoad} label="System Load" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
          <div className="space-y-4">
            {[
              { label: 'CPU Usage', value: analytics.resources.cpuUsage, icon: Zap },
              { label: 'Memory Usage', value: analytics.resources.memoryUsage, icon: HardDrive },
              { label: 'Disk Usage', value: analytics.resources.diskUsage, icon: Database }
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/60" />
                  <span className="text-white/60">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Uptime</span>
              <span>{Math.floor(analytics.performance.uptime / 86400)} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Average Load</span>
              <span>{analytics.performance.averageLoad.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Cache Hit Rate</span>
              <span>{analytics.performance.cacheHitRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Queue Length</span>
              <span>{analytics.performance.queueLength}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-medium mb-4">Error Rates</h3>
          <div className="h-48">
            <Chart data={chartData.errorRates} label="" />
          </div>
          <div className="mt-4 text-center">
            <span className="text-2xl font-semibold text-red-400">
              {analytics.usage.errorRate}%
            </span>
            <p className="text-sm text-white/60">Current Error Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
