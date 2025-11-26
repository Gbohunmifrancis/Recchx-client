'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Plus, Target } from 'lucide-react';

export default function CampaignsPage() {
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Campaigns</h1>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <GlassCard className="p-12 text-center">
            <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No campaigns yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first campaign to start tracking applications
            </p>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
