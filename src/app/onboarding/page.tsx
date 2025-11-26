'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Upload, FileText, Target, User, Sparkles, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface OnboardingData {
  // Step 1: Resume Upload (Optional)
  resumeFile: File | null;
  uploadMethod: 'upload' | 'manual' | null;
  
  // Step 2: Profile & Preferences
  fullName: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  skills: string[];
  
  // Step 3: Job Preferences
  desiredJobTitles: string[];
  jobType: string[];
  preferredLocations: string[];
  salaryRange: string;
}

// Predefined skills suggestions for combobox
const SKILL_SUGGESTIONS = [
  // Technical Skills
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'REST API',
  // Soft Skills
  'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management',
  'Critical Thinking', 'Adaptability', 'Creativity', 'Project Management', 'Strategic Planning',
  'Conflict Resolution', 'Negotiation', 'Presentation Skills', 'Emotional Intelligence', 'Decision Making',
  // Industry Skills
  'Data Analysis', 'Machine Learning', 'UI/UX Design', 'Agile', 'Scrum', 'DevOps', 'Cybersecurity'
];

const steps = [
  { id: 1, title: 'Upload Resume', icon: Upload, required: false },
  { id: 2, title: 'Profile & Preferences', icon: User, required: true },
  { id: 3, title: 'Job Preferences', icon: Target, required: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isParsing, setIsParsing] = React.useState(false);
  const [data, setData] = React.useState<OnboardingData>({
    resumeFile: null,
    uploadMethod: null,
    fullName: '',
    phone: '',
    location: '',
    linkedInUrl: '',
    currentJobTitle: '',
    yearsOfExperience: '',
    skills: [],
    desiredJobTitles: [],
    jobType: [],
    preferredLocations: [],
    salaryRange: '',
  });

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1: // Resume Upload - optional
        return true;
      case 2: // Profile - required
        return data.fullName && data.phone && data.location && data.yearsOfExperience;
      case 3: // Job Preferences - required
        return data.desiredJobTitles.length > 0 && data.jobType.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (steps[currentStep - 1].required && !validateStep()) {
      alert('Please fill in all required fields before continuing.');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/auth');
        return;
      }
      
      // Prepare profile data matching the API schema exactly
      const profileData = {
        fullName: data.fullName,
        phoneNumber: data.phone,
        address: data.location,
        linkedInUrl: data.linkedInUrl || undefined,
        githubUrl: undefined,
        portfolioUrl: undefined,
        professionalSummary: `${data.currentJobTitle || 'Job seeker'} with ${data.yearsOfExperience} years of experience. Seeking opportunities in ${data.desiredJobTitles.join(', ')}.`, 
        yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
        currentRole: data.currentJobTitle || 'Job Seeker',
        skills: data.skills.length > 0 ? data.skills : ['General'],
        desiredJobTitles: data.desiredJobTitles.length > 0 ? data.desiredJobTitles : ['General'],
        preferredJobTypes: data.jobType.length > 0 ? data.jobType : ['Full-time'],
        preferredLocations: data.preferredLocations.length > 0 ? data.preferredLocations : ['Remote'],
        expectedSalaryRange: data.salaryRange || 'Not specified',
        willingToRelocate: data.preferredLocations.includes('Remote') || data.preferredLocations.length > 1,
      };

      // Save profile to backend using POST /api/user/profile
      const saveResult = await profileAPI.updateProfile(profileData);
      
      if (saveResult.success || saveResult.profileId) {
      }
      
      // Refresh user data in auth context
      await refreshUser();
      
      // Store locally for quick access
      localStorage.setItem('onboardingData', JSON.stringify(data));
      localStorage.setItem('onboardingCompleted', 'true');

      // Navigate to dashboard with a slight delay
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/dashboard');
    } catch (error: any) {
      
      // Show error message to user
      alert(`Failed to save profile: ${error.response?.data?.message || error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen animated-gradient py-4 md:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Let's get you set up to find your dream job
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-700">
              Step {currentStep} of {steps.length}
            </h2>
            <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-6 md:mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center flex-1 ${
                index < steps.length - 1 ? 'relative' : ''
              }`}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep > step.id
                    ? 'bg-emerald-500 text-white'
                    : currentStep === step.id
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-200'
                    : 'bg-white/50 text-slate-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <step.icon className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </div>
              <span className={`text-[10px] md:text-sm font-medium text-center px-1 ${
                currentStep >= step.id ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="absolute top-5 md:top-6 left-1/2 w-full h-0.5 bg-white/30 -z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-4 md:p-8">
              {currentStep === 1 && <Step1ResumeUpload data={data} updateData={updateData} setIsParsing={setIsParsing} isParsing={isParsing} />}
              {currentStep === 2 && <Step2Profile data={data} updateData={updateData} />}
              {currentStep === 3 && <Step3JobPreferences data={data} updateData={updateData} />}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 md:mt-8 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className="gap-2 text-sm md:text-base"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline">Back</span>
                </Button>

                <div className="flex gap-2 md:gap-3">
                  {!steps[currentStep - 1].required && (
                    <Button variant="outline" onClick={handleSkip} disabled={isSubmitting} className="text-sm md:text-base">
                      Skip
                    </Button>
                  )}
                  <Button variant="primary" onClick={handleNext} disabled={isSubmitting || isParsing} className="text-sm md:text-base">
                    {isParsing ? 'Processing...' : isSubmitting ? 'Submitting...' : currentStep === steps.length ? 'Complete' : 'Continue'}
                    {!isSubmitting && !isParsing && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step 1: Resume Upload
function Step1ResumeUpload({ data, updateData, setIsParsing, isParsing }: any) {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    updateData('resumeFile', file);
    updateData('uploadMethod', 'upload');

    // Simulate AI parsing (since backend isn't ready)
    setIsParsing(true);
    setTimeout(() => {
      // Mock parsed data
      updateData('fullName', 'John Doe');
      updateData('phone', '+1234567890');
      updateData('location', 'San Francisco, CA');
      updateData('currentJobTitle', 'Software Engineer');
      updateData('yearsOfExperience', '5-10');
      updateData('skills', ['JavaScript', 'React', 'Node.js', 'Python']);
      setIsParsing(false);
      alert('✨ Resume parsed successfully! Your profile has been pre-filled.');
    }, 2000);
  };

  const handleManualFill = () => {
    updateData('uploadMethod', 'manual');
  };

  if (data.uploadMethod === null) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Quick Start</h2>
          <p className="text-sm md:text-base text-slate-600">Choose how you'd like to build your profile</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Upload Option */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-xl glass-strong hover:bg-white/60 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Upload Resume (Recommended)</h3>
            <p className="text-sm text-slate-600">AI will extract your details automatically</p>
          </button>

          {/* Manual Option */}
          <button
            onClick={handleManualFill}
            className="p-6 rounded-xl glass-strong hover:bg-white/60 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Fill Manually</h3>
            <p className="text-sm text-slate-600">Enter your information step by step</p>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  if (data.uploadMethod === 'upload') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Upload Your Resume</h2>
          <p className="text-sm md:text-base text-slate-600">We'll use AI to extract your information</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 glass-strong hover:border-emerald-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="hidden"
          />
          
          <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-slate-400" />
          
          {isParsing ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-base md:text-lg font-semibold text-slate-800 mb-2">
                Parsing your resume...
              </p>
              <p className="text-sm text-slate-600">
                Our AI is extracting your information
              </p>
            </div>
          ) : data.resumeFile ? (
            <div>
              <Check className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-emerald-500" />
              <p className="text-base md:text-lg font-semibold text-slate-800 mb-2">
                {data.resumeFile.name}
              </p>
              <p className="text-sm text-slate-600 mb-4">
                {(data.resumeFile.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-base md:text-lg font-semibold text-slate-800 mb-2">
                Drop your resume here, or click to browse
              </p>
              <p className="text-sm text-slate-600 mb-4">
                Supports PDF and DOCX files (Max 5MB)
              </p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleManualFill}
          className="text-sm text-slate-600 hover:text-slate-800 underline"
        >
          Prefer to fill manually?
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Manual Entry Selected</h2>
        <p className="text-sm md:text-base text-slate-600">Click Continue to enter your details</p>
      </div>
      <button
        onClick={() => updateData('uploadMethod', null)}
        className="text-sm text-slate-600 hover:text-slate-800 underline"
      >
        ← Back to options
      </button>
    </div>
  );
}

// Step 2: Profile & Preferences
function Step2Profile({ data, updateData }: any) {
  const [skillInput, setSkillInput] = React.useState('');
  const [filteredSkills, setFilteredSkills] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSkillSearch = (value: string) => {
    setSkillInput(value);
    if (value.trim()) {
      const filtered = SKILL_SUGGESTIONS.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !data.skills.includes(skill)
      );
      setFilteredSkills(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !data.skills.includes(skill.trim())) {
      updateData('skills', [...data.skills, skill.trim()]);
      setSkillInput('');
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  };

  const removeSkill = (index: number) => {
    updateData('skills', data.skills.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Your Profile</h2>
        <p className="text-sm md:text-base text-slate-600">Tell us about yourself</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.fullName}
            onChange={(e) => updateData('fullName', e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.phone}
            onChange={(e) => updateData('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <Input
          value={data.location}
          onChange={(e) => updateData('location', e.target.value)}
          placeholder="San Francisco, CA"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          LinkedIn Profile
        </label>
        <Input
          value={data.linkedInUrl}
          onChange={(e) => updateData('linkedInUrl', e.target.value)}
          placeholder="https://linkedin.com/in/johndoe"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Current Job Title
          </label>
          <Input
            value={data.currentJobTitle}
            onChange={(e) => updateData('currentJobTitle', e.target.value)}
            placeholder="Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl glass-strong text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={data.yearsOfExperience}
            onChange={(e) => updateData('yearsOfExperience', e.target.value)}
          >
            <option value="">Select experience</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Skills & Expertise
        </label>
        <div className="relative">
          <Input
            value={skillInput}
            onChange={(e) => handleSkillSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
            placeholder="Type to search skills (e.g., Leadership, JavaScript)..."
            onFocus={() => skillInput && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSkills.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
              {filteredSkills.slice(0, 10).map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSkill(skill)}
                  className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-slate-700 first:rounded-t-xl last:rounded-b-xl"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {data.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm"
            >
              {skill}
              <button onClick={() => removeSkill(index)} className="hover:text-emerald-900">
                ×
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Start typing to see suggestions or add your own
        </p>
      </div>
    </div>
  );
}

// Step 3: Job Preferences
function Step3JobPreferences({ data, updateData }: any) {
  const [jobTitleInput, setJobTitleInput] = React.useState('');
  const [locationInput, setLocationInput] = React.useState('');

  const addItem = (type: 'desiredJobTitles' | 'preferredLocations', value: string, setter: Function) => {
    if (value.trim()) {
      updateData(type, [...data[type], value.trim()]);
      setter('');
    }
  };

  const removeItem = (type: 'desiredJobTitles' | 'preferredLocations', index: number) => {
    updateData(type, data[type].filter((_: any, i: number) => i !== index));
  };

  const toggleJobType = (type: string) => {
    const current = data.jobType;
    if (current.includes(type)) {
      updateData('jobType', current.filter((t: string) => t !== type));
    } else {
      updateData('jobType', [...current, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Job Preferences</h2>
        <p className="text-sm md:text-base text-slate-600">What kind of opportunities are you looking for?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Desired Job Titles <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            value={jobTitleInput}
            onChange={(e) => setJobTitleInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('desiredJobTitles', jobTitleInput, setJobTitleInput))}
            placeholder="e.g., Software Engineer"
          />
          <Button onClick={() => addItem('desiredJobTitles', jobTitleInput, setJobTitleInput)} className="whitespace-nowrap">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.desiredJobTitles.map((title: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm"
            >
              <Briefcase className="h-3 w-3" />
              {title}
              <button onClick={() => removeItem('desiredJobTitles', index)} className="hover:text-emerald-900">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Job Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid', 'On-site'].map((type) => (
            <button
              key={type}
              onClick={() => toggleJobType(type)}
              className={`px-4 py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                data.jobType.includes(type)
                  ? 'bg-emerald-500 text-white'
                  : 'glass-strong text-slate-700 hover:bg-white/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Preferred Locations
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferredLocations', locationInput, setLocationInput))}
            placeholder="e.g., San Francisco, Remote"
          />
          <Button onClick={() => addItem('preferredLocations', locationInput, setLocationInput)} className="whitespace-nowrap">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.preferredLocations.map((location: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              <MapPin className="h-3 w-3" />
              {location}
              <button onClick={() => removeItem('preferredLocations', index)} className="hover:text-blue-900">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Expected Salary Range
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            value={data.salaryRange}
            onChange={(e) => updateData('salaryRange', e.target.value)}
            placeholder="e.g., $80,000 - $120,000"
            className="pl-10"
          />
        </div>
      </div>

      <div className="glass-card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-sm text-slate-700">
            <p className="font-medium text-slate-800 mb-1">Almost done!</p>
            <p>We'll match you with relevant job opportunities based on your preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
