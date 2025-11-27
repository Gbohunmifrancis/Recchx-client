'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { usePreventBackAfterLogout } from '@/hooks/use-navigation-guard';
import { 
  useJobMatches, 
  useJobSearch,
  useDashboardStats, 
  useProfile,
  useNotifications 
} from '@/hooks/use-api';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock,
  Target,
  Send,
  Eye,
  AlertCircle,
  Mail,
  MailCheck,
  TrendingUp,
  Bell,
  User,
  Award,
  Activity
} from 'lucide-react';
import type { Job } from '@/types';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  usePreventBackAfterLogout();

  // Fetch all dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({ limit: 5 });
  
  // Use job matches API based on user profile
  const { data: jobMatches, isLoading: jobsLoading, error: jobsError } = useJobMatches({
    page: 1,
    limit: 20,
    sortBy: 'matchScore'
  });
  
  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth');
    return null;
  }

  const jobs = jobMatches?.jobs || [];
  const unreadNotifications = notifications?.notifications?.filter(n => !n.read).length || 0;
  const totalJobMatches = jobs.length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header with Greeting */}
          <div className="mb-8">
            <div className="mb-8">
              <p className="text-slate-500 text-sm mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-4xl font-bold text-slate-900">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || profile?.firstName || 'there'}!
              </h1>
              
              {/* Profile Summary */}
              {profile && !profileLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
                          <p className="text-sm text-slate-600">{profile.currentRole}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {profile.desiredJobTitles && profile.desiredJobTitles.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Looking For</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.desiredJobTitles.slice(0, 3).map((title, idx) => (
                                <Badge key={idx} variant="default" className="bg-emerald-100 text-emerald-700">
                                  {title}
                                </Badge>
                              ))}
                              {profile.desiredJobTitles.length > 3 && (
                                <Badge variant="default" className="bg-slate-100 text-slate-600">
                                  +{profile.desiredJobTitles.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {profile.preferredLocations && profile.preferredLocations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Preferred Locations</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.preferredLocations.slice(0, 3).map((location, idx) => (
                                <Badge key={idx} variant="default" className="bg-blue-100 text-blue-700">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {location}
                                </Badge>
                              ))}
                              {profile.preferredLocations.length > 3 && (
                                <Badge variant="default" className="bg-slate-100 text-slate-600">
                                  +{profile.preferredLocations.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {profile.yearsOfExperience !== undefined && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Experience</p>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-slate-900">{profile.yearsOfExperience} years</span>
                            </div>
                          </div>
                        )}
                        
                        {profile.expectedSalaryRange && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Expected Salary</p>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-slate-900">{profile.expectedSalaryRange}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/profile')}
                      className="gap-2"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => router.push('/dashboard/jobs')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">↗ {stats?.topMatchScore || 0}%</span>
                </div>
                <p className="text-slate-600 text-sm mb-1">Job Matches</p>
                <p className="text-3xl font-bold text-slate-900">{totalJobMatches}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => router.push('/dashboard/applications')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  {stats?.weeklyStats?.applications && stats.weeklyStats.applications > 0 && (
                    <span className="text-blue-600 text-sm font-medium">+{stats.weeklyStats.applications} this week</span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-1">Applications</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.applicationsSubmitted || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => router.push('/dashboard/mailbox')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {stats?.mailboxConnected ? (
                      <MailCheck className="h-6 w-6 text-purple-600" />
                    ) : (
                      <Mail className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-1">Mailbox</p>
                <p className="text-xl font-bold text-slate-900">
                  {stats?.mailboxConnected ? 'Connected' : 'Not Connected'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => router.push('/dashboard/notifications')}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-orange-600 text-sm font-medium">events</span>
                </div>
                <p className="text-slate-600 text-sm mb-1">Weekly Activity</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(stats?.weeklyStats?.newMatches || 0) + (stats?.weeklyStats?.responses || 0)}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Job Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                </div>
                Available Jobs
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/jobs')}
                className="gap-2"
              >
                View All
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : jobsError ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">Failed to load jobs</p>
                <p className="text-sm text-slate-600 mb-6">{jobsError?.message || 'Please try again later'}</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.salaryRange && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                      {job.postedDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 5).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-3 py-1 bg-white text-slate-500 rounded-full text-xs border border-slate-200">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">No jobs available</p>
                <p className="text-sm text-slate-600 mb-6">Check back later for new job opportunities</p>
                <Button onClick={() => router.push('/dashboard/profile')} className="gap-2">
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
