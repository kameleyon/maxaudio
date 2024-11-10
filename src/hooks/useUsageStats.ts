import { useState, useEffect } from 'react'
import axios from 'axios'

export interface UsageStats {
  current: {
    charactersUsed: number
    voiceClones: number
    requestsThisMinute: number
  }
  limits: {
    requestsPerMinute: number
    charactersPerMonth: number
    voiceClones: number
  }
  remaining: {
    charactersPerMonth: number
    voiceClones: number
    requestsPerMinute: number
  }
}

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/audio/usage-stats')
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch usage statistics')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats on mount and every minute
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate percentage used for each limit
  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min(Math.round((current / limit) * 100), 100)
  }

  // Check if approaching limits (80% or more)
  const checkLimits = () => {
    if (!stats) return null

    const warnings = []
    const { current, limits } = stats

    if (getUsagePercentage(current.charactersUsed, limits.charactersPerMonth) >= 80) {
      warnings.push('Approaching monthly character limit')
    }
    if (getUsagePercentage(current.voiceClones, limits.voiceClones) >= 80) {
      warnings.push('Approaching voice clone limit')
    }
    if (getUsagePercentage(current.requestsThisMinute, limits.requestsPerMinute) >= 80) {
      warnings.push('Approaching rate limit')
    }

    return warnings.length > 0 ? warnings : null
  }

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    getUsagePercentage,
    warnings: checkLimits()
  }
}
