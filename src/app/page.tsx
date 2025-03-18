'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Kullanıcının giriş yapmış olup olmadığını kontrol et
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      // Token'ın geçerli olup olmadığını kontrol et
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expiryDate = new Date(tokenData.exp * 1000);
        
        if (expiryDate > new Date()) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    // Kullanıcı giriş yapmışsa dashboard'a yönlendir
    if (!isLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoading, isLoggedIn, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md flex items-center justify-center text-white font-bold">
              SS
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">SecureSonic</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Giriş Yap
            </Link>
            <Link href="/auth/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Kaydol
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100"></div>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 mix-blend-multiply"></div>
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">Güvenli Toplantılar için</span>
                  <span className="block text-secondary-200">Sesli Kimlik Doğrulama</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
                  SecureSonic, toplantılarınızı sesli kimlik doğrulama teknolojisi ile güvence altına alır. 
                  Benzersiz ses imzanız ile toplantılara katılın, güvenliği en üst seviyeye taşıyın.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <Link href="/auth/register" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 sm:px-8">
                      Hemen Başla
                    </Link>
                    <a href="#features" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 sm:px-8">
                      Daha Fazla Bilgi
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 bg-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Özellikler</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Neden SecureSonic?
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Toplantılarınız için en güvenli ve etkili çözüm
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Sesli Kimlik Doğrulama</h3>
                      </div>
                    </div>
                    <div className="mt-4 text-base text-gray-500">
                      Benzersiz ses imzanız ile toplantılara güvenli erişim sağlayın. 
                      Parola unutma ve çalınma riskleri olmadan, sadece sesiniz ile kimliğinizi doğrulayın.
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Güvenli İletişim</h3>
                      </div>
                    </div>
                    <div className="mt-4 text-base text-gray-500">
                      Uçtan uca şifrelenmiş iletişim kanalları ile toplantılarınız tamamen güvende.
                      Hassas konuşmalarınız yetkisiz erişimlere karşı korunur.
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Hızlı ve Verimli</h3>
                      </div>
                    </div>
                    <div className="mt-4 text-base text-gray-500">
                      Optimum ses kalitesi ve düşük gecikme süresi ile kesintisiz toplantı deneyimi.
                      Hızlı bağlantı ve kolay kullanım arayüzü ile zaman kaybını önleyin.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Güvenli toplantılar için hazır mısınız?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Hemen kaydolun ve SecureSonic ile toplantılarınızı güvenli hale getirin.
            </p>
            <Link href="/auth/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto">
              Ücretsiz Deneyin
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Hakkında</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Şirket</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Kariyer</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Blog</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Destek</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Yardım Merkezi</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">İletişim</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Topluluk</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Yasal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Gizlilik Politikası</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Kullanım Şartları</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">KVKK</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">İletişim</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="mailto:info@securesonic.com" className="text-base text-gray-300 hover:text-white">info@securesonic.com</a>
                </li>
                <li>
                  <a href="tel:+902121234567" className="text-base text-gray-300 hover:text-white">+90 212 123 45 67</a>
                </li>
                <li>
                  <p className="text-base text-gray-300">İstanbul, Türkiye</p>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 SecureSonic, Inc. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 