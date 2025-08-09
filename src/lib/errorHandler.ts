import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  statusCode?: number;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly details?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string, 
    code?: string, 
    statusCode?: number, 
    details?: string,
    isOperational = true
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

export const handleSupabaseError = (error: PostgrestError | Error): ApiError => {
  console.error('🔥 Supabase Error:', error);

  // Handle Supabase PostgrestError
  if ('code' in error && error.code) {
    const postgrestError = error as PostgrestError;
    
    switch (postgrestError.code) {
      case 'PGRST116':
        return {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          details: postgrestError.details,
          statusCode: 404
        };
      
      case 'PGRST301':
        return {
          message: 'Permission denied',
          code: 'FORBIDDEN',
          details: 'You do not have permission to perform this action',
          statusCode: 403
        };
      
      case '23505':
        return {
          message: 'This item already exists',
          code: 'DUPLICATE',
          details: postgrestError.details,
          statusCode: 409
        };
      
      case '23503':
        return {
          message: 'Referenced item does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          details: postgrestError.details,
          statusCode: 400
        };
      
      case '42501':
        return {
          message: 'Insufficient privileges',
          code: 'INSUFFICIENT_PRIVILEGE',
          details: 'Your account does not have the required permissions',
          statusCode: 403
        };
      
      default:
        return {
          message: postgrestError.message || 'Database operation failed',
          code: postgrestError.code,
          details: postgrestError.details,
          statusCode: 400
        };
    }
  }

  // Handle generic errors
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };
};

export const handleAuthError = (error: Error): ApiError => {
  console.error('🔐 Auth Error:', error);

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return {
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
      statusCode: 401
    };
  }

  if (message.includes('email not confirmed')) {
    return {
      message: 'Please check your email and click the confirmation link',
      code: 'EMAIL_NOT_CONFIRMED',
      statusCode: 401
    };
  }

  if (message.includes('user already registered')) {
    return {
      message: 'An account with this email already exists',
      code: 'USER_EXISTS',
      statusCode: 409
    };
  }

  if (message.includes('invalid email')) {
    return {
      message: 'Please provide a valid email address',
      code: 'INVALID_EMAIL',
      statusCode: 400
    };
  }

  if (message.includes('password')) {
    return {
      message: 'Password must be at least 6 characters long',
      code: 'WEAK_PASSWORD',
      statusCode: 400
    };
  }

  if (message.includes('rate limit')) {
    return {
      message: 'Too many attempts. Please wait a moment and try again',
      code: 'RATE_LIMITED',
      statusCode: 429
    };
  }

  return {
    message: error.message || 'Authentication failed',
    code: 'AUTH_ERROR',
    statusCode: 401
  };
};

export const handleNetworkError = (error: Error): ApiError => {
  console.error('🌐 Network Error:', error);

  if (error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection',
      code: 'NETWORK_ERROR',
      statusCode: 0
    };
  }

  if (error.message.includes('timeout')) {
    return {
      message: 'Request timed out. Please try again',
      code: 'TIMEOUT',
      statusCode: 408
    };
  }

  return {
    message: 'Network connection failed',
    code: 'CONNECTION_ERROR',
    statusCode: 0
  };
};

export const showErrorToast = (apiError: ApiError, customMessage?: string) => {
  const message = customMessage || apiError.message;
  
  toast.error(message, {
    description: apiError.details,
    duration: apiError.code === 'RATE_LIMITED' ? 10000 : 5000,
  });
};

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

// Centralized error handler
export const handleError = (
  error: unknown, 
  context?: string,
  showToast = true
): ApiError => {
  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = {
      message: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode
    };
  } else if (error instanceof Error) {
    // Determine error type based on context or error properties
    if (context === 'auth' || error.message.includes('auth')) {
      apiError = handleAuthError(error);
    } else if (context === 'network' || error.message.includes('fetch')) {
      apiError = handleNetworkError(error);
    } else if ('code' in error) {
      apiError = handleSupabaseError(error as PostgrestError);
    } else {
      apiError = {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  } else {
    apiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }

  // Log error for debugging
  console.error('🚨 Handled Error:', {
    context,
    error: apiError,
    originalError: error
  });

  // Show toast notification
  if (showToast) {
    showErrorToast(apiError);
  }

  return apiError;
};

// Async wrapper for error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
  showToast = true
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context, showToast);
    return null;
  }
};

export default {
  handle: handleError,
  withErrorHandling,
  showError: showErrorToast,
  showSuccess: showSuccessToast,
  AppError
};