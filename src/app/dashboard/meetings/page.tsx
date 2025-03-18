'use client';

import { useSWRWithAuth } from '@/hooks/useSWRWithAuth';
import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';

// Lazy loading ile bileşenleri yükleme
const MeetingsCalendar = dynamic(() => import('@/components/meetings/MeetingsCalendar'), {
  loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>,
  ssr: false, // Client-side rendering için
});

const MeetingFilters = dynamic(() => import('@/components/meetings/MeetingFilters'), {
  loading: () => <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>,
});

const MeetingsTable = dynamic(() => import('@/components/meetings/MeetingsTable'), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      <div className="h-64 bg-gray-200 rounded-lg w-full"></div>
    </div>
  ),
});

export default function MeetingsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  
  // API istekleri
  const { data: meetings, error, isLoading } = useSWRWithAuth('/api/meetings');
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">Toplantılar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Toplantılarım</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              view === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Takvim
          </button>
        </div>
      </div>
      
      {/* Filtreler - Öncelikli yüklenir */}
      <Suspense fallback={<div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>}>
        <MeetingFilters />
      </Suspense>
      
      {view === 'calendar' ? (
        // Takvim görünümü - Lazy loaded
        <Suspense fallback={<div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MeetingsCalendar meetings={meetings || []} />
        </Suspense>
      ) : (
        // Liste görünümü - Lazy loaded
        <Suspense fallback={<div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MeetingsTable meetings={meetings || []} />
        </Suspense>
      )}
    </div>
  );
} 