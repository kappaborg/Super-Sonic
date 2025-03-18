'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const userString = localStorage.getItem('user');
    
    if (!userString) {
      // Kullanıcı girişi yapılmamışsa login sayfasına yönlendir
      router.push('/auth/login');
      return;
    }
    
    try {
      const user = JSON.parse(userString);
      setUserName(user.name || 'Kullanıcı');
    } catch (error) {
      console.error('Kullanıcı bilgisi çözümlenemedi:', error);
      router.push('/auth/login');
    }
    
    // Token geçerliliğini kontrol et
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expiryDate = new Date(tokenData.exp * 1000);
        
        if (expiryDate <= new Date()) {
          // Token süresi dolmuş
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    // Kullanıcı çıkışı
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const toggleUserMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst menü */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md flex items-center justify-center text-white font-bold">
                    SS
                  </div>
                  <span className="ml-2 text-lg font-semibold text-gray-900">SecureSonic</span>
                </Link>
              </div>
              
              {/* Desktop ana menü */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link 
                  href="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeMenu === 'dashboard' 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMenu('dashboard')}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/meetings" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeMenu === 'meetings' 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMenu('meetings')}
                >
                  Toplantılar
                </Link>
                <Link 
                  href="/dashboard/settings" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeMenu === 'settings' 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMenu('settings')}
                >
                  Ayarlar
                </Link>
              </div>
            </div>
            
            {/* Kullanıcı menüsü */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    id="user-menu-button"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    onClick={toggleUserMenu}
                  >
                    <span className="sr-only">Kullanıcı menüsü aç</span>
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-700">{userName}</span>
                    <svg
                      className={`ml-2 h-5 w-5 text-gray-400 ${isMenuOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                
                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profilim
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ayarlar
                    </Link>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobil menü butonu */}
            <div className="-mr-2 flex items-center md:hidden">
              <button
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={isMobileMenuOpen}
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Menüyü aç</span>
                {!isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil menü */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeMenu === 'dashboard'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => {
                  setActiveMenu('dashboard');
                  setIsMobileMenuOpen(false);
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/meetings"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeMenu === 'meetings'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => {
                  setActiveMenu('meetings');
                  setIsMobileMenuOpen(false);
                }}
              >
                Toplantılar
              </Link>
              <Link
                href="/dashboard/settings"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeMenu === 'settings'
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
                onClick={() => {
                  setActiveMenu('settings');
                  setIsMobileMenuOpen(false);
                }}
              >
                Ayarlar
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userName}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profilim
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ayarlar
                </Link>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Ana içerik */}
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 