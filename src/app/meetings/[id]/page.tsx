'use client';

import { useSWRWithAuth } from '@/hooks/useSWRWithAuth';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// UI Components
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazily loaded components
const MeetingHeader = dynamic(() => import('@/components/meetings/MeetingHeader'), {
  loading: () => <Skeleton height="60px" width="100%" />,
  ssr: false
});

const MeetingChat = dynamic(() => import('@/components/meetings/MeetingChat'), {
  loading: () => <Skeleton height="400px" width="100%" />,
  ssr: true // SSR active to prevent content shift
});

const MeetingControls = dynamic(() => import('@/components/meetings/MeetingControls'), {
  loading: () => <Skeleton height="50px" width="100%" />,
  ssr: false
});

const MeetingParticipants = dynamic(() => import('@/components/meetings/MeetingParticipants'), {
  loading: () => <Skeleton height="200px" width="100%" />,
  ssr: false
});

const VoiceAuthModal = dynamic(() => import('@/components/auth/VoiceAuthModal'), {
  loading: () => <Skeleton height="300px" width="400px" />,
  ssr: false
});

// Error component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-md">
      <h3 className="text-lg font-semibold mb-2">An error occurred</h3>
      <p className="mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  );
};

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params?.id as string;
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Fetch meeting data
  const { data: meeting, error, isLoading, mutate } = useSWRWithAuth(
    meetingId ? `/api/meetings/${meetingId}` : null,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // 30 second cache
      suspense: false, // Manually controlling Suspense usage
      onError: (err: { status?: number; message?: string }) => {
        console.error('Failed to fetch meeting data:', err);
        // Redirect to main page in case of 404 error
        if (err.status === 404) {
          router.push('/dashboard');
        }
      }
    }
  );

  // Performance optimization: 
  // Caching meeting data in localStorage
  useEffect(() => {
    if (meeting) {
      try {
        // Keep meeting info available even after leaving the page
        localStorage.setItem(`meeting_${meetingId}`, JSON.stringify({
          data: meeting,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Meeting caching error:', e);
      }
    }
  }, [meeting, meetingId]);

  // Check localStorage for data when page first loads
  useEffect(() => {
    if (!meeting && !isLoading && meetingId) {
      try {
        const cachedData = localStorage.getItem(`meeting_${meetingId}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          // Use if not older than 5 minutes
          const isFresh = Date.now() - parsed.timestamp < 5 * 60 * 1000;
          if (isFresh) {
            mutate(parsed.data, false); // Still fetch fresh data in background
          }
        }
      } catch (e) {
        console.warn('Cache reading error:', e);
      }
    }
  }, [meetingId, meeting, isLoading, mutate]);

  // Check if voice authentication is required before joining
  useEffect(() => {
    if (meeting && meeting.requireVoiceAuth && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [meeting, isAuthenticated]);

  // When voice authentication is successful
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  if (isLoading && !meeting) {
    return (
      <div className="p-6">
        <Skeleton height="40px" width="60%" className="mb-4" />
        <Skeleton height="24px" width="40%" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Skeleton height="400px" width="100%" className="mb-4" />
            <Skeleton height="50px" width="100%" />
          </div>
          <div>
            <Skeleton height="200px" width="100%" className="mb-4" />
            <Skeleton height="200px" width="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Meeting Could Not Be Loaded</h2>
        <p className="text-red-600 mb-4">
          {error.message || 'An error occurred while retrieving meeting information.'}
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <main className="p-4">
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => mutate()}>
        <Suspense fallback={<Skeleton height="60px" width="100%" />}>
          <MeetingHeader 
            title={meeting?.title} 
            startTime={meeting?.startTime} 
            organizer={meeting?.organizer}
          />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Meeting Area */}
          <div className="md:col-span-2">
            {meeting?.coverImage && (
              <ResponsiveContainer aspectRatio={16/9} className="mb-4">
                <OptimizedImage
                  src={meeting.coverImage}
                  alt={meeting.title}
                  width={800}
                  height={450}
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  loading="eager"
                  priority
                />
              </ResponsiveContainer>
            )}
            
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
              <Suspense fallback={<Skeleton height="400px" width="100%" />}>
                <MeetingChat meetingId={meetingId} />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
              <Suspense fallback={<Skeleton height="50px" width="100%" />}>
                <MeetingControls 
                  meetingId={meetingId}
                  isActive={meeting?.status === 'active'}
                  isOrganizer={meeting?.organizer?.id === 'current-user-id'} // To be replaced with real user ID
                />
              </Suspense>
            </ErrorBoundary>
          </div>
          
          {/* Participants Sidepanel */}
          <div>
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
              <Suspense fallback={<Skeleton height="200px" width="100%" />}>
                <MeetingParticipants 
                  meetingId={meetingId}
                  participants={meeting?.participants || []}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>
      
      {/* Voice Authentication Modal */}
      {showAuthModal && (
        <VoiceAuthModal
          isOpen={showAuthModal}
          onClose={() => router.push('/dashboard')}
          onSuccess={handleAuthSuccess}
          userId="current-user-id" // To be replaced with real user ID
        />
      )}
    </main>
  );
} 