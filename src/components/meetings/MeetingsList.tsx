'use client';

import { Meeting } from '@/types/api';
import Link from 'next/link';

interface MeetingsListProps {
  meetings: Meeting[];
}

export default function MeetingsList({ meetings }: MeetingsListProps) {
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

  // Toplantı süresini hesapla
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} saat ${minutes > 0 ? `${minutes} dakika` : ''}`;
    }
    return `${minutes} dakika`;
  };

  return (
    <ul className="divide-y divide-gray-200">
      {meetings.map((meeting) => (
        <li key={meeting.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
          <Link href={`/dashboard/meetings/${meeting.id}`} className="block">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary-600 truncate">{meeting.title}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  meeting.securityLevel === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : meeting.securityLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {meeting.securityLevel === 'high' 
                    ? 'Yüksek Güvenlik' 
                    : meeting.securityLevel === 'medium'
                      ? 'Orta Güvenlik'
                      : 'Standart Güvenlik'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatDate(meeting.startTime)}
                </p>
              </div>
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {meeting.participants?.length || 0} Katılımcı
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Duration: {meeting.startTime && meeting.endTime ? 
                  calculateDuration(meeting.startTime, meeting.endTime) : 'N/A'}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
} 