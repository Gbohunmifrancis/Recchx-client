'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Loader2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock,
  Building2,
  ExternalLink,
  Send,
  BookmarkPlus,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobDetail, useApplyToJob } from '@/hooks/use-api';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { useAuth } from '@/contexts/auth-context';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { user, logout } = useAuth();
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: job, isLoading, error } = useJobDetail(jobId);
  const applyToJob = useApplyToJob();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const handleApply = async () => {
    if (!job) return;
    
    try {
      await applyToJob.mutateAsync({
        jobId: job.id,
        data: { coverLetter: coverLetter || undefined }
      });
      
      setShowCoverLetter(false);
      setCoverLetter('');
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <DashboardSidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <DashboardSidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <GlassCard className="p-12 text-center">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Job not found</h3>
              <p className="text-slate-600">This job may have been removed or filled</p>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6 md:p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{job.title}</h1>
                    {job.isApplied && (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Applied
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 text-lg">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-200">
                {job.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salaryRange && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                    <span>{job.salaryRange}</span>
                  </div>
                )}
                {job.jobType && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    <span>{job.jobType}</span>
                  </div>
                )}
                {job.postedDate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {job.appliedDate && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Calendar className="h-5 w-5" />
                    <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {job.matchScore && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="font-semibold">{job.matchScore}% Match</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {!job.isApplied ? (
                  showCoverLetter ? (
                    <div className="w-full space-y-3">
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Write a cover letter (optional)..."
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleApply} disabled={applyToJob.isPending} className="gap-2">
                          {applyToJob.isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Applying...</>
                          ) : (
                            <><Send className="h-4 w-4" />Submit Application</>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowCoverLetter(false); setCoverLetter(''); }} disabled={applyToJob.isPending}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setShowCoverLetter(true)} className="gap-2">
                      <Send className="h-4 w-4" />
                      Apply Now
                    </Button>
                  )
                ) : (
                  <Button disabled className="gap-2 bg-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Already Applied
                  </Button>
                )}
                
                {job.applicationUrl && (
                  <Button variant="outline" onClick={() => window.open(job.applicationUrl, '_blank')} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Apply on Company Site
                  </Button>
                )}
              </div>
            </GlassCard>

            {job.matchReasons && job.matchReasons.length > 0 && (
              <GlassCard className="p-6 md:p-8 mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Why this is a great match
                </h2>
                <ul className="space-y-2">
                  {job.matchReasons.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {job.description && (
              <GlassCard className="p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </GlassCard>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <GlassCard className="p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {job.skills && job.skills.length > 0 && (
              <GlassCard className="p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <GlassCard className="p-6 md:p-8 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Benefits</h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            <GlassCard className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About {job.company}</h2>
              <p className="text-slate-700">
                {job.company} is looking for talented individuals to join their team.
                {job.applicationUrl && (
                  <> Visit their <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">careers page</a> for more information.</>
                )}
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
