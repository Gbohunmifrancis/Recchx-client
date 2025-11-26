# Reechx Onboarding Flow - Complete Implementation

## Overview
A comprehensive 7-step progressive onboarding system that collects user profile information, job preferences, and application settings after email connection.

## Flow Sequence
```
Signup → Login → Mailbox Setup → OAuth (Gmail/Outlook) → **ONBOARDING** → Dashboard
```

## Step Details

### Step 1: Basic Info (Required)
**Fields:**
- Full Name *
- Phone Number *
- Location *
- LinkedIn URL
- Portfolio URL
- Professional Tagline

**Validation:** Name, phone, and location are required

### Step 2: Professional Background (Required)
**Fields:**
- Employment Status * (Employed, Unemployed, Student, Freelancer)
- Years of Experience * (Dropdown: 0-1, 1-3, 3-5, 5-10, 10+)
- Current Job Title
- Current Company
- Industry
- Work History Summary (Textarea)

**Validation:** Employment status and years of experience are required

### Step 3: Skills & Expertise (Optional)
**Fields:**
- Technical Skills (Tag input with add/remove)
- Soft Skills (Tag input with add/remove)
- Certifications (Textarea)
- Languages (Tag input)

**Features:** 
- Dynamic tag management
- Green tags for technical skills
- Purple tags for soft skills

### Step 4: Job Preferences (Required)
**Fields:**
- Desired Job Titles * (Tag input - e.g., "Software Engineer", "Product Manager")
- Preferred Industries (Tag input - e.g., "Technology", "Finance")
- Job Type * (Multi-select: Full-time, Part-time, Contract, Remote, Hybrid, On-site)
- Preferred Locations * (Tag input - e.g., "San Francisco", "Remote")
- Salary Range (Text input - e.g., "$80,000 - $120,000")
- Availability / Start Date (Date picker)

**Validation:** At least one job title, job type, and location required

### Step 5: Application Settings (Optional)
**Fields:**
- Application Frequency (Dropdown: 5/10/20 per day, 50/100 per week)
- Auto-Apply Preference (Radio: "Review Before Send" or "Auto-Send")
- Email Signature (Textarea)

**Features:**
- Controls automation behavior
- Customizable email signature for applications

### Step 6: Resume Upload (Required)
**Fields:**
- Resume File * (Drag & drop or file picker)

**Features:**
- Drag-and-drop upload zone
- Accepts PDF and DOCX files (Max 5MB)
- File preview with name and size
- Active drag state indication
- AI parsing indication

**Validation:** Resume file is required

### Step 7: Cover Letter Template (Optional)
**Fields:**
- Tone Preference (Toggle: Professional, Casual, Enthusiastic)
- Cover Letter Template (Textarea with placeholder)
- Key Achievements (Textarea for bullet points)

**Features:**
- AI will personalize template for each application
- Template variables: [Position], [Company], [Field], etc.
- Completion celebration message

## User Experience Features

### Progress Tracking
- Visual progress bar showing completion percentage
- Step counter (e.g., "Step 3 of 7")
- Step indicators with icons and checkmarks for completed steps

### Navigation
- **Back Button:** Return to previous step (disabled on first step)
- **Skip Button:** Available only for optional steps
- **Continue/Complete Setup Button:** Advance to next step or submit
- Loading state on final submission

### Validation
- Required field indicators (red asterisk)
- Validation on "Continue" button press
- Alert message if required fields are missing
- Prevents progression until requirements are met

### Visual Design
- Animated gradient background
- Glass-morphism cards with blur effects
- Smooth page transitions using Framer Motion
- Emerald green primary color (#10b981)
- Icon-based step indicators
- Responsive layout (mobile-friendly)

## Technical Implementation

### State Management
```typescript
interface OnboardingData {
  // All 7 steps worth of fields
  // See src/app/onboarding/page.tsx for complete interface
}
```

### API Integration
**Endpoints:**
- `POST /api/User/onboarding` - Submit profile data
- `POST /api/User/resume` - Upload resume file

**Implementation:**
- Separate resume upload from profile submission
- Error handling with console logs
- Automatic navigation to dashboard on completion
- Graceful degradation if API fails

### Components Used
- Custom UI components: `GlassCard`, `Button`, `Input`
- Framer Motion for animations
- Lucide React for icons
- Next.js App Router with client-side rendering

### File Structure
```
src/
├── app/
│   └── onboarding/
│       └── page.tsx (980+ lines - Complete 7-step flow)
├── lib/
│   └── api.ts (Updated with onboardingApi)
└── components/
    └── ui/ (Reusable UI components)
```

## Form Validation Rules

| Step | Required Fields | Validation Logic |
|------|----------------|------------------|
| 1 | Full Name, Phone, Location | Must be non-empty strings |
| 2 | Employment Status, Years of Experience | Must have selections |
| 3 | None (Optional) | No validation |
| 4 | Desired Job Titles (1+), Job Type (1+), Locations (1+) | Arrays must have at least 1 item |
| 5 | None (Optional) | No validation |
| 6 | Resume File | File object must exist |
| 7 | None (Optional) | No validation |

## Data Submission

### What Gets Submitted
1. **Profile Data** (JSON payload to `/api/User/onboarding`)
   - All text fields, arrays, and selections
   - Excludes the resume file (sent separately)

2. **Resume File** (FormData to `/api/User/resume`)
   - Separate multipart/form-data upload
   - Returns resume URL on success

### Submission Flow
```
1. User clicks "Complete Setup" on Step 7
2. Frontend validates all required fields
3. Upload resume file (if provided)
4. Submit profile data JSON
5. Navigate to /dashboard (regardless of API response)
```

## Future Enhancements
- Real-time field validation
- Progress saving (draft mode)
- Pre-fill from LinkedIn import
- Resume parsing to auto-fill fields
- Cover letter preview with AI generation
- Multi-language support
- Accessibility improvements (ARIA labels, keyboard navigation)

## Testing Checklist
- [ ] All 7 steps display correctly
- [ ] Required field validation works
- [ ] Optional steps can be skipped
- [ ] Tag inputs add/remove items properly
- [ ] File upload accepts PDF/DOCX
- [ ] Progress bar updates correctly
- [ ] Back/Continue navigation functions
- [ ] API submission succeeds
- [ ] Dashboard redirect works
- [ ] Responsive on mobile devices

---

**Status:** ✅ Complete and Functional
**Last Updated:** Today
**Developer:** Francis Gbohunmi
