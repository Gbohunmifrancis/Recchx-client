'use client';

import React from 'react';
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
  BookmarkPlus
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useJobDetail } from '@/hooks/use-api';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading, error } = useJobDetail(jobId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <GlassCard className="p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Job not found</h3>
            <p className="text-slate-600">This job may have been removed or filled</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 text-slate-700 text-lg mb-4">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>

            {/* Job Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {job.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span>{job.location}</span>
                </div>
              )}
              {(job.salaryRange || (job as any).salary) && (
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  <span>{job.salaryRange || (job as any).salary}</span>
                </div>
              )}
              {(job.jobType || (job as any).type) && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  <span>{job.jobType || (job as any).type}</span>
                </div>
              )}
              {job.postedDate && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Apply Now
              </Button>
              <Button variant="outline" className="gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Save Job
              </Button>
              {job.applicationUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(job.applicationUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  External Link
                </Button>
              )}
            </div>
          </GlassCard>

          {/* Job Description */}
          {job.description && (
            <GlassCard className="p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </GlassCard>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <GlassCard className="p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <GlassCard className="p-8 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Company Info */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About {job.company}</h2>
            <p className="text-slate-700">Company information will be displayed here.</p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
