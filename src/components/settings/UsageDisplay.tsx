import { AlertTriangle } from 'lucide-react'
import { useUsageStats } from '../../hooks/useUsageStats'

export function UsageDisplay() {
  const { stats, loading, error, getUsagePercentage, warnings } = useUsageStats()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-2 bg-white/10 rounded"></div>
          <div className="h-2 bg-white/10 rounded w-5/6"></div>
          <div className="h-2 bg-white/10 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 p-4 rounded-lg">
        Failed to load usage statistics
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Usage Warnings</span>
          </div>
          <ul className="space-y-1 text-sm text-yellow-400/80">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Characters Used */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Characters Used</span>
            <span>
              {stats.current.charactersUsed.toLocaleString()} / {stats.limits.charactersPerMonth.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`rounded-full h-2 transition-all ${
                getUsagePercentage(stats.current.charactersUsed, stats.limits.charactersPerMonth) >= 80
                  ? 'bg-yellow-500'
                  : 'bg-[#63248d]'
              }`}
              style={{
                width: `${getUsagePercentage(
                  stats.current.charactersUsed,
                  stats.limits.charactersPerMonth
                )}%`
              }}
            />
          </div>
          <div className="text-xs text-white/40">
            {stats.remaining.charactersPerMonth.toLocaleString()} characters remaining this month
          </div>
        </div>

        {/* Voice Clones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Voice Clones</span>
            <span>
              {stats.current.voiceClones} / {stats.limits.voiceClones}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`rounded-full h-2 transition-all ${
                getUsagePercentage(stats.current.voiceClones, stats.limits.voiceClones) >= 80
                  ? 'bg-yellow-500'
                  : 'bg-[#63248d]'
              }`}
              style={{
                width: `${getUsagePercentage(stats.current.voiceClones, stats.limits.voiceClones)}%`
              }}
            />
          </div>
          <div className="text-xs text-white/40">
            {stats.remaining.voiceClones} voice clones remaining
          </div>
        </div>

        {/* API Requests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">API Requests (per minute)</span>
            <span>
              {stats.current.requestsThisMinute} / {stats.limits.requestsPerMinute}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`rounded-full h-2 transition-all ${
                getUsagePercentage(stats.current.requestsThisMinute, stats.limits.requestsPerMinute) >= 80
                  ? 'bg-yellow-500'
                  : 'bg-[#63248d]'
              }`}
              style={{
                width: `${getUsagePercentage(
                  stats.current.requestsThisMinute,
                  stats.limits.requestsPerMinute
                )}%`
              }}
            />
          </div>
          <div className="text-xs text-white/40">
            {stats.remaining.requestsPerMinute} requests remaining this minute
          </div>
        </div>
      </div>

      <div className="text-sm text-white/60 bg-white/5 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Usage Information</h4>
        <ul className="space-y-1">
          <li>• Character usage resets monthly with your billing cycle</li>
          <li>• API rate limits reset every minute</li>
          <li>• Voice clone limits are permanent for your subscription tier</li>
          <li>• Upgrade your plan for higher limits and additional features</li>
        </ul>
      </div>
    </div>
  )
}
