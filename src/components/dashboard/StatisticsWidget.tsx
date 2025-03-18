'use client';

import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer } from '../layout/ResponsiveContainer';

interface StatisticsData {
  totalMeetings: number;
  successfulVerifications: number;
  failedVerifications: number;
  activeUsers: number;
  growthRate: number;
}

async function fetchStatistics(): Promise<StatisticsData> {
  const response = await fetch('/api/dashboard/statistics');
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return response.json();
}

export function StatisticsWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: fetchStatistics,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  if (isLoading) {
    return (
      <ResponsiveContainer className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </ResponsiveContainer>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-500">İstatistikler yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Platform İstatistikleri</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Toplam Toplantı</p>
          <p className="text-3xl font-bold text-primary-600">{data.totalMeetings}</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Başarılı Doğrulama</p>
          <p className="text-3xl font-bold text-green-600">{data.successfulVerifications}</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Başarısız Doğrulama</p>
          <p className="text-3xl font-bold text-red-600">{data.failedVerifications}</p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aktif Kullanıcı</p>
          <div className="flex items-center justify-center">
            <p className="text-3xl font-bold text-blue-600">{data.activeUsers}</p>
            <span className={`ml-2 flex items-center ${data.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.growthRate >= 0 ? '↑' : '↓'}
              <span className="text-sm">{Math.abs(data.growthRate)}%</span>
            </span>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
} 