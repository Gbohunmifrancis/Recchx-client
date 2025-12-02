'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Percent, ArrowUpRight, 
  ArrowDownRight, Loader2, Calendar, Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface CohortData {
  cohort: string;
  totalUsers: number;
  retainedUsers: number;
  retentionRate: number;
}

interface RetentionAnalyticsResponse {
  cohorts: CohortData[];
  overallRetention: number;
  averageRetentionDays: number;
}

export default function AdminRetentionPage() {
  const [period, setPeriod] = useState<number>(30); // Days to analyze

  const { data, isLoading, error } = useQuery<RetentionAnalyticsResponse>({
    queryKey: ['admin', 'analytics', 'retention'],
    queryFn: () => adminAPI.getRetentionAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const cohorts = data?.cohorts || [];
  const overallRetention = data?.overallRetention || 0;
  const avgRetentionDays = data?.averageRetentionDays || 0;

  // Calculate max retention for chart scaling
  const maxRetention = Math.max(...cohorts.map(c => c.retentionRate), 1);

  // Determine retention health
  const getRetentionHealth = (rate: number) => {
    if (rate >= 70) return { color: 'text-green-500', bg: 'bg-green-500', label: 'Excellent' };
    if (rate >= 50) return { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Good' };
    if (rate >= 30) return { color: 'text-orange-500', bg: 'bg-orange-500', label: 'Needs Attention' };
    return { color: 'text-red-500', bg: 'bg-red-500', label: 'Critical' };
  };

  const retentionHealth = getRetentionHealth(overallRetention);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load retention analytics</p>
          <p className="text-muted-foreground text-sm">{(error as any)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Retention Analytics</h1>
          <p className="text-muted-foreground">Analyze user retention rates and cohort performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-500" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${retentionHealth.bg}/10 ${retentionHealth.color}`}>
                {retentionHealth.label}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{overallRetention.toFixed(1)}%</h3>
            <p className="text-muted-foreground text-sm">Overall Retention Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{avgRetentionDays.toFixed(1)}</h3>
            <p className="text-muted-foreground text-sm">Avg Retention Days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground">{cohorts.length}</h3>
            <p className="text-muted-foreground text-sm">Cohorts Analyzed</p>
          </motion.div>
        </div>

        {/* Period Filter */}
        <div className="bg-card rounded-xl p-4 mb-6 border border-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Analysis Period:</span>
            </div>
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(days)}
                >
                  {days} Days
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Retention Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Retention Health</h3>
          
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-secondary"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  className={retentionHealth.color.replace('text-', 'text-')}
                  style={{
                    strokeDasharray: `${(overallRetention / 100) * 553} 553`,
                    transition: 'stroke-dasharray 0.5s ease-in-out'
                  }}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${retentionHealth.color}`}>
                  {overallRetention.toFixed(0)}%
                </span>
                <span className="text-sm text-muted-foreground">Retention</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6">
            {[
              { label: 'Excellent (70%+)', color: 'bg-green-500' },
              { label: 'Good (50-70%)', color: 'bg-yellow-500' },
              { label: 'Needs Attention (30-50%)', color: 'bg-orange-500' },
              { label: 'Critical (<30%)', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cohort Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Cohort Retention</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Users grouped by signup period</span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cohort data available for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cohorts.map((cohort, index) => {
                const health = getRetentionHealth(cohort.retentionRate);
                return (
                  <motion.div
                    key={cohort.cohort}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-32 text-sm text-muted-foreground truncate">
                      {new Date(cohort.cohort).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cohort.retentionRate}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full ${health.bg} rounded-lg flex items-center justify-end px-2`}
                        >
                          <span className="text-xs font-medium text-white">
                            {cohort.retentionRate.toFixed(0)}%
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="w-24 text-sm text-right">
                      <span className="text-muted-foreground">
                        {cohort.retainedUsers}/{cohort.totalUsers}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Cohort Table */}
        {cohorts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border mt-6 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Cohort Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Cohort</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Total Users</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Retained</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cohorts.map((cohort) => {
                    const health = getRetentionHealth(cohort.retentionRate);
                    return (
                      <tr key={cohort.cohort} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-foreground">
                          {new Date(cohort.cohort).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground text-right">
                          {cohort.totalUsers}
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground text-right">
                          {cohort.retainedUsers}
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground text-right font-medium">
                          {cohort.retentionRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${health.bg}/10 ${health.color}`}>
                            {health.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl p-6 border border-border mt-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Improving Retention
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Onboarding Experience</h4>
              <p className="text-sm text-muted-foreground">
                Users who complete their profile are 3x more likely to return. Consider adding guided onboarding.
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Email Engagement</h4>
              <p className="text-sm text-muted-foreground">
                Send personalized job matches to keep users engaged. Weekly digests can improve retention by 25%.
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Feature Discovery</h4>
              <p className="text-sm text-muted-foreground">
                Help users discover features like job alerts and application tracking to increase platform value.
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Re-engagement Campaigns</h4>
              <p className="text-sm text-muted-foreground">
                Target users who haven&apos;t logged in for 7+ days with personalized re-engagement emails.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
