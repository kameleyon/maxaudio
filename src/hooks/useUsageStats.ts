import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../services/api';

export interface UsageStats {
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

const defaultStats: UsageStats = {
  current: {
    charactersUsed: 0,
    requestsThisMinute: 0,
    voiceClones: 0
  },
  limits: {
    charactersPerMonth: 1000000,
    requestsPerMinute: 60,
    voiceClones: 10
  },
  remaining: {
    charactersPerMonth: 1000000,
    requestsPerMinute: 60,
    voiceClones: 10
  },
  history: [],
  lastUpdated: new Date().toISOString()
};

const fetchUsageStats = async (): Promise<UsageStats> => {
  try {
    const { data } = await api.get<UsageStats>('/usage/stats');
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error details:', {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status
    });
    return defaultStats;
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
  } = useQuery<UsageStats>({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000,
    retry: 1,
    staleTime: 30000,
    retryDelay: 5000,
    initialData: defaultStats
  });

  const currentStats = stats || defaultStats;

  const warnings = [
    ...(getUsagePercentage(currentStats.current.charactersUsed, currentStats.limits.charactersPerMonth) >= 80 
      ? ['You are approaching your monthly character limit'] 
      : []),
    ...(getUsagePercentage(currentStats.current.requestsThisMinute, currentStats.limits.requestsPerMinute) >= 80 
      ? ['High API request rate detected'] 
      : []),
    ...(getUsagePercentage(currentStats.current.voiceClones, currentStats.limits.voiceClones) >= 80 
      ? ['You are approaching your voice clone limit'] 
      : [])
  ];

  return {
    stats: currentStats,
    loading,
    error,
    getUsagePercentage,
    warnings,
    refreshStats: refetch
  };
};
