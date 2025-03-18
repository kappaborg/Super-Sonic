import {
  ApiError,
  AuthResponse,
  CreateMeetingRequest,
  JoinMeetingRequest,
  JoinMeetingResponse,
  LoginRequest,
  Meeting,
  RegisterRequest,
  User,
  VoiceAuthRequest,
  VoiceAuthResponse
} from '@/types/api';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    this.api = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // İstek araya girici (interceptor) - token eklemek için
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Yanıt araya girici (interceptor) - hata işlemek için
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError = new ApiError(
          error.response?.data?.code || 'UNKNOWN_ERROR',
          error.response?.data?.message || 'Bilinmeyen hata',
          error.response?.status || 500,
          error.response?.data?.details
        );
        return Promise.reject(apiError);
      }
    );

    // Tarayıcıda localStorage'den token'ı al
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        this.setToken(storedToken);
      }
    }
  }

  // Token ayarlama
  public setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Token temizleme
  public clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // API istekleri için yardımcı method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kimlik Doğrulama Servisleri
  public async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
    this.setToken(response.token);
    return response;
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
    this.setToken(response.token);
    return response;
  }

  public async logout(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      url: '/auth/logout',
    });
    this.clearToken();
  }

  public async getCurrentUser(): Promise<User> {
    return this.request<User>({
      method: 'GET',
      url: '/user/me',
    });
  }

  // Ses Doğrulama Servisleri
  public async authenticateVoice(data: VoiceAuthRequest): Promise<VoiceAuthResponse> {
    return this.request<VoiceAuthResponse>({
      method: 'POST',
      url: '/voice-auth/authenticate',
      data,
    });
  }

  public async enrollVoice(data: VoiceAuthRequest): Promise<VoiceAuthResponse> {
    return this.request<VoiceAuthResponse>({
      method: 'POST',
      url: '/voice-auth/enroll',
      data,
    });
  }

  // Toplantı Servisleri
  public async createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
    return this.request<Meeting>({
      method: 'POST',
      url: '/meetings',
      data,
    });
  }

  public async getMeeting(id: string): Promise<Meeting> {
    return this.request<Meeting>({
      method: 'GET',
      url: `/meetings/${id}`,
    });
  }

  public async joinMeeting(data: JoinMeetingRequest): Promise<JoinMeetingResponse> {
    return this.request<JoinMeetingResponse>({
      method: 'POST',
      url: `/meetings/${data.meetingId}/join`,
      data,
    });
  }

  public async getUserMeetings(): Promise<Meeting[]> {
    return this.request<Meeting[]>({
      method: 'GET',
      url: '/meetings/user',
    });
  }
}

// Tek bir örnek oluşturup dışa aktar
const apiService = new ApiService();
export default apiService; 