'use client';

import { formatDate } from '@/lib/utils';
import React from 'react';

interface MeetingHeaderProps {
  title: string;
  startTime?: Date | string;
  organizer?: {
    name: string;
    organization?: string;
  };
  isRecording?: boolean;
  isSecure?: boolean;
}

const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  title,
  startTime,
  organizer,
  isRecording = false,
  isSecure = true,
}) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold truncate max-w-[800px]">{title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
            {startTime && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(startTime)}</span>
              </div>
            )}
            {organizer && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  {organizer.name}
                  {organizer.organization && (
                    <span className="ml-1 text-gray-500">({organizer.organization})</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 md:mt-0">
          {isRecording && (
            <div className="flex items-center text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
              <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse mr-1"></span>
              <span>Kayıt Yapılıyor</span>
            </div>
          )}
          {isSecure && (
            <div className="flex items-center text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Güvenli</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingHeader; 