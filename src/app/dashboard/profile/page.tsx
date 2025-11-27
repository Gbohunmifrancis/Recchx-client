'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { 
  User, Mail, Phone, MapPin, Briefcase, Edit, Save, 
  ArrowLeft, Loader2, Link as LinkIcon, Award, Target, DollarSign 
} from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/use-api';
import type { ProfileData } from '@/types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: profileData, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        linkedInUrl: profileData.linkedInUrl || '',
        githubUrl: profileData.githubUrl || '',
        portfolioUrl: profileData.portfolioUrl || '',
        professionalSummary: profileData.professionalSummary || '',
        yearsOfExperience: profileData.yearsOfExperience,
        currentRole: profileData.currentRole || '',
        skills: profileData.skills || [],
        desiredJobTitles: profileData.desiredJobTitles || [],
        preferredJobTypes: profileData.preferredJobTypes || [],
        preferredLocations: profileData.preferredLocations || [],
        expectedSalaryRange: profileData.expectedSalaryRange || '',
        willingToRelocate: profileData.willingToRelocate || false,
      });
    }
  }, [profileData]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ProfileData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <DashboardSidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Profile</h1>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (profileData) {
                      setFormData({
                        fullName: profileData.fullName || '',
                        phoneNumber: profileData.phoneNumber || '',
                        address: profileData.address || '',
                        linkedInUrl: profileData.linkedInUrl || '',
                        githubUrl: profileData.githubUrl || '',
                        portfolioUrl: profileData.portfolioUrl || '',
                        professionalSummary: profileData.professionalSummary || '',
                        yearsOfExperience: profileData.yearsOfExperience,
                        currentRole: profileData.currentRole || '',
                        skills: profileData.skills || [],
                        desiredJobTitles: profileData.desiredJobTitles || [],
                        preferredJobTypes: profileData.preferredJobTypes || [],
                        preferredLocations: profileData.preferredLocations || [],
                        expectedSalaryRange: profileData.expectedSalaryRange || '',
                        willingToRelocate: profileData.willingToRelocate || false,
                      });
                    }
                    setError(null);
                  }}
                  disabled={updateProfile.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* User Info Card */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.fullName?.[0] || user?.firstName?.[0]}{formData.fullName?.split(' ')?.[1]?.[0] || user?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {formData.fullName || `${user?.firstName} ${user?.lastName}`}
                  </h2>
                  <p className="text-slate-600">{formData.currentRole || 'Job Seeker'}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.fullName || ''}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">{formData.fullName || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="+1234567890"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">{formData.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">{formData.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                    {isEditing ? (
                      <Input
                        type="url"
                        value={formData.linkedInUrl || ''}
                        onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">
                        {formData.linkedInUrl ? (
                          <a href={formData.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            View Profile
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GitHub URL</label>
                    {isEditing ? (
                      <Input
                        type="url"
                        value={formData.githubUrl || ''}
                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                        placeholder="https://github.com/johndoe"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">
                        {formData.githubUrl ? (
                          <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            View Profile
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Professional Information */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.currentRole || ''}
                      onChange={(e) => handleChange('currentRole', e.target.value)}
                      placeholder="Senior Software Engineer"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{formData.currentRole || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.yearsOfExperience || ''}
                      onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
                      placeholder="5"
                      min="0"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{formData.yearsOfExperience || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Professional Summary</label>
                  {isEditing ? (
                    <textarea
                      value={formData.professionalSummary || ''}
                      onChange={(e) => handleChange('professionalSummary', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Brief summary of your professional background..."
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{formData.professionalSummary || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.skills?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('skills', e.target.value)}
                      placeholder="JavaScript, React, Node.js, Python"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {formData.skills && formData.skills.length > 0 ? (
                        formData.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600">No skills added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Job Preferences */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Target className="h-5 w-5" />
                Job Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desired Job Titles</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.desiredJobTitles?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('desiredJobTitles', e.target.value)}
                      placeholder="Software Engineer, Full Stack Developer"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {formData.desiredJobTitles && formData.desiredJobTitles.length > 0 ? (
                        formData.desiredJobTitles.map((title, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {title}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600">No preferences set</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Job Types</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.preferredJobTypes?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('preferredJobTypes', e.target.value)}
                      placeholder="Full-time, Remote, Hybrid"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {formData.preferredJobTypes && formData.preferredJobTypes.length > 0 ? (
                        formData.preferredJobTypes.map((type, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {type}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600">No preferences set</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Locations</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.preferredLocations?.join(', ') || ''}
                      onChange={(e) => handleArrayChange('preferredLocations', e.target.value)}
                      placeholder="New York, San Francisco, Remote"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {formData.preferredLocations && formData.preferredLocations.length > 0 ? (
                        formData.preferredLocations.map((location, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            {location}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600">No preferences set</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expected Salary Range</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.expectedSalaryRange || ''}
                      onChange={(e) => handleChange('expectedSalaryRange', e.target.value)}
                      placeholder="$100,000 - $150,000"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{formData.expectedSalaryRange || 'Not specified'}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <input
                        type="checkbox"
                        checked={formData.willingToRelocate || false}
                        onChange={(e) => handleChange('willingToRelocate', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        id="willingToRelocate"
                      />
                      <label htmlFor="willingToRelocate" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Willing to relocate
                      </label>
                    </>
                  ) : (
                    <p className="text-slate-900 py-2">
                      {formData.willingToRelocate ? '✅ Willing to relocate' : '❌ Not willing to relocate'}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
