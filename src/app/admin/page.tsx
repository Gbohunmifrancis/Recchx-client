'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, Activity, TrendingUp, 
  UserPlus, Clock, BarChart3, ArrowUpRight,
  ArrowDownRight, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import type { AnalyticsOverview } from '@/types';

export default function AdminDashboard() {
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

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: analytics?.newUsersToday || 0,
      changeLabel: 'new today',
      trend: 'up',
    },
    {
      label: 'Active Users',
      value: analytics?.activeUsers || 0,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: analytics?.newUsersLast7Days || 0,
      changeLabel: 'last 7 days',
      trend: 'up',
    },
    {
      label: 'Total Applications',
      value: analytics?.totalApplications || 0,
      icon: Briefcase,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: analytics?.applicationsLast7Days || 0,
      changeLabel: 'last 7 days',
      trend: 'up',
    },
    {
      label: 'Total Jobs',
      value: analytics?.totalJobs || 0,
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: analytics?.activeJobs || 0,
      changeLabel: 'active',
      trend: 'neutral',
    },
  ];

  const secondaryStats = [
    {
      label: 'New Users (30 days)',
      value: analytics?.newUsersLast30Days || 0,
      icon: UserPlus,
    },
    {
      label: 'Applications (30 days)',
      value: analytics?.applicationsLast30Days || 0,
      icon: TrendingUp,
    },
    {
      label: 'Avg Match Score',
      value: `${analytics?.averageMatchScore || 0}%`,
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform metrics and user activity</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+{stat.change}</span>
                  </div>
                )}
                {stat.trend === 'down' && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>-{stat.change}</span>
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </h3>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change} {stat.changeLabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-card rounded-xl p-5 border border-border flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground">{stat.value}</h4>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Skills & Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Skills</h3>
            {analytics?.topSkills && analytics.topSkills.length > 0 ? (
              <div className="space-y-3">
                {analytics.topSkills.slice(0, 8).map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${Math.min((skill.count / (analytics.topSkills[0]?.count || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{skill.count}</span>
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
            transition={{ delay: 0.8 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Locations</h3>
            {analytics?.topLocations && analytics.topLocations.length > 0 ? (
              <div className="space-y-3">
                {analytics.topLocations.slice(0, 8).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <span className="text-sm font-medium text-foreground">{location.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ 
                            width: `${Math.min((location.count / (analytics.topLocations[0]?.count || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{location.count}</span>
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
