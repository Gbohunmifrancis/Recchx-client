'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, Mail, Phone, MapPin, Briefcase, Edit, Save, 
  ArrowLeft, Loader2, Link as LinkIcon, Award, Target, DollarSign,
  Camera, Upload
} from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/use-api';
import type { ProfileData } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: profileData, isLoading, error: fetchError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();
  
  const [isEditing, setIsEditing] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileData>({});
  const [error, setError] = useState<string | null>(null);

  // Helper to get display name with fallbacks
  const getDisplayName = () => {
    if (formData.fullName) return formData.fullName;
    if (profileData?.fullName) return profileData.fullName;
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    }
    // Extract name from email if available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Helper to get initials
  const getInitials = () => {
    const name = getDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Log profile data for debugging
  useEffect(() => {
    console.log('Profile data from API:', profileData);
    console.log('Fetch error:', fetchError);
  }, [profileData, fetchError]);

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

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPictureError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPictureError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setPictureError(null);
    try {
      await uploadProfilePicture.mutateAsync(file);
      setPicturePreview(null); // Clear preview after successful upload
    } catch (err: any) {
      setPictureError(err.message || 'Failed to upload profile picture');
      setPicturePreview(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load profile data</p>
          <p className="text-muted-foreground text-sm mb-4">{(fetchError as any)?.message || 'Unknown error'}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
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
          <div className="mb-6 bg-destructive/20 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {/* Profile Picture with Upload */}
              <div className="relative group">
                {picturePreview || profileData?.profilePictureUrl ? (
                  <img
                    src={picturePreview || profileData?.profilePictureUrl}
                    alt={getDisplayName()}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {getInitials()}
                  </div>
                )}
                
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProfilePicture.isPending}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change profile picture"
                >
                  {uploadProfilePicture.isPending ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePictureChange}
                  className="hidden"
                  aria-label="Upload profile picture"
                  title="Select a profile picture to upload"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {getDisplayName()}
                </h2>
                <p className="text-muted-foreground">{formData.currentRole || profileData?.currentRole || 'Job Seeker'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || profileData?.email}</p>
                
                {pictureError && (
                  <p className="text-sm text-destructive mt-1">{pictureError}</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  ) : (
                    <p className="text-foreground py-2">{formData.fullName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="+1234567890"
                    />
                  ) : (
                    <p className="text-foreground py-2">{formData.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-foreground py-2">{formData.address || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">LinkedIn URL</label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.linkedInUrl || ''}
                      onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  ) : (
                    <p className="text-foreground py-2">
                      {formData.linkedInUrl ? (
                        <a href={formData.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <LinkIcon className="h-4 w-4" />
                          View Profile
                        </a>
                      ) : 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">GitHub URL</label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.githubUrl || ''}
                      onChange={(e) => handleChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/johndoe"
                    />
                  ) : (
                    <p className="text-foreground py-2">
                      {formData.githubUrl ? (
                        <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <LinkIcon className="h-4 w-4" />
                          View Profile
                        </a>
                      ) : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Role</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.currentRole || ''}
                    onChange={(e) => handleChange('currentRole', e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.currentRole || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.yearsOfExperience || ''}
                    onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
                    placeholder="5"
                    min="0"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.yearsOfExperience || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Professional Summary</label>
                {isEditing ? (
                  <textarea
                    value={formData.professionalSummary || ''}
                    onChange={(e) => handleChange('professionalSummary', e.target.value)}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Brief summary of your professional background..."
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.professionalSummary || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Skills</label>
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
                        <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No skills added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Preferences */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Target className="h-5 w-5" />
              Job Preferences
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Desired Job Titles</label>
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
                        <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                          {title}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No preferences set</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Preferred Job Types</label>
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
                        <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm font-medium">
                          {type}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No preferences set</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Preferred Locations</label>
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
                        <span key={idx} className="px-3 py-1 bg-teal-500/20 text-teal-500 rounded-full text-sm font-medium">
                          {location}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No preferences set</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expected Salary Range</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.expectedSalaryRange || ''}
                    onChange={(e) => handleChange('expectedSalaryRange', e.target.value)}
                    placeholder="$100,000 - $150,000"
                  />
                ) : (
                  <p className="text-foreground py-2">{formData.expectedSalaryRange || 'Not specified'}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <input
                      type="checkbox"
                      checked={formData.willingToRelocate || false}
                      onChange={(e) => handleChange('willingToRelocate', e.target.checked)}
                      className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      id="willingToRelocate"
                    />
                    <label htmlFor="willingToRelocate" className="text-sm font-medium text-foreground cursor-pointer">
                      Willing to relocate
                    </label>
                  </>
                ) : (
                  <p className="text-foreground py-2">
                    {formData.willingToRelocate ? '✅ Willing to relocate' : '❌ Not willing to relocate'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
