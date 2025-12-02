'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/use-api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  // Fetch profile data to get profilePictureUrl and other profile fields
  const { data: profileData } = useProfile();
  
  // Merge user data with profile data for sidebar - profile data takes priority
  const userWithProfile = React.useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      // Profile data takes priority for display
      fullName: profileData?.fullName || user.fullName,
      firstName: profileData?.firstName || user.firstName,
      lastName: profileData?.lastName || user.lastName,
      profilePictureUrl: profileData?.profilePictureUrl || user.profilePictureUrl,
    };
  }, [user, profileData]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar user={userWithProfile} onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
