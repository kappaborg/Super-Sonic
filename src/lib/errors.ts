/**
 * API error codes - categorizes all possible API errors
 */
export enum ApiErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_CSRF_TOKEN = 'INVALID_CSRF_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  AUTH_ERROR = 'AUTH_ERROR',
  
  // Data validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST_BODY = 'INVALID_REQUEST_BODY',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONFLICT = 'CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Voice processing errors
  VOICE_PROCESSING_ERROR = 'VOICE_PROCESSING_ERROR',
  VOICE_AUTHENTICATION_FAILED = 'VOICE_AUTHENTICATION_FAILED',
  VOICE_FEATURES_NOT_FOUND = 'VOICE_FEATURES_NOT_FOUND',

  // Other errors
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Organization related errors
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  ORGANIZATION_ACCESS_DENIED = 'ORGANIZATION_ACCESS_DENIED',
  INVALID_ORGANIZATION_ROLE = 'INVALID_ORGANIZATION_ROLE',
  
  // Meeting related errors
  MEETING_NOT_FOUND = 'MEETING_NOT_FOUND',
  MEETING_ACCESS_DENIED = 'MEETING_ACCESS_DENIED',
  MEETING_ALREADY_STARTED = 'MEETING_ALREADY_STARTED',
  MEETING_ALREADY_ENDED = 'MEETING_ALREADY_ENDED',
  
  // Voice authentication specific errors
  VOICE_ENROLLMENT_REQUIRED = 'VOICE_ENROLLMENT_REQUIRED',
  VOICE_SAMPLE_TOO_SHORT = 'VOICE_SAMPLE_TOO_SHORT',
  VOICE_SAMPLE_TOO_NOISY = 'VOICE_SAMPLE_TOO_NOISY',
  VOICE_VERIFICATION_FAILED = 'VOICE_VERIFICATION_FAILED',
  MAX_VERIFICATION_ATTEMPTS_EXCEEDED = 'MAX_VERIFICATION_ATTEMPTS_EXCEEDED',
}

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Interface for error context
 */
export interface ErrorContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  params?: Record<string, any>;
  severity?: ErrorSeverity;
  timestamp?: Date;
  [key: string]: any;
}

/**
 * API Error class - standardized error object
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode: number;
  details?: any;
  context?: ErrorContext;
  severity: ErrorSeverity;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.context = context;
    this.severity = context?.severity || this.determineSeverity();
    
    // Set up proper stack trace for error object
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Determine error severity based on status code and error code
   */
  private determineSeverity(): ErrorSeverity {
    if (this.statusCode >= 500) {
      return ErrorSeverity.HIGH;
    }
    
    switch (this.code) {
      case ApiErrorCode.RATE_LIMIT_EXCEEDED:
      case ApiErrorCode.UNAUTHORIZED:
      case ApiErrorCode.ACCESS_DENIED:
        return ErrorSeverity.MEDIUM;
      
      case ApiErrorCode.VALIDATION_ERROR:
      case ApiErrorCode.RECORD_NOT_FOUND:
      case ApiErrorCode.NOT_FOUND:
        return ErrorSeverity.LOW;
      
      case ApiErrorCode.INTERNAL_SERVER_ERROR:
      case ApiErrorCode.DATABASE_ERROR:
      case ApiErrorCode.EXTERNAL_SERVICE_ERROR:
        return ErrorSeverity.CRITICAL;
      
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Convert error object to JSON format for API response
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        requestId: this.context?.requestId,
        ...(this.details && { details: this.details }),
      }
    };
  }

  /**
   * Add additional context to the error
   */
  addContext(context: Partial<ErrorContext>): this {
    this.context = {
      ...this.context,
      ...context,
      timestamp: this.context?.timestamp || new Date(),
    };
    return this;
  }
}

/**
 * Check if an object is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError || 
    (typeof error === 'object' && 
     error !== null && 
     'code' in error && 
     'statusCode' in error &&
     'message' in error)
  );
}

/**
 * Creates a 401 Unauthorized error
 */
export function createUnauthorizedError(message: string = 'You do not have permission for this operation'): ApiError {
  return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401);
}

/**
 * Creates a 403 Forbidden error
 */
export function createForbiddenError(message: string = 'You do not have access to this resource'): ApiError {
  return new ApiError(ApiErrorCode.ACCESS_DENIED, message, 403); 
}

/**
 * Creates a 404 Not Found error
 */
export function createNotFoundError(
  resource: string = 'Resource', 
  message?: string
): ApiError {
  return new ApiError(
    ApiErrorCode.NOT_FOUND,
    message || `${resource} not found`,
    404
  );
}

/**
 * Creates a 429 Too Many Requests error
 */
export function createRateLimitError(
  retryAfterSeconds: number,
  message?: string
): ApiError {
  return new ApiError(
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    message || `Rate limit exceeded. Please try again after ${retryAfterSeconds} seconds.`,
    429,
    { retryAfter: retryAfterSeconds }
  );
}

/**
 * Create a voice authentication error
 */
export function createVoiceAuthError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(code, message, 401, details);
}

/**
 * Create an organization-related error
 */
export function createOrganizationError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(code, message, 403, details);
}

/**
 * Create a meeting-related error
 */
export function createMeetingError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(code, message, 404, details);
}

/**
 * Log error with enhanced context and severity
 */
export function logError(
  error: Error,
  context?: ErrorContext
): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    severity: error instanceof ApiError ? error.severity : ErrorSeverity.MEDIUM,
    ...(error instanceof ApiError && {
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    }),
    ...(context && { additionalContext: context }),
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error][${errorInfo.severity.toUpperCase()}]`, errorInfo);
  } else {
    // In production, use configured logger service with proper error tracking
    // logger.error(errorInfo);
    console.error(`[API Error][${errorInfo.severity.toUpperCase()}]`, {
      ...errorInfo,
      stack: undefined, // Don't log stack traces in production
    });
  }
} 