'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/use-toast';
import { generateCSRFToken } from '@/lib/security';
import supabaseClient from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Lock, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const SecurityPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sessionDevices, setSessionDevices] = useState<any[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string | null>(null);
  
  // Password change form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  // Generate CSRF token
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    // Save to browser memory (should be a cookie in production, using localStorage for example)
    localStorage.setItem('csrf_token', token);
  }, []);

  // Get user information
  useEffect(() => {
    const getUserSecuritySettings = async () => {
      try {
        // Get session information
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;

        // Check 2FA status
        const { data: userData, error } = await supabaseClient
          .from('user_security')
          .select('two_factor_enabled, recovery_codes')
          .eq('user_id', session.user.id)
          .single();

        if (userData) {
          setTwoFactorEnabled(userData.two_factor_enabled);
        }

        // Get active sessions
        const { data: sessionsData } = await supabaseClient
          .from('user_sessions')
          .select('*')
          .eq('user_id', session.user.id);

        if (sessionsData) {
          setSessionDevices(sessionsData);
          
          // Identify current device
          const currentUserId = session.user.id;
          setCurrentDevice(currentUserId);
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
      }
    };

    getUserSecuritySettings();
  }, [supabaseClient]);

  // Password change process
  const onChangePassword = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          newPasswordConfirm: data.confirmPassword
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Your password has been updated successfully",
          variant: "success"
        });
        reset();
      } else {
        toast({
          title: "Error",
          description: result.message || "Password change failed",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Enable/disable 2FA
  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      await disable2FA();
    } else {
      // Enable 2FA
      await setup2FA();
    }
  };

  // 2FA setup
  const setup2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });

      const result = await response.json();
      
      if (response.ok && result.qrCode) {
        setQrCode(result.qrCode);
      } else {
        toast({
          title: "Error",
          description: result.message || "2FA setup failed",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification
  const verify2FA = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          code: verificationCode
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setTwoFactorEnabled(true);
        setQrCode(null);
        setVerificationCode('');
        toast({
          title: "Success",
          description: "Two-factor authentication has been successfully enabled",
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Code verification failed",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setTwoFactorEnabled(false);
        toast({
          title: "Success",
          description: "Two-factor authentication has been disabled",
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to disable 2FA",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Terminate session
  const terminateSession = async (sessionId: string) => {
    if (sessionId === currentDevice) {
      toast({
        title: "Warning",
        description: "Cannot terminate the current session",
        variant: "warning"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update sessions
        setSessionDevices(prev => prev.filter(s => s.session_id !== sessionId));
        toast({
          title: "Success",
          description: "Session terminated successfully",
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not terminate session",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Terminate all sessions except current
  const terminateAllSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update sessions list, keeping only current
        setSessionDevices(prev => prev.filter(s => s.session_id === currentDevice));
        toast({
          title: "Success",
          description: "All other sessions have been terminated",
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not terminate sessions",
          variant: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "A problem occurred. Please try again later.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>
      
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="2fa">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Two-Factor Auth
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <User className="mr-2 h-4 w-4" />
            Active Sessions
          </TabsTrigger>
        </TabsList>
        
        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password. We recommend using a strong, unique password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onChangePassword)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Password Security Tips</AlertTitle>
                  <AlertDescription>
                    Use at least 8 characters. Include numbers, uppercase and lowercase letters, and special characters.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* 2FA Tab */}
        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled 
                      ? "Your account is protected with two-factor authentication." 
                      : "We recommend enabling 2FA for additional security."}
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={loading || !!qrCode}
                />
              </div>
              
              {qrCode && (
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Scan QR Code</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src={qrCode} alt="QR Code for 2FA" className="h-48 w-48" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                      <Button 
                        onClick={verify2FA} 
                        disabled={loading || !verificationCode}
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {twoFactorEnabled && (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Security Enhanced</AlertTitle>
                  <AlertDescription>
                    Your account is protected with two-factor authentication. You will need your authenticator app when signing in.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Review and manage your active sessions across different devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionDevices.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {sessionDevices.map((session) => (
                      <div key={session.session_id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">
                            {session.device_name || 'Unknown Device'}
                            {session.session_id === currentDevice && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.ip_address} • Last active: {new Date(session.last_active).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateSession(session.session_id)}
                          disabled={loading || session.session_id === currentDevice}
                        >
                          Terminate
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {sessionDevices.length > 1 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={terminateAllSessions}
                      disabled={loading}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Terminate All Other Sessions
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No active sessions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage; 