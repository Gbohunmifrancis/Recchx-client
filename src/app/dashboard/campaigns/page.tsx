'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Campaigns</h1>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <div className="bg-card rounded-xl p-12 text-center border border-border">
          <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No campaigns yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your first campaign to start tracking applications
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}
