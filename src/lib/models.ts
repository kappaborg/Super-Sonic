import { z } from 'zod';

// Kullanıcı modeli
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'user']),
  organization: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  voice_enrolled: z.boolean().default(false),
});

export type User = z.infer<typeof userSchema>;

// Toplantı modeli
export const meetingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  organizer_id: z.string().uuid(),
  security_level: z.enum(['low', 'medium', 'high']),
  access_code: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Meeting = z.infer<typeof meetingSchema>;

// Toplantı katılımcısı modeli
export const meetingParticipantSchema = z.object({
  id: z.string().uuid(),
  meeting_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(['invited', 'confirmed', 'declined']),
  role: z.enum(['organizer', 'presenter', 'participant']),
  joined_at: z.string().datetime().optional(),
  left_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type MeetingParticipant = z.infer<typeof meetingParticipantSchema>;

// Voiceprint modeli (ses parmak izi)
export const voiceprintSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  voice_features: z.array(z.number()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Voiceprint = z.infer<typeof voiceprintSchema>;

// Oturum modeli
export const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type Session = z.infer<typeof sessionSchema>;

// Giriş istekleri için şema
export const loginRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur.' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz.' }),
  password: z
    .string()
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
    .max(100, { message: 'Şifre çok uzun.' }),
});

// Kayıt istekleri için şema
export const registerRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur.' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz.' }),
  password: z
    .string()
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
    .max(100, { message: 'Şifre çok uzun.' })
    .regex(/[A-Z]/, { message: 'Şifre en az bir büyük harf içermelidir.' })
    .regex(/[a-z]/, { message: 'Şifre en az bir küçük harf içermelidir.' })
    .regex(/[0-9]/, { message: 'Şifre en az bir rakam içermelidir.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Şifre en az bir özel karakter içermelidir.' }),
  confirmPassword: z.string(),
  name: z.string().min(2, { message: 'İsim en az 2 karakter olmalıdır.' }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Hizmet şartlarını ve gizlilik politikasını kabul etmelisiniz.',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor.',
  path: ['confirmPassword'],
});

// Şifre sıfırlama istekleri için şema
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur.' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz.' }),
});

// Şifre değiştirme istekleri için şema
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Mevcut şifre zorunludur.' }),
  newPassword: z
    .string()
    .min(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
    .max(100, { message: 'Şifre çok uzun.' })
    .regex(/[A-Z]/, { message: 'Şifre en az bir büyük harf içermelidir.' })
    .regex(/[a-z]/, { message: 'Şifre en az bir küçük harf içermelidir.' })
    .regex(/[0-9]/, { message: 'Şifre en az bir rakam içermelidir.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Şifre en az bir özel karakter içermelidir.' }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Şifreler eşleşmiyor.',
  path: ['confirmNewPassword'],
});

// Profil güncelleme istekleri için şema
export const updateProfileRequestSchema = z.object({
  name: z.string().min(2, { message: 'İsim en az 2 karakter olmalıdır.' }).optional(),
  bio: z.string().max(500, { message: 'Biyografi en fazla 500 karakter olabilir.' }).optional(),
  avatar: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// Ses kimlik doğrulama istekleri için şema
export const voiceAuthRequestSchema = z.object({
  voiceFeatures: z.array(z.number()),
  userId: z.string().optional(),
});

// Supabase veritabanı tipleri
export type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type VoicePrint = {
  id: string;
  user_id: string;
  voice_features: number[];
  created_at: string;
  updated_at: string;
};

export type RateLimit = {
  id: string;
  identifier: string;
  timestamp: string;
  expire_at: string;
  path?: string;
  created_at: string;
};

export type DashboardStats = {
  total_meetings: number;
  upcoming_meetings: number;
  completed_meetings: number;
  total_voice_auth_attempts: number;
  success_rate: number;
};

export const createMeetingRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  participants: z.array(
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(['presenter', 'participant']),
    })
  ),
  security_level: z.enum(['low', 'medium', 'high']),
});

export type CreateMeetingRequest = z.infer<typeof createMeetingRequestSchema>; 