// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  organization?: string;
  createdAt: string;
}

// Kimlik doğrulama yanıt tipi
export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

// Kayıt isteği tipi
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization?: string;
}

// Giriş isteği tipi
export interface LoginRequest {
  email: string;
  password: string;
}

// Oturum bilgi tipi
export interface Session {
  userId: string;
  expiresAt: string;
}

// Ses doğrulama isteği tipi
export interface VoiceAuthRequest {
  userId: string;
  voiceprintData: number[];
}

// Ses doğrulama yanıt tipi
export interface VoiceAuthResponse {
  authenticated: boolean;
  confidence: number;
  token?: string;
}

// Toplantı tipi
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  organizerId: string;
  participants: MeetingParticipant[];
  securityLevel: 'low' | 'medium' | 'high';
  accessCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Toplantı katılımcısı tipi
export interface MeetingParticipant {
  id: string;
  userId: string;
  meetingId: string;
  status: 'invited' | 'confirmed' | 'declined';
  role: 'organizer' | 'presenter' | 'participant';
  joinedAt?: string;
  leftAt?: string;
}

// Toplantı oluşturma isteği tipi
export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  participants: {
    userId: string;
    role: 'presenter' | 'participant';
  }[];
  securityLevel: 'low' | 'medium' | 'high';
}

// Toplantı güncelleştirme isteği tipi
export interface UpdateMeetingRequest {
  id: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  securityLevel?: 'low' | 'medium' | 'high';
}

// Toplantı katılım isteği tipi
export interface JoinMeetingRequest {
  meetingId: string;
  accessCode?: string;
  voiceprintData?: number[];
}

// Toplantı katılım yanıt tipi
export interface JoinMeetingResponse {
  success: boolean;
  meeting?: Meeting;
  connectionInfo?: {
    socketUrl: string;
    roomId: string;
    token: string;
  };
  error?: string;
}

// Toplantı mesajı tipi
export interface MeetingMessage {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  type: 'text' | 'audio' | 'system';
  createdAt: string;
  secure?: boolean;
  metadata?: Record<string, any>;
}

// API Error Codes
export enum ApiErrorCode {
  // General errors
  UNKNOWN_ERROR = 'unknown_error',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  BAD_REQUEST = 'bad_request',
  
  // Authentication errors
  UNAUTHORIZED = 'unauthorized',
  ACCESS_DENIED = 'access_denied',
  INVALID_TOKEN = 'invalid_token',
  INVALID_CSRF_TOKEN = 'invalid_csrf_token',
  SESSION_EXPIRED = 'session_expired',
  AUTH_ERROR = 'auth_error',
  
  // Data validation errors
  VALIDATION_ERROR = 'validation_error',
  INVALID_REQUEST_BODY = 'invalid_request_body',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  
  // Database errors
  DATABASE_ERROR = 'database_error',
  RECORD_NOT_FOUND = 'record_not_found',
  NOT_FOUND = 'not_found',
  DUPLICATE_ENTRY = 'duplicate_entry',
  CONFLICT = 'conflict',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // Voice processing errors
  VOICE_PROCESSING_ERROR = 'voice_processing_error',
  VOICE_AUTHENTICATION_FAILED = 'voice_authentication_failed',
  VOICE_FEATURES_NOT_FOUND = 'voice_features_not_found',

  // Other errors
  FEATURE_DISABLED = 'feature_disabled',
  EXTERNAL_SERVICE_ERROR = 'external_service_error',
  
  // Organization related errors
  ORGANIZATION_NOT_FOUND = 'organization_not_found',
  ORGANIZATION_ACCESS_DENIED = 'organization_access_denied',
  INVALID_ORGANIZATION_ROLE = 'invalid_organization_role',
  
  // Meeting related errors
  MEETING_NOT_FOUND = 'meeting_not_found',
  MEETING_ACCESS_DENIED = 'meeting_access_denied',
  MEETING_ALREADY_STARTED = 'meeting_already_started',
  MEETING_ALREADY_ENDED = 'meeting_already_ended',
  
  // Voice authentication specific errors
  VOICE_ENROLLMENT_REQUIRED = 'voice_enrollment_required',
  VOICE_SAMPLE_TOO_SHORT = 'voice_sample_too_short',
  VOICE_SAMPLE_TOO_NOISY = 'voice_sample_too_noisy',
  VOICE_VERIFICATION_FAILED = 'voice_verification_failed',
  MAX_VERIFICATION_ATTEMPTS_EXCEEDED = 'max_verification_attempts_exceeded'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
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

// API Error class
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
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.context = context;
    this.name = 'ApiError';
    this.severity = this.determineSeverity();
  }

  private determineSeverity(): ErrorSeverity {
    switch (this.code) {
      case ApiErrorCode.INTERNAL_SERVER_ERROR:
      case ApiErrorCode.DATABASE_ERROR:
      case ApiErrorCode.EXTERNAL_SERVICE_ERROR:
        return ErrorSeverity.CRITICAL;
      
      case ApiErrorCode.UNAUTHORIZED:
      case ApiErrorCode.ACCESS_DENIED:
      case ApiErrorCode.INVALID_TOKEN:
      case ApiErrorCode.SESSION_EXPIRED:
      case ApiErrorCode.VOICE_AUTHENTICATION_FAILED:
        return ErrorSeverity.HIGH;
      
      case ApiErrorCode.VALIDATION_ERROR:
      case ApiErrorCode.RATE_LIMIT_EXCEEDED:
      case ApiErrorCode.VOICE_PROCESSING_ERROR:
        return ErrorSeverity.MEDIUM;
      
      default:
        return ErrorSeverity.LOW;
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      context: this.context,
      severity: this.severity,
      timestamp: new Date().toISOString()
    };
  }

  addContext(context: Partial<ErrorContext>): this {
    this.context = {
      ...this.context,
      ...context,
      timestamp: new Date()
    };
    return this;
  }
}

// Type guard for ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Helper functions for common errors
export function createUnauthorizedError(message: string = 'You do not have permission for this operation'): ApiError {
  return new ApiError(
    ApiErrorCode.UNAUTHORIZED,
    message,
    401
  );
}

export function createForbiddenError(message: string = 'You do not have access to this resource'): ApiError {
  return new ApiError(
    ApiErrorCode.ACCESS_DENIED,
    message,
    403
  );
}

export function createNotFoundError(
  resource: string = 'Resource', 
  message?: string
): ApiError {
  return new ApiError(
    ApiErrorCode.NOT_FOUND,
    message || `${resource} not found`,
    404,
    { resource }
  );
}

export function createRateLimitError(
  retryAfterSeconds: number,
  message?: string
): ApiError {
  return new ApiError(
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    message || `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
    429,
    { retryAfter: retryAfterSeconds }
  );
}

export function createVoiceAuthError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(
    code,
    message,
    400,
    details
  );
}

export function createOrganizationError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(
    code,
    message,
    403,
    details
  );
}

export function createMeetingError(
  code: ApiErrorCode,
  message: string,
  details?: any
): ApiError {
  return new ApiError(
    code,
    message,
    400,
    details
  );
}

export function logError(
  error: Error,
  context?: ErrorContext
): void {
  const errorData = isApiError(error)
    ? error.toJSON()
    : {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      };

  // In a real application, you would send this to your logging service
  console.error('Error logged:', errorData);
} 