import React from 'react';
import { AlertCircle, AlertTriangle, Ban, Clock, CreditCard, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ErrorDetails {
  error: string;
  details?: string;
  code?: string;
  limit?: number;
  current?: number;
  remaining?: number;
  resetIn?: number;
  upgradeOptions?: {
    nextTier: string;
    features: string[];
    price: number;
  };
}

interface ErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const navigate = useNavigate();

  const getErrorIcon = () => {
    switch (error.code) {
      case 'SUBSCRIPTION_REQUIRED':
      case 'PAYMENT_REQUIRED':
        return <CreditCard className="w-8 h-8 text-yellow-500" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'CHARACTER_LIMIT_EXCEEDED':
      case 'VOICE_CLONE_LIMIT_EXCEEDED':
        return <Ban className="w-8 h-8 text-red-500" />;
      case 'FEATURE_NOT_AVAILABLE':
        return <Zap className="w-8 h-8 text-purple-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getActionButton = () => {
    switch (error.code) {
      case 'SUBSCRIPTION_REQUIRED':
      case 'PAYMENT_REQUIRED':
      case 'CHARACTER_LIMIT_EXCEEDED':
      case 'VOICE_CLONE_LIMIT_EXCEEDED':
      case 'FEATURE_NOT_AVAILABLE':
        return (
          <button
            onClick={() => navigate('/settings?tab=subscription')}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
          >
            Upgrade Plan
          </button>
        );
      case 'RATE_LIMIT_EXCEEDED':
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Try again in {Math.ceil(error.resetIn || 0)} seconds</span>
          </div>
        );
      default:
        return onRetry ? (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Try Again
          </button>
        ) : null;
    }
  };

  const getUsageInfo = () => {
    if (error.limit && error.current !== undefined) {
      return (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Usage</span>
            <span>
              {error.current.toLocaleString()} / {error.limit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#63248d]"
              style={{ width: `${(error.current / error.limit) * 100}%` }}
            />
          </div>
          {error.remaining !== undefined && (
            <p className="text-sm text-white/60 mt-2">
              {error.remaining.toLocaleString()} remaining
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getUpgradeInfo = () => {
    if (error.upgradeOptions) {
      return (
        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Upgrade to {error.upgradeOptions.nextTier}</h4>
          <ul className="space-y-2">
            {error.upgradeOptions.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                <AlertCircle className="w-4 h-4 text-[#63248d]" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm">
            Starting at ${error.upgradeOptions.price}/month
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#1a1a2e] rounded-lg border border-white/10">
      <div className="flex items-start gap-4">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{error.error}</h3>
          {error.details && (
            <p className="mt-1 text-white/60">{error.details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {getUsageInfo()}
      {getUpgradeInfo()}

      <div className="mt-6 flex justify-end">
        {getActionButton()}
      </div>
    </div>
  );
}
