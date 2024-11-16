import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../services/api';

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

interface ErrorResponse {
  message: string;
  status?: number;
  data?: any;
}

const fetchUsageStats = async (): Promise<UsageStats> => {
  try {
    const { data } = await api.get('/usage/stats');
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error details:', {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status
    });
    throw new Error(
      axiosError.response?.data?.message || 
      axiosError.message || 
      'Failed to fetch usage statistics'
    );
  }
};

const getUsagePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (used / total) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

export const useUsageStats = () => {
  const { 
    data: stats, 
    isLoading: loading, 
    error,
    refetch
  } = useQuery<UsageStats, Error>({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    staleTime: 30000 // Consider data stale after 30 seconds
  });

  const warnings = stats ? [
    ...(getUsagePercentage(stats.current.charactersUsed, stats.limits.charactersPerMonth) >= 80 
      ? ['You are approaching your monthly character limit'] 
      : []),
    ...(getUsagePercentage(stats.current.requestsThisMinute, stats.limits.requestsPerMinute) >= 80 
      ? ['High API request rate detected'] 
      : []),
    ...(getUsagePercentage(stats.current.voiceClones, stats.limits.voiceClones) >= 80 
      ? ['You are approaching your voice clone limit'] 
      : [])
  ] : [];

  return {
    stats,
    loading,
    error,
    getUsagePercentage,
    warnings,
    refreshStats: refetch
  };
};
