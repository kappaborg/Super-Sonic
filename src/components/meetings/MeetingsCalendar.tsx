'use client';

import { Meeting } from '@/types/api';
import Link from 'next/link';
import { memo, useState } from 'react';

interface MeetingsCalendarProps {
  meetings: Meeting[];
}

// Performans iyileştirmesi için memo kullanma
const MeetingsCalendar = memo(function MeetingsCalendar({ meetings }: MeetingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Ay adlarını getir
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  // Gün adlarını getir
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  // Önceki aya git
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Sonraki aya git
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Ayın ilk gününü ve son gününü hesapla
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // Ayın ilk gününün haftanın hangi günü olduğunu hesapla (Pazartesi: 0, Pazar: 6)
  let firstDayOfWeek = firstDayOfMonth.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Pazartesi: 0 olacak şekilde ayarla
  
  // Takvim günlerini oluştur
  const days = [];
  
  // Önceki aydan gelen günler
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - (firstDayOfWeek - i));
    days.push({ date: day, isCurrentMonth: false });
  }
  
  // Mevcut ayın günleri
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    days.push({ date: day, isCurrentMonth: true });
  }
  
  // Sonraki aydan gelen günler (7 günlük satırları tamamlamak için)
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(lastDayOfMonth);
      day.setDate(day.getDate() + i);
      days.push({ date: day, isCurrentMonth: false });
    }
  }
  
  // Belirli bir gün için toplantıları filtrele
  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingStart = new Date(meeting.startTime);
      return meetingStart.getDate() === date.getDate() && 
             meetingStart.getMonth() === date.getMonth() && 
             meetingStart.getFullYear() === date.getFullYear();
    });
  };
  
  // Saat formatını düzenle
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
      <div className="px-4 py-5 border-b border-gray-200 bg-gray-50 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map((day, index) => (
            <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 h-96 overflow-y-auto">
          {days.map((day, index) => {
            const dailyMeetings = getMeetingsForDay(day.date);
            const isToday = new Date().toDateString() === day.date.toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] border-b border-r border-gray-200 p-1 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full w-6 h-6 text-center leading-6 text-sm ${
                      isToday
                        ? 'bg-primary-600 text-white'
                        : day.isCurrentMonth
                          ? 'text-gray-700'
                          : 'text-gray-400'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>
                
                <div className="mt-1 max-h-[80px] overflow-y-auto">
                  {dailyMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/dashboard/meetings/${meeting.id}`}
                      className={`block p-1 mb-1 text-xs rounded truncate ${
                        meeting.securityLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : meeting.securityLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {formatTime(meeting.startTime)} - {meeting.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default MeetingsCalendar;