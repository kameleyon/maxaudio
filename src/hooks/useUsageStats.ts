import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';

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

export const useUsageStats = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const fetchUsageStats = async (): Promise<UsageStats> => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch('/api/usage/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please sign in.');
      }
      if (response.status === 403) {
        throw new Error('No active subscription found.');
      }
      throw new Error('Failed to fetch usage stats');
    }

    return response.json();
  };

  const { data: rawStats, isLoading, error } = useQuery({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000, // Refresh every minute
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('No active subscription')) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!getToken // Only run query when auth token is available
  });

  const formattedData = useMemo(() => {
    if (!rawStats) return null;

    // Calculate percentages
    const percentages = {
      characters: (rawStats.current.charactersUsed / rawStats.limits.charactersPerMonth) * 100,
      voiceClones: (rawStats.current.voiceClones / rawStats.limits.voiceClones) * 100,
      requests: (rawStats.current.requestsThisMinute / rawStats.limits.requestsPerMinute) * 100
    };

    // Format trend data for charts
    const chartData = rawStats.trends.daily.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      Characters: day.charactersUsed,
      Requests: day.requestCount,
      'Voice Clones': day.voiceClones
    }));

    // Calculate usage by category
    const categories = [
      {
        name: 'Characters',
        used: rawStats.current.charactersUsed,
        total: rawStats.limits.charactersPerMonth,
        percentage: percentages.characters
      },
      {
        name: 'Voice Clones',
        used: rawStats.current.voiceClones,
        total: rawStats.limits.voiceClones,
        percentage: percentages.voiceClones
      },
      {
        name: 'API Requests',
        used: rawStats.current.requestsThisMinute,
        total: rawStats.limits.requestsPerMinute,
        percentage: percentages.requests
      }
    ];

    return {
      raw: rawStats,
      percentages,
      chartData,
      categories,
      lastUpdated: new Date(rawStats.lastUpdated).toLocaleString()
    };
  }, [rawStats]);

  // Function to manually refresh stats
  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: ['usageStats'] });
  };

  return {
    stats: formattedData,
    rawStats,
    isLoading,
    error,
    refreshStats
  };
};
