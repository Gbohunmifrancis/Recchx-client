'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Briefcase, MapPin, CheckCircle } from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { ProfileData } from '@/types';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl border border-border p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground mb-6">
          Tell us about yourself to get matched with the best opportunities
        </p>
        
        {/* Show banner if data was auto-filled */}
        {autoFilled && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-foreground font-medium">Great! We&apos;ve auto-filled some fields from your CV.</p>
              <p className="text-muted-foreground text-sm mt-1">Please review and add any missing information.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              <User className="w-4 h-4" />
            </span>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="+1234567890"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedInUrl || ''}
                onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Portfolio URL</label>
              <input
                type="url"
                value={profile.portfolioUrl || ''}
                onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              <Briefcase className="w-4 h-4" />
            </span>
            Professional Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current Role</label>
                <input
                  type="text"
                  value={profile.currentRole || ''}
                  onChange={(e) => handleChange('currentRole', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={profile.yearsOfExperience || ''}
                  onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Professional Summary</label>
              <textarea
                value={profile.professionalSummary || ''}
                onChange={(e) => handleChange('professionalSummary', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                rows={4}
                placeholder="Brief summary of your professional background and key achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Skills (comma-separated) *</label>
              <input
                type="text"
                value={profile.skills?.join(', ') || ''}
                onChange={(e) => handleArrayChange('skills', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="JavaScript, React, Node.js, AWS, Python"
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">Separate each skill with a comma</p>
            </div>
          </div>
        </section>

        {/* Job Preferences */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              <MapPin className="w-4 h-4" />
            </span>
            Job Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Desired Job Titles (comma-separated)</label>
              <input
                type="text"
                value={profile.desiredJobTitles?.join(', ') || ''}
                onChange={(e) => handleArrayChange('desiredJobTitles', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Software Engineer, Full Stack Developer, Tech Lead"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Job Types (comma-separated)</label>
              <input
                type="text"
                value={profile.preferredJobTypes?.join(', ') || ''}
                onChange={(e) => handleArrayChange('preferredJobTypes', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Full-time, Remote, Hybrid, Contract"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Locations (comma-separated)</label>
              <input
                type="text"
                value={profile.preferredLocations?.join(', ') || ''}
                onChange={(e) => handleArrayChange('preferredLocations', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="New York, San Francisco, Remote, London"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expected Salary Range</label>
              <input
                type="text"
                value={profile.expectedSalaryRange || ''}
                onChange={(e) => handleChange('expectedSalaryRange', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="$100,000 - $150,000"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.willingToRelocate || false}
                onChange={(e) => handleChange('willingToRelocate', e.target.checked)}
                className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-2 focus:ring-primary"
                id="willingToRelocate"
              />
              <label htmlFor="willingToRelocate" className="text-sm font-medium text-foreground cursor-pointer">
                Willing to relocate for the right opportunity
              </label>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile & Continue'
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/dashboard')}
            disabled={saving}
          >
            Skip for now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          * Required fields
        </p>
      </form>
    </div>
  );
}
