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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Search</h1>
          <p className="text-slate-600">Find your next opportunity</p>
        </div>

        {/* Search Bar */}
        <GlassCard className="p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
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
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
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
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
        </GlassCard>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <GlassCard className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Failed to load jobs</h3>
            <p className="text-slate-600 mb-4">{error?.message || 'Please try again later'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </GlassCard>
        ) : jobs.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-600">
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
                  <GlassCard 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      router.push(`/dashboard/jobs/${jobId}`);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 hover:text-emerald-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-slate-700 font-medium mb-3">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {(job.salaryRange || (job as any).salary) && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span>{job.salaryRange || (job as any).salary}</span>
                        </div>
                      )}
                      {(job.jobType || (job as any).type) && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>{job.jobType || (job as any).type}</span>
                        </div>
                      )}
                      {job.postedDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 6 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                            +{job.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </GlassCard>
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
          <GlassCard className="p-12 text-center">
            <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No jobs found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
