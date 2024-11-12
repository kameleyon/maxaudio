import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UsageStats {
  current: {
    charactersUsed: number;
    requestsThisMinute: number;
    voiceClones: number;
  };
  limits: {
    charactersPerMonth: number;
    requestsPerMinute: number;
    voiceClones: number;
  };
  remaining: {
    charactersPerMonth: number;
    requestsPerMinute: number;
    voiceClones: number;
  };
  history: Array<{
    date: string;
    requests: number;
    storage: number;
  }>;
  lastUpdated: string;
}

const fetchUsageStats = async (): Promise<UsageStats> => {
  try {
    const { data } = await axios.get('/api/usage/stats');
    return data;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    throw error;
  }
};

const getUsagePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (used / total) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

export const useUsageStats = () => {
  const { data, isLoading: loading, error, refetch } = useQuery<UsageStats, Error>({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    staleTime: 30000 // Consider data stale after 30 seconds
  });

  const warnings = data ? [
    ...(getUsagePercentage(data.current.charactersUsed, data.limits.charactersPerMonth) >= 80 
      ? ['You are approaching your monthly character limit'] 
      : []),
    ...(getUsagePercentage(data.current.requestsThisMinute, data.limits.requestsPerMinute) >= 80 
      ? ['High API request rate detected'] 
      : []),
    ...(getUsagePercentage(data.current.voiceClones, data.limits.voiceClones) >= 80 
      ? ['You are approaching your voice clone limit'] 
      : [])
  ] : [];

  return {
    stats: data,
    loading,
    error,
    getUsagePercentage,
    warnings,
    refreshStats: refetch
  };
};
