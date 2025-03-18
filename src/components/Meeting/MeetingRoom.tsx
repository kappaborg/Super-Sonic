import { RateLimitWarning } from '@/components/ui/RateLimitWarning';
import { Spinner } from '@/components/ui/Spinner';
import { useMeetingWebSocket } from '@/hooks/useWebSocket';
import { useCallback, useEffect, useState } from 'react';

interface Participant {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;
  voiceAuthStatus?: string;
}

interface MeetingRoomProps {
  meetingId: string;
  userId: string;
  userName: string;
  token: string;
  onLeave?: () => void;
}

export function MeetingRoom({
  meetingId,
  userId,
  userName,
  token,
  onLeave,
}: MeetingRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<{
    userId: string;
    name: string;
    message: string;
    timestamp: number;
  }[]>([]);
  const [status, setStatus] = useState<string>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [isVoiceAuthRequired, setIsVoiceAuthRequired] = useState(false);

  const {
    isConnected,
    error: wsError,
    sendMessage,
    submitVoiceAuth,
    leaveMeeting,
  } = useMeetingWebSocket({
    token,
    meetingId,
    userId,
    userName,
    onConnect: () => {
      setStatus('connected');
      setError(null);
    },
    onDisconnect: (reason) => {
      setStatus('disconnected');
      setError(`Disconnected: ${reason}`);
    },
    onError: (err) => {
      setError(err.message);
    },
    onParticipantJoined: (data) => {
      setParticipants((prev) => [
        ...prev,
        {
          userId: data.userId,
          name: data.name,
          role: 'participant',
        },
      ]);
    },
    onParticipantLeft: (data) => {
      setParticipants((prev) =>
        prev.filter((p) => p.userId !== data.userId)
      );
    },
    onMeetingStateUpdate: (data) => {
      setStatus(data.status);
      setParticipants(data.participants);
    },
    onVoiceAuthRequired: () => {
      setIsVoiceAuthRequired(true);
    },
    onVoiceAuthResult: (data) => {
      if (data.success) {
        setIsVoiceAuthRequired(false);
      } else {
        setError(data.message || 'Voice authentication failed');
      }
    },
    onChatMessage: (data) => {
      setMessages((prev) => [...prev, {
        userId: data.userId,
        name: data.name,
        message: data.message,
        timestamp: data.timestamp,
      }]);
    },
  });

  const handleLeave = useCallback(() => {
    leaveMeeting();
    onLeave?.();
  }, [leaveMeeting, onLeave]);

  const handleSendMessage = useCallback((message: string) => {
    if (message.trim()) {
      sendMessage(message);
    }
  }, [sendMessage]);

  const handleVoiceAuth = useCallback(async () => {
    try {
      // Get user's voice sample
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      const chunks: Float32Array[] = [];
      
      processor.onaudioprocess = (e) => {
        chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Record for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Stop recording
      stream.getTracks().forEach(track => track.stop());
      source.disconnect();
      processor.disconnect();

      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedArray = new Float32Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        combinedArray.set(chunk, offset);
        offset += chunk.length;
      }

      // Submit for voice authentication
      submitVoiceAuth(combinedArray);
    } catch (error) {
      setError('Failed to capture voice sample');
      console.error('Voice capture error:', error);
    }
  }, [submitVoiceAuth]);

  useEffect(() => {
    if (wsError) {
      setError(wsError.message);
    }
  }, [wsError]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <p className="ml-2">Connecting to meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <RateLimitWarning
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-primary p-4 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Meeting Room</h1>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          >
            Leave Meeting
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Participants list */}
        <aside className="w-64 bg-gray-100 p-4">
          <h2 className="font-bold mb-4">Participants</h2>
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li
                key={participant.userId}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300">
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt={participant.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {participant.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-gray-500">{participant.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat and controls */}
        <div className="flex-1 flex flex-col">
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.userId === userId
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.userId === userId
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-sm">{msg.name}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                if (input.value.trim()) {
                  handleSendMessage(input.value);
                  input.value = '';
                }
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                name="message"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Voice authentication modal */}
      {isVoiceAuthRequired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Voice Authentication Required</h2>
            <p className="mb-4">
              Please speak for 5 seconds to verify your identity.
            </p>
            <button
              onClick={handleVoiceAuth}
              className="w-full px-4 py-2 bg-primary text-white rounded"
            >
              Start Voice Authentication
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 