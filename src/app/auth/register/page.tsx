'use client';

import apiService from '@/services/api';
import { RegisterRequest } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    organization: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Şifre kontrolü
    if (formData.password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    // Şifre uzunluğu kontrolü
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      // API isteği gönder
      await apiService.register(formData);
      
      // Başarılı ise ses kaydı sayfasına yönlendir (sesli kayıt aşaması için)
      router.push('/auth/voice-enrollment');
    } catch (err: any) {
      // Hata mesajını göster
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              SS
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni hesap oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            veya{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Ad Soyad</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">E-posta Adresi</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="E-posta Adresi"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="organization" className="sr-only">Organizasyon (İsteğe bağlı)</label>
              <input
                id="organization"
                name="organization"
                type="text"
                autoComplete="organization"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Organizasyon (İsteğe bağlı)"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Şifre (en az 8 karakter)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Şifre Tekrar</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              Kayıt olarak, <Link href="/terms" className="text-primary-600 hover:text-primary-500">Kullanım Şartları</Link> ve{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 