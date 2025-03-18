'use client';

import { useState } from 'react';

interface MeetingFiltersProps {
  onFilterChange?: (filters: {
    keyword: string;
    dateRange: string;
    securityLevel: string;
    status: string;
  }) => void;
}

export default function MeetingFilters({ onFilterChange }: MeetingFiltersProps) {
  const [filters, setFilters] = useState({
    keyword: '',
    dateRange: 'all',
    securityLevel: 'all',
    status: 'all',
  });

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Arama kutusu */}
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
            Arama
          </label>
          <input
            type="text"
            id="keyword"
            placeholder="Toplantı adını ara..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
        </div>

        {/* Tarih aralığı */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
            Tarih Aralığı
          </label>
          <select
            id="dateRange"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">Tüm zamanlar</option>
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
            <option value="past">Geçmiş toplantılar</option>
            <option value="upcoming">Gelecek toplantılar</option>
          </select>
        </div>

        {/* Güvenlik seviyesi */}
        <div>
          <label htmlFor="securityLevel" className="block text-sm font-medium text-gray-700">
            Güvenlik Seviyesi
          </label>
          <select
            id="securityLevel"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={filters.securityLevel}
            onChange={(e) => handleFilterChange('securityLevel', e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="low">Standart</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        {/* Durum */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Durum
          </label>
          <select
            id="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="scheduled">Planlanmış</option>
            <option value="ongoing">Devam Ediyor</option>
            <option value="completed">Tamamlanmış</option>
            <option value="canceled">İptal Edilmiş</option>
          </select>
        </div>
      </div>
    </div>
  );
} 