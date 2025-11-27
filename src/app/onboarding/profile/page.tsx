'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileAPI } from '@/lib/api';
import type { ProfileData, ProfileResponse } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    skills: [],
    desiredJobTitles: [],
    preferredJobTypes: [],
    preferredLocations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.getProfile();
      
      // Check if profile has data from CV parsing
      const hasAutoFilledData = !!(data.fullName || (data.skills && data.skills.length > 0));
      setAutoFilled(hasAutoFilledData);
      
      setProfile({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        linkedInUrl: data.linkedInUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        professionalSummary: data.professionalSummary || '',
        yearsOfExperience: data.yearsOfExperience,
        currentRole: data.currentRole || '',
        skills: data.skills || [],
        desiredJobTitles: data.desiredJobTitles || [],
        preferredJobTypes: data.preferredJobTypes || [],
        preferredLocations: data.preferredLocations || [],
        expectedSalaryRange: data.expectedSalaryRange || '',
        willingToRelocate: data.willingToRelocate || false,
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // If profile doesn't exist yet, that's okay - user will fill it out
      if (err.response?.status !== 404) {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Save profile to backend
      await profileAPI.updateProfile(profile);
      
      // Mark onboarding as completed and clear new user flag
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.removeItem('isNewUser');
      
      // Redirect to dashboard - job matches will be updated based on new profile
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ProfileData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(s => s);
    setProfile(prev => ({ ...prev, [field]: items }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          Tell us about yourself to get matched with the best opportunities
        </p>
        
        {/* Show banner if data was auto-filled */}
        {autoFilled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-green-800 font-medium">Great! We've auto-filled some fields from your CV.</p>
              <p className="text-green-700 text-sm mt-1">Please review and add any missing information.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedInUrl || ''}
                onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
              <input
                type="url"
                value={profile.portfolioUrl || ''}
                onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Professional Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                <input
                  type="text"
                  value={profile.currentRole || ''}
                  onChange={(e) => handleChange('currentRole', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={profile.yearsOfExperience || ''}
                  onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
              <textarea
                value={profile.professionalSummary || ''}
                onChange={(e) => handleChange('professionalSummary', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Brief summary of your professional background and key achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated) *</label>
              <input
                type="text"
                value={profile.skills?.join(', ') || ''}
                onChange={(e) => handleArrayChange('skills', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="JavaScript, React, Node.js, AWS, Python"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Separate each skill with a comma</p>
            </div>
          </div>
        </section>

        {/* Job Preferences */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Job Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desired Job Titles (comma-separated)</label>
              <input
                type="text"
                value={profile.desiredJobTitles?.join(', ') || ''}
                onChange={(e) => handleArrayChange('desiredJobTitles', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Software Engineer, Full Stack Developer, Tech Lead"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Job Types (comma-separated)</label>
              <input
                type="text"
                value={profile.preferredJobTypes?.join(', ') || ''}
                onChange={(e) => handleArrayChange('preferredJobTypes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full-time, Remote, Hybrid, Contract"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations (comma-separated)</label>
              <input
                type="text"
                value={profile.preferredLocations?.join(', ') || ''}
                onChange={(e) => handleArrayChange('preferredLocations', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New York, San Francisco, Remote, London"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary Range</label>
              <input
                type="text"
                value={profile.expectedSalaryRange || ''}
                onChange={(e) => handleChange('expectedSalaryRange', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="$100,000 - $150,000"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.willingToRelocate || false}
                onChange={(e) => handleChange('willingToRelocate', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                id="willingToRelocate"
              />
              <label htmlFor="willingToRelocate" className="text-sm font-medium text-gray-700 cursor-pointer">
                Willing to relocate for the right opportunity
              </label>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Profile & Continue'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            disabled={saving}
            className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          * Required fields
        </p>
      </form>
    </div>
  );
}
