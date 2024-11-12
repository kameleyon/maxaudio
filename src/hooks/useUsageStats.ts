import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UsageStats {
  totalRequests: number;
  audioGenerated: number;
  storageUsed: number;
  lastRequest: Date;
  quotaRemaining: number;
  usageHistory: {
    date: Date;
    requests: number;
    storage: number;
  }[];
  limits: {
    maxRequests: number;
    maxStorage: number;
    maxAudioLength: number;
    maxFileSize: number;
  };
}

interface ExtendedUsageStats extends UsageStats {
  percentageUsed: {
    requests: number;
    storage: number;
  };
  isNearLimit: {
    requests: boolean;
    storage: boolean;
  };
}

const fetchUsageStats = async (): Promise<UsageStats> => {
  try {
    const { data } = await axios.get('/api/usage/stats');
    return {
      ...data,
      lastRequest: new Date(data.lastRequest),
      usageHistory: data.usageHistory.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      }))
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    throw error;
  }
};

export const useUsageStats = () => {
  return useQuery<UsageStats, Error, ExtendedUsageStats>({
    queryKey: ['usageStats'],
    queryFn: fetchUsageStats,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    staleTime: 30000, // Consider data stale after 30 seconds
    select: (data) => ({
      ...data,
      percentageUsed: {
        requests: (data.totalRequests / data.limits.maxRequests) * 100,
        storage: (data.storageUsed / data.limits.maxStorage) * 100
      },
      isNearLimit: {
        requests: data.totalRequests >= data.limits.maxRequests * 0.9,
        storage: data.storageUsed >= data.limits.maxStorage * 0.9
      }
    })
  });
};

// Helper hook for real-time usage tracking
export const useTrackUsage = () => {
  const { refetch } = useUsageStats();

  const trackUsage = async (type: 'request' | 'storage', amount: number) => {
    try {
      await axios.post('/api/usage/track', {
        type,
        amount,
        timestamp: new Date().toISOString()
      });
      // Refetch usage stats after tracking
      refetch();
    } catch (error) {
      console.error('Error tracking usage:', error);
      throw error;
    }
  };

  return { trackUsage };
};

// Helper hook for usage alerts
export const useUsageAlerts = () => {
  const { data: usageStats } = useUsageStats();

  if (!usageStats) return { hasWarnings: false, warnings: [] };

  const warnings = [];

  if (usageStats.percentageUsed.requests >= 90) {
    warnings.push({
      type: 'requests',
      message: 'You are approaching your request limit',
      percentage: usageStats.percentageUsed.requests
    });
  }

  if (usageStats.percentageUsed.storage >= 90) {
    warnings.push({
      type: 'storage',
      message: 'You are approaching your storage limit',
      percentage: usageStats.percentageUsed.storage
    });
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings
  };
};

// Helper hook for usage history
export const useUsageHistory = () => {
  const { data: usageStats } = useUsageStats();

  if (!usageStats) return { history: [], trends: null };

  const history = usageStats.usageHistory;
  
  // Calculate trends
  const trends = {
    requests: {
      daily: history.reduce((acc, curr) => acc + curr.requests, 0) / history.length,
      trend: history[history.length - 1].requests > history[0].requests ? 'up' : 'down'
    },
    storage: {
      daily: history.reduce((acc, curr) => acc + curr.storage, 0) / history.length,
      trend: history[history.length - 1].storage > history[0].storage ? 'up' : 'down'
    }
  };

  return {
    history,
    trends
  };
};
