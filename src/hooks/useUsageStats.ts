import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UsageStats {
  current: {
    charactersUsed: number;
    voiceClones: number;
    requestsThisMinute: number;
  };
  limits: {
    requestsPerMinute: number;
    charactersPerMonth: number;
    voiceClones: number;
  };
  remaining: {
    charactersPerMonth: number;
    voiceClones: number;
    requestsPerMinute: number;
  };
  trends: {
    daily: Array<{
      date: string;
      charactersUsed: number;
      requestCount: number;
      voiceClones: number;
    }>;
    averages: {
      charactersPerDay: number;
      requestsPerDay: number;
    };
  };
  lastUpdated: string;
}

const fetchUsageStats = async (): Promise<UsageStats> => {
  const response = await fetch('/api/usage/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch usage stats');
  }
  return response.json();
};

export const useUsageStats = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000, // Refresh every minute
  });

  const formattedData = useMemo(() => {
    if (!stats) return null;

    // Calculate percentages
    const percentages = {
      characters: (stats.current.charactersUsed / stats.limits.charactersPerMonth) * 100,
      voiceClones: (stats.current.voiceClones / stats.limits.voiceClones) * 100,
      requests: (stats.current.requestsThisMinute / stats.limits.requestsPerMinute) * 100,
    };

    // Format trend data for charts
    const chartData = stats.trends.daily.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      Characters: day.charactersUsed,
      Requests: day.requestCount,
      'Voice Clones': day.voiceClones,
    }));

    // Calculate usage by category
    const categories = [
      {
        name: 'Characters',
        used: stats.current.charactersUsed,
        total: stats.limits.charactersPerMonth,
        percentage: percentages.characters,
      },
      {
        name: 'Voice Clones',
        used: stats.current.voiceClones,
        total: stats.limits.voiceClones,
        percentage: percentages.voiceClones,
      },
      {
        name: 'API Requests',
        used: stats.current.requestsThisMinute,
        total: stats.limits.requestsPerMinute,
        percentage: percentages.requests,
      },
    ];

    return {
      raw: stats,
      percentages,
      chartData,
      categories,
      lastUpdated: new Date(stats.lastUpdated).toLocaleString(),
    };
  }, [stats]);

  // Function to manually refresh stats
  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: ['usageStats'] });
  };

  return {
    stats: formattedData,
    isLoading,
    error,
    refreshStats,
  };
};
