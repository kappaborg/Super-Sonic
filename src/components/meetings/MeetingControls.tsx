'use client';

import { Button } from '@/components/ui/Button';
import React, { useState } from 'react';

interface MeetingControlsProps {
  meetingId: string;
  isActive: boolean;
  isOrganizer: boolean;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isRecording?: boolean;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onToggleRecording?: () => void;
  onLeave?: () => void;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  meetingId,
  isActive,
  isOrganizer,
  isMuted = false,
  isVideoOn = true,
  isScreenSharing = false,
  isRecording = false,
  onToggleMute = () => {},
  onToggleVideo = () => {},
  onToggleScreenShare = () => {},
  onToggleRecording = () => {},
  onLeave = () => {},
}) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-center sm:justify-between gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-full ${
            isMuted
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-2 rounded-full ${
            !isVideoOn
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          title={isVideoOn ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
        >
          {!isVideoOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {showMore && (
          <>
            <button
              onClick={onToggleScreenShare}
              className={`p-2 rounded-full ${
                isScreenSharing
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={isScreenSharing ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={onToggleRecording}
              className={`p-2 rounded-full ${
                isRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={isRecording ? 'Kaydı Durdur' : 'Kaydet'}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 5.5v13h-15v-13h15zm0-2h-15a2 2 0 00-2 2v13a2 2 0 002 2h15a2 2 0 002-2v-13a2 2 0 00-2-2z" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              )}
            </button>
          </>
        )}

        <button
          onClick={() => setShowMore(!showMore)}
          className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          title={showMore ? 'Daha Az' : 'Daha Fazla'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      <div className="ml-auto">
        <Button 
          variant="destructive" 
          onClick={onLeave}
          className="px-4 py-2"
        >
          Toplantıdan Ayrıl
        </Button>
      </div>
    </div>
  );
};

export default MeetingControls; 