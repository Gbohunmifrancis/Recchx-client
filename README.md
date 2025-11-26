# Recchx Frontend

A visually stunning, responsive frontend for the **Recchx** AI-Powered Cold Email Outreach Platform built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## 🎨 Design System

### Theme
- **Primary Color**: Light Sky Blue (`#0ea5e9`)
- **Design Style**: Premium Glassmorphism (Glass-like aesthetic)
- **Background**: Animated gradient using very light blues (`#f0f9ff` to `#e0f2fe`)

### Glassmorphism Components
All content containers feature:
- Semi-transparent backgrounds (`bg-white/40` or `bg-sky-50/30`)
- Backdrop blur effects (`backdrop-blur-lg`)
- Thin, semi-transparent borders (`border-white/50`)
- Soft, diffused shadows (`shadow-glass`, `shadow-glass-lg`)

## 🚀 Features

### Implemented Screens

1. **Authentication** (`/auth`)
   - Toggle between Login and Register
   - Password validation with real-time feedback
   - Glassmorphism floating card design
   - Social login buttons (Google, GitHub)

2. **Dashboard** (`/dashboard`)
   - 4 Key metric cards (Total Sent, Open Rate, Click Rate, Replies)
   - Recent activity feed with UserCompanyMatch data
   - Quick stats panel
   - Responsive glass sidebar navigation

3. **Campaigns Management** (`/dashboard/campaigns`)
   - Data table with all campaigns
   - Status badges (Draft, Scheduled, Sending, Sent, Paused)
   - Search and filter functionality
   - Campaign metrics visualization

4. **Prospects** (`/dashboard/prospects`)
   - Split view: Company list + Contact details
   - Email verification status indicators
   - Contact management interface
   - Company information cards

5. **User Profile** (`/dashboard/profile`)
   - Personal information form
   - Professional summary textarea
   - Skills tag system (add/remove chips)
   - Preferences toggles
   - Security options

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **State Management**: Zustand (ready to use)
- **Data Fetching**: TanStack Query (ready to use)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🗂️ Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Dashboard pages
│   │   ├── campaigns/     # Campaigns management
│   │   ├── prospects/     # Prospects & contacts
│   │   └── profile/       # User profile settings
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── glass-card.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── layout/            # Layout components
│       └── dashboard-layout.tsx
├── lib/
│   ├── mock-data.ts       # Mock data for development
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🎯 Key Components

### GlassCard
```tsx
<GlassCard variant="default | strong">
  {/* Content */}
</GlassCard>
```

### Button
```tsx
<Button variant="primary | secondary | outline | ghost" size="sm | md | lg">
  Click Me
</Button>
```

### Input
```tsx
<Input 
  label="Email" 
  error="Error message"
  // ...other props
/>
```

### Badge
```tsx
<Badge status="Draft | Scheduled | Sending | Sent | Paused" />
```

## 📊 Mock Data

The frontend includes comprehensive mock data for:
- Users and user profiles
- Campaigns with metrics
- Companies and contacts
- Dashboard statistics
- UserCompanyMatch data
- Mailbox messages

Located in `src/lib/mock-data.ts`

## 🎨 Custom Tailwind Utilities

```css
.glass              /* Glass effect with default opacity */
.glass-strong       /* Glass effect with higher opacity */
.glass-card         /* Glass effect with rounded corners */
.text-gradient      /* Sky blue gradient text */
.animated-gradient  /* Animated background gradient */
```

## 🔗 Backend Integration

The project is ready to connect to the .NET 8 Web API backend:

1. Copy `.env.local.example` to `.env.local`
2. Update `NEXT_PUBLIC_API_URL` with your backend URL
3. API client utilities are ready in `src/lib/` (to be implemented)

### Expected Backend Endpoints
- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/campaigns`
- `GET /api/prospects`
- `GET /api/mailbox/messages`
- `GET /api/dashboard/stats`

## 🎭 Animations

Framer Motion animations include:
- Page transitions
- Card hover effects
- Float animations for decorative elements
- Smooth state transitions
- Staggered list animations

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Adaptive grid layouts
- Touch-friendly interactions

## 🎨 Color Palette

```
Sky Blue Shades:
- sky-50:  #f0f9ff (Background)
- sky-100: #e0f2fe (Background gradient)
- sky-500: #0ea5e9 (Primary buttons)
- sky-600: #0284c7 (Hover states)

Slate Shades (Text):
- slate-500: #64748b
- slate-600: #475569
- slate-700: #334155
- slate-800: #1e293b
```

## 🚧 Future Enhancements

- [ ] Add Mailbox page
- [ ] Implement real API integration
- [ ] Add campaign creation wizard
- [ ] Email template builder
- [ ] Advanced analytics dashboard
- [ ] WebSocket for real-time updates
- [ ] Dark mode support

## 📝 TypeScript Types

All types mirror the .NET backend DTOs:
- `User` / `UserProfile`
- `Campaign` / `CampaignStep`
- `Company` / `Contact`
- `MailboxMessage`
- `UserCompanyMatch`
- `DashboardStats`

## 🔒 Password Validation Rules

Registration enforces:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

Matches backend `RegisterUserCommandValidator` requirements.

## 📄 License

This project is part of the Recchx platform.

## 👨‍💻 Author

Built for Recchx - AI-Powered Cold Email Outreach Platform

---

**Note**: This is a frontend visualization with mock data. Connect to the .NET 8 Web API backend for full functionality.
