'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { User, Mail, Phone, MapPin, Briefcase, Edit } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen animated-gradient flex">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Profile</h1>
            <Button variant="primary" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          <GlassCard className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-600">{user?.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-slate-800">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
