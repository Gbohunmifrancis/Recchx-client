'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, Users, ArrowUpRight, 
  ArrowDownRight, Loader2, Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface SignupData {
  date: string;
  count: number;
}

interface SignupAnalyticsResponse {
  data: SignupData[];
  totalSignups: number;
  period: string;
}

export default function AdminSignupsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data, isLoading, error } = useQuery<SignupAnalyticsResponse>({
    queryKey: ['admin', 'analytics', 'signups', { fromDate, toDate, groupBy: period }],
    queryFn: () => adminAPI.getSignupAnalytics({ fromDate, toDate, groupBy: period }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const signupData = data?.data || [];
  const totalSignups = data?.totalSignups || 0;

  // Calculate max value for chart scaling
  const maxCount = Math.max(...signupData.map(d => d.count), 1);

  // Calculate growth rate
  const getGrowthRate = () => {
    if (signupData.length < 2) return 0;
    const recent = signupData.slice(-7).reduce((sum, d) => sum + d.count, 0);
    const previous = signupData.slice(-14, -7).reduce((sum, d) => sum + d.count, 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - previous) / previous) * 100);
  };

  const growthRate = getGrowthRate();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load signup analytics</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Signup Analytics</h1>
          <p className="text-muted-foreground">Track user registration trends over time</p>
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
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              {growthRate >= 0 ? (
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  {growthRate}%
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <ArrowDownRight className="h-4 w-4" />
                  {Math.abs(growthRate)}%
                </div>
              )}
            </div>
            <h3 className="text-3xl font-bold text-foreground">{totalSignups.toLocaleString()}</h3>
            <p className="text-muted-foreground text-sm">Total Signups</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground">
              {signupData.slice(-7).reduce((sum, d) => sum + d.count, 0)}
            </h3>
            <p className="text-muted-foreground text-sm">Last 7 Days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground">
              {signupData.length > 0 ? Math.round(totalSignups / signupData.length) : 0}
            </h3>
            <p className="text-muted-foreground text-sm">Avg per {period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : 'Month'}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 mb-6 border border-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Period:</span>
            </div>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-foreground border border-border"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-foreground border border-border"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Signup Trends</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : signupData.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No signup data for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="flex items-end gap-1 h-64">
                {signupData.map((item, index) => (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10 border border-border shadow-md">
                        {item.count} signups
                        <br />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.count / maxCount) * 200}px` }}
                        transition={{ delay: index * 0.02, duration: 0.3 }}
                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm min-h-[4px] cursor-pointer hover:from-primary/80 hover:to-primary/40 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* X-axis labels (show every nth label to avoid crowding) */}
              <div className="flex gap-1">
                {signupData.map((item, index) => {
                  const showLabel = signupData.length <= 15 || index % Math.ceil(signupData.length / 10) === 0;
                  return (
                    <div key={item.date} className="flex-1 text-center">
                      {showLabel && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Data Table */}
        {signupData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border mt-6 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Detailed Data</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Signups</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {signupData.slice().reverse().map((item) => (
                    <tr key={item.date} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-foreground">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-3 text-sm text-foreground text-right font-medium">
                        {item.count}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground text-right">
                        {totalSignups > 0 ? ((item.count / totalSignups) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
