'use client';

import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string | Date;
}

interface MeetingChatProps {
  meetingId: string;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
}

const MeetingChat: React.FC<MeetingChatProps> = ({
  meetingId,
  messages = [],
  onSendMessage = () => {},
  currentUserId = '',
}) => {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium">Sohbet</h3>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '400px' }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.senderId === currentUserId
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {msg.senderId !== currentUserId && (
                  <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                    {msg.senderName}
                  </p>
                )}
                <p className="break-words">{msg.content}</p>
                <p className="text-xs mt-1 text-right opacity-70">
                  {formatDate(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Henüz mesaj yok. Konuşmayı başlatın!</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" disabled={!message.trim()}>
            Gönder
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MeetingChat; 