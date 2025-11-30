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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobDetail, useApplyToJob } from '@/hooks/use-api';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: job, isLoading, error } = useJobDetail(jobId);
  const applyToJob = useApplyToJob();

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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-2">Job not found</h3>
            <p className="text-muted-foreground">This job may have been removed or filled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-xl p-6 md:p-8 mb-6 border border-border">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{job.title}</h1>
                  {(job.isApplied || job.applied) && (
                    <Badge className="bg-green-500/20 text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Applied
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
              {job.companyLogo && (
                <img 
                  src={job.companyLogo} 
                  alt={`${job.company} logo`}
                  className="w-16 h-16 rounded-lg object-contain"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
              {job.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                </div>
              )}
              {(job.salaryRange || job.salary) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                  <span>{job.salaryRange || job.salary}</span>
                </div>
              )}
              {(job.jobType || job.type) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-5 w-5" />
                  <span>{job.jobType || job.type}</span>
                </div>
              )}
              {job.postedDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              )}
              {job.appliedDate && (
                <div className="flex items-center gap-2 text-green-500">
                  <Calendar className="h-5 w-5" />
                  <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>
                </div>
              )}
              {job.matchScore && (
                <div className="flex items-center gap-2 text-primary">
                  <span className="font-semibold">{job.matchScore}% Match</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!(job.isApplied || job.applied) ? (
                showCoverLetter ? (
                  <div className="w-full space-y-3">
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Write a cover letter (optional)..."
                      className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary"
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
          </div>

          {job.matchReasons && job.matchReasons.length > 0 && (
            <div className="bg-primary/10 rounded-xl p-6 md:p-8 mb-6 border border-primary/20">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Why this is a great match
              </h2>
              <ul className="space-y-2">
                {job.matchReasons.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.description && (
            <div className="bg-card rounded-xl p-6 md:p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Job Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-card rounded-xl p-6 md:p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="bg-card rounded-xl p-6 md:p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-card rounded-xl p-6 md:p-8 mb-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Benefits</h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">About {job.company}</h2>
            {job.companyDescription ? (
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.companyDescription}</p>
            ) : (
              <p className="text-muted-foreground">
                {job.company} is looking for talented individuals to join their team.
                {job.applicationUrl && (
                  <> Visit their <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">careers page</a> for more information.</>
                )}
              </p>
            )}
            {job.applicationDeadline && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Application Deadline:</span>{' '}
                  {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
