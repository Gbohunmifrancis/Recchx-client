/**
 * Custom React Hooks for Recchx API
 * 
 * These hooks provide easy-to-use interfaces for common API operations
 * with built-in loading, error handling, and state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  Job,
  Application,
  SavedJob,
  Interview,
  CompanyDetails,
  DashboardStats,
  Notification,
} from '@/types';

// =====================================================
// JOB HOOKS
// =====================================================

/**
 * Hook to fetch and manage job matches
 */
export const useJobMatches = (params?: {
  page?: number;
  limit?: number;
  minMatchScore?: number;
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.jobs.getMatches(params);
      setJobs(response.jobs);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, pagination, refetch: fetchJobs };
};

/**
 * Hook to manage saved jobs
 */
export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.jobs.getSavedJobs();
      setSavedJobs(response.savedJobs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveJob = useCallback(async (jobId: string) => {
    try {
      await api.jobs.saveJob(jobId);
      await fetchSavedJobs();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save job');
      return false;
    }
  }, [fetchSavedJobs]);

  const unsaveJob = useCallback(async (jobId: string) => {
    try {
      await api.jobs.unsaveJob(jobId);
      await fetchSavedJobs();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unsave job');
      return false;
    }
  }, [fetchSavedJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return { savedJobs, loading, error, saveJob, unsaveJob, refetch: fetchSavedJobs };
};

/**
 * Hook to get a single job by ID
 */
export const useJob = (jobId: string | null) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await api.jobs.getJobById(jobId);
        setJob(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return { job, loading, error };
};

// =====================================================
// APPLICATION HOOKS
// =====================================================

/**
 * Hook to fetch and manage applications
 */
export const useApplications = (status?: string) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.applications.getAll({ status });
      setApplications(response.applications);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status]);

  const updateStatus = useCallback(async (id: string, newStatus: string, notes?: string) => {
    try {
      await api.applications.updateStatus(id, { status: newStatus, notes });
      await fetchApplications();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update application');
      return false;
    }
  }, [fetchApplications]);

  const addNote = useCallback(async (id: string, note: string, isPrivate = false) => {
    try {
      await api.applications.addNote(id, { note, isPrivate });
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, error, updateStatus, addNote, refetch: fetchApplications };
};

/**
 * Hook to get application activity
 */
export const useApplicationActivity = (applicationId: string | null) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await api.applications.getActivity(applicationId);
        setActivities(response.activities);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [applicationId]);

  return { activities, loading, error };
};

// =====================================================
// COMPANY HOOKS
// =====================================================

/**
 * Hook to get company details
 */
export const useCompany = (companyId: string | null) => {
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await api.company.getDetails(companyId);
        setCompany(response.company);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  return { company, loading, error };
};

/**
 * Hook to manage followed companies
 */
export const useFollowedCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.company.getFollowed();
      setCompanies(response.companies);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  const followCompany = useCallback(async (companyId: string) => {
    try {
      await api.company.follow(companyId);
      await fetchCompanies();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to follow company');
      return false;
    }
  }, [fetchCompanies]);

  const unfollowCompany = useCallback(async (companyId: string) => {
    try {
      await api.company.unfollow(companyId);
      await fetchCompanies();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unfollow company');
      return false;
    }
  }, [fetchCompanies]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, loading, error, followCompany, unfollowCompany, refetch: fetchCompanies };
};

// =====================================================
// INTERVIEW HOOKS
// =====================================================

/**
 * Hook to fetch and manage interviews
 */
export const useInterviews = (params?: { status?: string; fromDate?: string; toDate?: string }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.interview.getAll(params);
      setInterviews(response.interviews);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const scheduleInterview = useCallback(async (applicationId: string, data: any) => {
    try {
      await api.interview.schedule(applicationId, data);
      await fetchInterviews();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview');
      return false;
    }
  }, [fetchInterviews]);

  const updateInterview = useCallback(async (interviewId: string, data: any) => {
    try {
      await api.interview.update(interviewId, data);
      await fetchInterviews();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update interview');
      return false;
    }
  }, [fetchInterviews]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return { interviews, loading, error, scheduleInterview, updateInterview, refetch: fetchInterviews };
};

// =====================================================
// DASHBOARD HOOKS
// =====================================================

/**
 * Hook to get dashboard statistics
 */
export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// =====================================================
// NOTIFICATION HOOKS
// =====================================================

/**
 * Hook to manage notifications
 */
export const useNotifications = (unreadOnly = false) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.notifications.getAll({ unreadOnly });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId);
      await fetchNotifications();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark as read');
      return false;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllAsRead();
      await fetchNotifications();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark all as read');
      return false;
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refetch: fetchNotifications };
};

// =====================================================
// PROFILE HOOKS
// =====================================================

/**
 * Hook to manage user profile
 */
export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.profile.getProfile();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      await api.profile.updateProfile(data);
      await fetchProfile();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return false;
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

// =====================================================
// EXAMPLE USAGE IN COMPONENTS
// =====================================================

/*

// Job Matches Page
const JobMatchesPage = () => {
  const { jobs, loading, error, pagination } = useJobMatches({ limit: 20 });
  const { saveJob, unsaveJob } = useSavedJobs();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {jobs.map(job => (
        <JobCard 
          key={job.id} 
          job={job}
          onSave={() => saveJob(job.id)}
        />
      ))}
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  const { stats, loading } = useDashboard();
  const { notifications, unreadCount, markAsRead } = useNotifications(true);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Applications: {stats?.applicationsSubmitted}</p>
      <p>Unread Notifications: {unreadCount}</p>
    </div>
  );
};

// Interview Calendar Page
const InterviewsPage = () => {
  const { interviews, loading, scheduleInterview, updateInterview } = useInterviews();

  return (
    <div>
      <h1>Interviews</h1>
      {interviews.map(interview => (
        <InterviewCard 
          key={interview.id}
          interview={interview}
          onUpdate={(data) => updateInterview(interview.id, data)}
        />
      ))}
    </div>
  );
};

// Company Profile Page
const CompanyPage = ({ companyId }: { companyId: string }) => {
  const { company, loading } = useCompany(companyId);
  const { followCompany, unfollowCompany } = useFollowedCompanies();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{company?.name}</h1>
      <button onClick={() => followCompany(companyId)}>Follow</button>
    </div>
  );
};

*/
