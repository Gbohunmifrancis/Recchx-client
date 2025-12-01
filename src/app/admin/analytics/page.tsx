'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, Briefcase, Activity, TrendingUp,
  ArrowUpRight, ArrowDownRight, Loader2, Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import type { AnalyticsOverview } from '@/types';

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsOverview>({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: () => adminAPI.getAnalyticsOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load analytics</p>
          <p className="text-muted-foreground text-sm">{(error as any)?.message}</p>
        </div>
      </div>
    );
  }

  // Calculate growth rates (mock values - replace with real data if available)
  const userGrowthRate = analytics?.totalUsers ? 
    Math.round((analytics.newUsersLast7Days / analytics.totalUsers) * 100) : 0;
  const appGrowthRate = analytics?.totalApplications ?
    Math.round((analytics.applicationsLast7Days / analytics.totalApplications) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Overview</h1>
          <p className="text-muted-foreground">Detailed platform metrics and insights</p>
        </div>

        {/* User Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            User Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Users</span>
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <ArrowUpRight className="h-3 w-3" />
                  {userGrowthRate}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.totalUsers?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Active Users</span>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.activeUsers?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">New Today</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.newUsersToday?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Last 30 Days</span>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.newUsersLast30Days?.toLocaleString() || 0}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Application Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-500" />
            Application Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Applications</span>
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <ArrowUpRight className="h-3 w-3" />
                  {appGrowthRate}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.totalApplications?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Last 7 Days</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.applicationsLast7Days?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Last 30 Days</span>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.applicationsLast30Days?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Avg Match Score</span>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.averageMatchScore || 0}%
              </p>
            </motion.div>
          </div>
        </div>

        {/* Job Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Job Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Total Jobs</span>
                <Briefcase className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.totalJobs?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Active Jobs</span>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.activeJobs?.toLocaleString() || 0}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Top Skills & Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Skills in Demand</h3>
            {analytics?.topSkills && analytics.topSkills.length > 0 ? (
              <div className="space-y-4">
                {analytics.topSkills.slice(0, 10).map((skill, index) => (
                  <div key={skill.skill} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                        <span className="text-xs text-muted-foreground">{skill.count} users</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((skill.count / (analytics.topSkills[0]?.count || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No skill data available</p>
            )}
          </motion.div>

          {/* Top Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Top User Locations</h3>
            {analytics?.topLocations && analytics.topLocations.length > 0 ? (
              <div className="space-y-4">
                {analytics.topLocations.slice(0, 10).map((location, index) => (
                  <div key={location.location} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{location.location}</span>
                        <span className="text-xs text-muted-foreground">{location.count} users</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((location.count / (analytics.topLocations[0]?.count || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No location data available</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
