import { AlertTriangle, Zap, Clock, Mic2, RefreshCw } from 'lucide-react';
import { useUsageStats } from '../../hooks/useUsageStats';
import { useAuth } from '../../contexts/AuthContext';

export function UsageDisplay() {
  const { user } = useAuth();
  const { stats, loading, error, refreshStats } = useUsageStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-2 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Error loading usage statistics</span>
          </div>
          <button
            onClick={() => refreshStats()}
            className="flex items-center gap-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </button>
        </div>
        <p className="text-sm text-red-400/80">{error.message}</p>
      </div>
    );
  }

  if (!stats || !user) {
    return (
      <div className="text-white/60 bg-white/5 p-4 rounded-lg text-center">
        No usage data available
      </div>
    );
  }

  const usageMetrics = [
    {
      icon: Zap,
      label: 'Characters Used',
      current: stats.current.charactersUsed,
      limit: stats.limits.charactersPerMonth,
      unit: ''
    },
    {
      icon: Clock,
      label: 'Requests This Minute',
      current: stats.current.requestsThisMinute,
      limit: stats.limits.requestsPerMinute,
      unit: '/min'
    },
    {
      icon: Mic2,
      label: 'Voice Clones',
      current: stats.current.voiceClones,
      limit: stats.limits.voiceClones,
      unit: ''
    }
  ];

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-[#63248d]';
  };

  return (
    <div className="space-y-6">
      {/* Usage Warnings */}
      {usageMetrics.some(metric => getUsagePercentage(metric.current, metric.limit) > 90) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Usage Warning</span>
          </div>
          <p className="text-sm text-yellow-400/80">
            You're approaching your usage limits. Consider upgrading your plan to avoid service interruption.
          </p>
        </div>
      )}

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usageMetrics.map((metric, index) => {
          const percentage = getUsagePercentage(metric.current, metric.limit);
          const usageColor = getUsageColor(percentage);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <metric.icon className="w-4 h-4" />
                  <span>{metric.label}</span>
                </div>
                <span>
                  {metric.current.toLocaleString()}/{metric.limit.toLocaleString()}
                  {metric.unit}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${usageColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>Last updated: {new Date(stats.lastUpdated).toLocaleString()}</span>
        <button
          onClick={() => refreshStats()}
          className="flex items-center gap-1 hover:text-white/60 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>
  );
}
