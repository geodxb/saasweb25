import { toast } from 'sonner';
import { analytics, AnalyticsEvents } from './analytics';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  retryAfter?: number;
}

export class ClientFlowError extends Error {
  public code: string;
  public retryable: boolean;
  public retryAfter?: number;
  public details?: any;

  constructor(code: string, message: string, options?: {
    retryable?: boolean;
    retryAfter?: number;
    details?: any;
  }) {
    super(message);
    this.name = 'ClientFlowError';
    this.code = code;
    this.retryable = options?.retryable || false;
    this.retryAfter = options?.retryAfter;
    this.details = options?.details;
  }
}

// Error codes and their user-friendly messages
export const ERROR_MESSAGES = {
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'You\'ve made too many requests. Please wait a moment before trying again.',
  SCRAPING_LIMIT_EXCEEDED: 'You\'ve reached your hourly scraping limit. Please try again later.',
  
  // API errors
  API_UNAVAILABLE: 'Our service is temporarily unavailable. Please try again in a few minutes.',
  INVALID_API_KEY: 'API configuration error. Please contact support.',
  QUOTA_EXCEEDED: 'API quota exceeded. Please upgrade your plan or try again tomorrow.',
  GOOGLE_MAPS_API_ERROR: 'Google Maps service is currently unavailable. Please try again later.',
  
  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'You need to sign in to perform this action.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  
  // Data errors
  INVALID_DATA: 'The provided data is invalid. Please check your input.',
  NOT_FOUND: 'The requested resource was not found.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export class ErrorHandler {
  static handle(error: any, context?: string): ApiError {
    let apiError: ApiError;

    // Check for Google Maps API errors first by examining the error message
    if (error.message && typeof error.message === 'string' && 
        error.message.toLowerCase().includes('google maps api error')) {
      apiError = {
        code: 'GOOGLE_MAPS_API_ERROR',
        message: ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR,
        retryable: true,
      };
    } else if (error instanceof ClientFlowError) {
      apiError = {
        code: error.code,
        message: ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message,
        retryable: error.retryable,
        retryAfter: error.retryAfter,
        details: error.details,
      };
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      apiError = {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        retryable: true,
      };
    } else if (error.name === 'AbortError') {
      apiError = {
        code: 'TIMEOUT_ERROR',
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
        retryable: true,
      };
    } else if (error.status) {
      // HTTP errors
      switch (error.status) {
        case 400:
          apiError = {
            code: 'INVALID_DATA',
            message: ERROR_MESSAGES.INVALID_DATA,
            retryable: false,
          };
          break;
        case 401:
          apiError = {
            code: 'UNAUTHORIZED',
            message: ERROR_MESSAGES.UNAUTHORIZED,
            retryable: false,
          };
          break;
        case 403:
          apiError = {
            code: 'FORBIDDEN',
            message: ERROR_MESSAGES.FORBIDDEN,
            retryable: false,
          };
          break;
        case 404:
          apiError = {
            code: 'NOT_FOUND',
            message: ERROR_MESSAGES.NOT_FOUND,
            retryable: false,
          };
          break;
        case 408:
          apiError = {
            code: 'TIMEOUT_ERROR',
            message: ERROR_MESSAGES.TIMEOUT_ERROR,
            retryable: true,
          };
          break;
        case 429:
          apiError = {
            code: 'RATE_LIMIT_EXCEEDED',
            message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
            retryable: true,
            retryAfter: parseInt(error.headers?.['retry-after']) || 60,
          };
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          // Check if this is a Google Maps API specific error
          if (context === 'google_maps_search' || context === 'google_maps_details') {
            apiError = {
              code: 'GOOGLE_MAPS_API_ERROR',
              message: ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR,
              retryable: true,
            };
          } else {
            apiError = {
              code: 'API_UNAVAILABLE',
              message: ERROR_MESSAGES.API_UNAVAILABLE,
              retryable: true,
            };
          }
          break;
        default:
          apiError = {
            code: 'UNKNOWN_ERROR',
            message: ERROR_MESSAGES.UNKNOWN_ERROR,
            retryable: true,
          };
      }
    } else {
      // Handle response errors from fetch
      if (error.response) {
        return this.handle({ status: error.response.status, headers: error.response.headers }, context);
      }
      
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        retryable: true,
      };
    }

    // Log error for analytics
    this.logError(apiError, context);

    return apiError;
  }

  static showError(error: ApiError, options?: {
    showRetry?: boolean;
    onRetry?: () => void;
  }) {
    const { showRetry = false, onRetry } = options || {};

    if (showRetry && error.retryable && onRetry) {
      toast.error(error.message, {
        action: {
          label: error.retryAfter ? `Retry in ${error.retryAfter}s` : 'Retry',
          onClick: onRetry,
        },
        duration: error.retryAfter ? error.retryAfter * 1000 : 5000,
      });
    } else {
      toast.error(error.message);
    }
  }

  static logError(error: ApiError, context?: string) {
    // Log to analytics
    analytics.track({
      name: AnalyticsEvents.ERROR_OCCURRED,
      properties: {
        errorCode: error.code,
        errorMessage: error.message,
        context: context || 'unknown',
        retryable: error.retryable,
        retryAfter: error.retryAfter,
      },
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ClientFlow Error:', {
        code: error.code,
        message: error.message,
        context,
        details: error.details,
      });
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const apiError = this.handle(error, context);

        // Don't retry if not retryable or on last attempt
        if (!apiError.retryable || attempt === maxRetries) {
          throw new ClientFlowError(apiError.code, apiError.message, {
            retryable: apiError.retryable,
            retryAfter: apiError.retryAfter,
            details: apiError.details,
          });
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt),
          10000 // Max 10 seconds
        );

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        const totalDelay = delay + jitter;

        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }

    throw lastError;
  }
}

// Utility function for handling async operations with error handling
export const handleAsync = async <T>(
  operation: () => Promise<T>,
  context?: string,
  showToast = true
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const apiError = ErrorHandler.handle(error, context);
    
    if (showToast) {
      ErrorHandler.showError(apiError, {
        showRetry: apiError.retryable,
        onRetry: () => {
          // The retry logic would need to be implemented by the caller
          console.log('Retry requested for:', context);
        }
      });
    }
    
    return null;
  }
};