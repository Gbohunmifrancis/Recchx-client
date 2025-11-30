'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJobSearch } from '@/hooks/use-api';

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: jobSearch, isLoading, error } = useJobSearch({
    query: searchQuery || undefined,
    location: location || undefined,
    jobType: jobType || undefined,
    minSalary: minSalary ? parseInt(minSalary) : undefined,
    maxSalary: maxSalary ? parseInt(maxSalary) : undefined,
    page: currentPage,
    limit: 20
  }, true);

  const jobs = jobSearch?.jobs || [];
  const pagination = jobSearch?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Job Search</h1>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Search Jobs
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load jobs</h3>
            <p className="text-muted-foreground mb-4">{error?.message || 'Please try again later'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {jobs.length} of {pagination?.totalJobs || 0} jobs
            </div>

            <div className="space-y-4 mb-8">
              {jobs.map((job, index) => {
                const jobId = job.id || (job as any)._id || index.toString();
                return (
                <motion.div
                  key={jobId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <div 
                    className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => {
                      router.push(`/dashboard/jobs/${jobId}`);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {/* Match Score Badge */}
                          {job.matchScore && (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                job.matchScore >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                                job.matchScore >= 60 ? 'bg-yellow-500/20 text-yellow-600' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {job.matchScore}% Match
                              </span>
                              {/* Verified via Resume Badge */}
                              {job.matchReasons?.some((reason: string) => reason.toLowerCase().includes('verified via resume')) && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground font-medium mb-3">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {(job.salaryRange || (job as any).salary) && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salaryRange || (job as any).salary}</span>
                        </div>
                      )}
                      {(job.jobType || (job as any).type) && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.jobType || (job as any).type}</span>
                        </div>
                      )}
                      {job.postedDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 6).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 6 && (
                          <span className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-xs">
                            +{job.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Match Reasons (show first 2) */}
                    {job.matchReasons && job.matchReasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Why this matches you:</p>
                        <ul className="space-y-1">
                          {job.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Applied Badge */}
                    {(job.isApplied || (job as any).applied) && (
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                        ✓ Applied
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
