'use client';

import React from 'react';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  isAuthenticated: boolean;
  avatarUrl?: string;
}

interface MeetingParticipantsProps {
  meetingId: string;
  participants?: Participant[];
  currentUserId?: string;
}

const MeetingParticipants: React.FC<MeetingParticipantsProps> = ({
  meetingId,
  participants = [],
  currentUserId = '',
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium">Participants</h3>
        <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
          {participants.length}
        </span>
      </div>
      
      <div className="overflow-y-auto p-2" style={{ maxHeight: '300px' }}>
        {participants.length > 0 ? (
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li 
                key={participant.id}
                className={`flex items-center p-2 rounded-md ${
                  participant.id === currentUserId ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt={participant.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {participant.isAuthenticated && (
                    <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {participant.name}
                      {participant.id === currentUserId && ' (Sen)'}
                    </span>
                    {participant.isHost && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Ev Sahibi
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex ml-auto space-x-1">
                  {participant.isMuted && (
                    <span className="text-red-500" title="Sessize Alınmış">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    </span>
                  )}
                  
                  {!participant.isVideoOn && (
                    <span className="text-red-500" title="Kamera Kapalı">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  )}
                  
                  {participant.isScreenSharing && (
                    <span className="text-green-500" title="Ekran Paylaşımı Aktif">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p>Henüz katılımcı yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingParticipants; 