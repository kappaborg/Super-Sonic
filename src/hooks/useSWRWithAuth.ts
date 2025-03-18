import useSWR from 'swr';

export function useSWRWithAuth(endpoint: string | null, options = {}) {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Use SWR hook with token
  const fetcher = async (url: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const error = new Error('API request failed');
      throw error;
    }
    
    return response.json();
  };
  
  return useSWR(token && endpoint ? endpoint : null, fetcher, {
    dedupingInterval: 10000, // Deduplicates identical requests within 10 seconds
    revalidateOnFocus: true, // Revalidate when page focus changes
    ...options,
  });
} 