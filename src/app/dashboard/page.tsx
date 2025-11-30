'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { usePreventBackAfterLogout } from '@/hooks/use-navigation-guard';
import { 
  useJobMatches, 
  useDashboardStats, 
  useProfile,
  useNotifications 
} from '@/hooks/use-api';
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
  User,
  Award,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
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

  const jobs = jobMatches?.jobs || [];
  const totalJobMatches = jobs.length;

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl lg:text-4xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName || profile?.firstName || profile?.fullName?.split(' ')[0] || 'there'}!
        </h1>
      </div>

      {/* Profile Summary */}
      {profile && !profileLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 bg-card rounded-xl p-5 lg:p-6 border border-border"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{profile.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profile.currentRole}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {profile.desiredJobTitles && profile.desiredJobTitles.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.desiredJobTitles.slice(0, 3).map((title, idx) => (
                        <Badge key={idx} variant="default" className="bg-primary/20 text-primary border border-primary/30">
                          {title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.preferredLocations && profile.preferredLocations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Preferred Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredLocations.slice(0, 3).map((location, idx) => (
                        <Badge key={idx} variant="default" className="bg-secondary text-secondary-foreground border border-border">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.yearsOfExperience !== undefined && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Experience</p>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{profile.yearsOfExperience} years</span>
                    </div>
                  </div>
                )}
                
                {profile.expectedSalaryRange && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Expected Salary</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{profile.expectedSalaryRange}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/profile')}
              className="self-start"
            >
              Edit Profile
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push('/dashboard/jobs')}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="text-primary text-sm font-medium">↗ {stats?.topMatchScore || 0}%</span>
          </div>
          <p className="text-muted-foreground text-sm mb-1">Job Matches</p>
          <p className="text-3xl font-bold text-foreground">{totalJobMatches}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push('/dashboard/applications')}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="h-6 w-6 text-emerald-500" />
            </div>
            {stats?.weeklyStats?.applications && stats.weeklyStats.applications > 0 && (
              <span className="text-emerald-500 text-sm font-medium">+{stats.weeklyStats.applications} this week</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-1">Applications</p>
          <p className="text-3xl font-bold text-foreground">{stats?.applicationsSubmitted || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => router.push('/dashboard/mailbox')}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              {stats?.mailboxConnected ? (
                <MailCheck className="h-6 w-6 text-primary" />
              ) : (
                <Mail className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-1">Mailbox</p>
          <p className="text-xl font-bold text-foreground">
            {stats?.mailboxConnected ? 'Connected' : 'Not Connected'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/dashboard/notifications')}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="text-primary text-sm font-medium">events</span>
          </div>
          <p className="text-muted-foreground text-sm mb-1">Weekly Activity</p>
          <p className="text-3xl font-bold text-foreground">
            {(stats?.weeklyStats?.newMatches || 0) + (stats?.weeklyStats?.responses || 0)}
          </p>
        </motion.div>
      </div>

      {/* Job Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-5 lg:p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            Available Jobs
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/jobs')}
            className="gap-2"
          >
            View All
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {jobsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobsError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-base font-semibold text-foreground mb-2">Failed to load jobs</p>
            <p className="text-sm text-muted-foreground">{jobsError?.message || 'Please try again later'}</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 lg:p-5 bg-secondary rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  {job.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                  {job.postedDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-background text-muted-foreground rounded-full text-xs font-medium border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="px-3 py-1 bg-background text-muted-foreground rounded-full text-xs border border-border">
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
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">No jobs available</p>
            <p className="text-sm text-muted-foreground mb-6">Check back later for new job opportunities</p>
            <Button onClick={() => router.push('/dashboard/profile')} className="gap-2">
              <User className="h-4 w-4" />
              Complete Profile
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
