import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = useCallback(async (provider?: string, options?: any) => {
    try {
      await signIn(provider, options);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const redirectToLogin = useCallback(() => {
    router.push('/auth/signin');
  }, [router]);

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user,
    login,
    logout,
    redirectToLogin,
  };
} 