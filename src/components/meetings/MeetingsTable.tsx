'use client';

import { Meeting } from '@/types/api';
import Link from 'next/link';
import { memo } from 'react';

interface MeetingsTableProps {
  meetings: Meeting[];
}

// Performans iyileştirmesi için memo kullanma
const MeetingsTable = memo(function MeetingsTable({ meetings }: MeetingsTableProps) {
  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Determine meeting status
  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = meeting.endTime ? new Date(meeting.endTime) : null;

    if (now < startTime) {
      return {
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800'
      };
    } else if (endTime && now > endTime) {
      return {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800'
      };
    } else {
      return {
        label: 'In Progress',
        color: 'bg-green-100 text-green-800'
      };
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Toplantı Adı
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Başlangıç
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Güvenlik
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Katılımcı
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {meetings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                Görüntülenecek toplantı bulunamadı.
              </td>
            </tr>
          ) : (
            meetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              return (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-600">
                      {meeting.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meeting.description?.substring(0, 50)}{meeting.description && meeting.description.length > 50 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(meeting.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      meeting.securityLevel === 'high'
                        ? 'bg-red-100 text-red-800'
                        : meeting.securityLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {meeting.securityLevel === 'high'
                        ? 'Yüksek'
                        : meeting.securityLevel === 'medium'
                          ? 'Orta'
                          : 'Standart'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.participants?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/meetings/${meeting.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Detaylar
                    </Link>
                    <Link
                      href={`/dashboard/meetings/join/${meeting.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Katıl
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

export default MeetingsTable;