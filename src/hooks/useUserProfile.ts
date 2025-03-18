import apiService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getCurrentUser(),
    enabled: !!userId, // Only enable the query if userId exists
  });
} 