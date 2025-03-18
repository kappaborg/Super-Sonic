'use client';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, redirectToLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [isLoading, isAuthenticated, redirectToLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Welcome back, {user.name}!
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your personal dashboard
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.email}
                    </dd>
                  </div>
                  {/* Add more user information here */}
                </dl>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={() => {
                  // Handle action
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create New Meeting
              </Button>
              <Button
                onClick={() => {
                  // Handle action
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Join Meeting
              </Button>
              <Button
                onClick={() => {
                  // Handle action
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voice Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 