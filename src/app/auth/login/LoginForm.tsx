'use client';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RateLimitWarning } from '@/components/ui/RateLimitWarning';
import { loginRequestSchema } from '@/lib/models';
import supabaseClient from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form values type
type LoginFormValues = z.infer<typeof loginRequestSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(60);

  // Form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // When form is submitted
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Supabase
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Check for rate limit error
        if (error.status === 429) {
          setIsRateLimited(true);
          
          // Use Retry-After header or default value
          const retryAfter = error.message.match(/(\d+) seconds/)?.[1] || '60';
          setRetryAfterSeconds(parseInt(retryAfter, 10));
          
          setError('You have reached the request limit. Please try again later.');
        } else {
          setError(error.message || 'An error occurred while logging in.');
        }
      } else {
        // Successful login, redirect to main page
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry after rate limit warning
  const handleRetry = () => {
    setIsRateLimited(false);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {isRateLimited ? (
            <RateLimitWarning 
              retryAfter={retryAfterSeconds} 
              onRetry={handleRetry}
              message="Too many failed login attempts. Please wait a moment."
            />
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  autoComplete="email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="link"
                  size="sm"
                  className="px-0"
                  onClick={() => router.push('/auth/reset-password')}
                  type="button"
                >
                  Forgot Password
                </Button>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          {!isRateLimited && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          )}
          
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => router.push('/auth/register')}
              disabled={isLoading}
            >
              Sign Up
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 