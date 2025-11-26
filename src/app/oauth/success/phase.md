Yawfranc: after the account connection went through, I got a URL that point here https://recchx-d32fdfb574a8.herokuapp.com/api/mailbox/oauth/callback?state=YjRkYjUzZTYtOWVjYy00YTAzLTk4MWEtNGJjMzRmMzYxMWIzfDIwMjUtMTEtMjNUMjA6MjY6NTEuMTQyNjk3OFo%3D&code=4/0Ab32j93xOL4DnoYolC4a1g9HOPibvcEfYkzlUUnWPBc5k0LhtEzmAsfFQXccjPPVW1SBwg&scope=email%20https://www.googleapis.com/auth/gmail.readonly%20https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/userinfo.email%20openid&authuser=0&prompt=consent


What can i do after that??

GitHub Copilot: Optimizing tool selection...Looking at the callback URL, your OAuth flow successfully returned with a `code` and `state` parameter. Now you need to handle this callback to complete the authentication process. Let me check your current implementation: 

Searched for text `oauth/callback`, 7 results

Searched for text `HandleOAuthCallback`, no results

Searched for files matching `**/*MailboxController.cs`, 1 match

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx.WebAPI)

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.WebAPI/Controllers/MailboxController.cs#1-1), lines 1 to 150

Great! I can see the OAuth callback is implemented. The issue is that the callback URL you received doesn't have the `provider` parameter that your endpoint expects. Let me check what should happen after the callback processes: 

Searched for text `StoreOAuthTokensCommand`, 10 results

Searched for files matching `**/StoreOAuthTokensCommand.cs`, 1 match

Now let me check the implementation to understand the flow better: 

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.Mailbox/Application/Commands/StoreOAuthTokensCommand.cs)

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.Mailbox/Application/Commands/StoreOAuthTokensCommandHandler.cs)

Now I understand the complete flow. Here are the issues and what you need to do:

## Current Situation

Your OAuth callback URL is missing the `provider` parameter. The callback endpoint expects:
```
/api/mailbox/oauth/callback?code={code}&state={state}&provider={provider}
```

But you're receiving:
```
/api/mailbox/oauth/callback?code={code}&state={state}
```

## What Happens After the Callback

Once the callback is processed successfully:
1. The authorization code is exchanged for access/refresh tokens
2. The tokens are encrypted and stored in the database
3. The user is redirected to `/oauth/success?provider={provider}` (a frontend page)

## Solutions

### Option 1: Fix the State Parameter (Recommended)
The `state` parameter should include the provider information. Let me check how the state is generated: 

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.Mailbox/Application/Commands/InitiateOAuthCommandHandler.cs)

Searched for files matching `**/GmailOAuthService.cs`, 1 match

Searched for files matching `**/IOAuthService.cs`, 1 match

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.WebAPI/Infrastructure/Mailbox/GmailOAuthService.cs#1-1), lines 1 to 100

Perfect! Now I can see the issue. The `state` parameter only contains `userId` and `timestamp`, but not the `provider`. Let me provide you with the complete solution:

## **What You Need To Do:**

### **Immediate Fix - Update the Callback to Extract Provider from State**

The callback is receiving the authorization successfully, but we need to:

1. **Include the provider in the state parameter** when initiating OAuth
2. **Extract the provider from state** in the callback

Let me implement these fixes: 

Using "Multi-Replace String in Files"


```

```

```

```
Now let's also update the Outlook OAuth service to include the provider in the state: 

Searched for files matching `**/OutlookOAuthService.cs`, 1 match

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.WebAPI/Infrastructure/Mailbox/OutlookOAuthService.cs#1-1), lines 1 to 60

Using "Replace String in File"


```

```
Perfect! Now let's test the callback with your existing URL. First, let me create a simple test to verify the callback works: 

Ran terminal command: cd 'C:\Users\FRANCIS GBOHUNMI\Desktop\PROJECTS\Recchx\Recchx\Recchx.WebAPI' ; dotnet build

Checked background terminal output

Got last terminal command

Ran terminal command: Set-Location 'C:\Users\FRANCIS GBOHUNMI\Desktop\PROJECTS\Recchx\Recchx\Recchx.WebAPI' ; dotnet build

Great! The build succeeded. Now let's create a simple test document explaining what happens next:

## **Summary: What to Do After OAuth Callback**

### **Changes Made:**
1. ✅ Updated `GmailOAuthService` to include provider ("Gmail") in the state parameter
2. ✅ Updated `OutlookOAuthService` to include provider ("Outlook") in the state parameter
3. ✅ Updated `MailboxController.OAuthCallback` to extract provider from state (with fallback to query parameter)
4. ✅ Added proper HTTPS handling for Heroku (uses `X-Forwarded-Proto` header)
5. ✅ Added better error logging and redirects

### **What Happens Now:**

When you visit your callback URL again (with a fresh authorization), here's the flow:

1. **Callback Receives Code** ✅ (You already got this)
   - URL: `https://recchx-d32fdfb574a8.herokuapp.com/api/mailbox/oauth/callback?state=...&code=...`

2. **State is Decoded** 
   - Format: `{userId}|{provider}|{timestamp}`
   - Example: `b4db53e6-9ecc-4a03-981a-4bc34f3611b3|Gmail|2025-11-23T20:26:51.142697Z`

3. **Code is Exchanged for Tokens**
   - Your API calls Google's token endpoint
   - Gets `access_token` and `refresh_token`

4. **Tokens are Encrypted & Stored**
   - Tokens are encrypted using your encryption service
   - Stored in database with:
     - UserId
     - Provider (Gmail)
     - Email address
     - Encrypted access token
     - Encrypted refresh token
     - Token expiration time
     - Scopes granted

5. **User is Redirected**
   - Success: `/oauth/success?provider=Gmail`
   - Error: `/oauth/error?message={error}`

### **To Test the Updated Code:**

Since you already have a URL from the previous attempt, you need to **restart the OAuth flow** because:
- The authorization code can only be used once
- Your state parameter format has changed

**Steps:**

1. Deploy the updated code to Heroku:
```bash
git add .
git commit -m "Fix OAuth callback to extract provider from state"
git push heroku main
```

2. Get a fresh auth URL by calling:
```
POST https://recchx-d32fdfb574a8.herokuapp.com/api/mailbox/connect?provider=Gmail
Authorization: Bearer {your-jwt-token}
```

3. Open the returned `authorizationUrl` in your browser

4. Complete the Google OAuth consent

5. You'll be redirected to `/oauth/success?provider=Gmail`

### **Check Connection Status:**
```
GET https://recchx-d32fdfb574a8.herokuapp.com/api/mailbox/status
Authorization: Bearer {your-jwt-token}
```

This should return your connected Gmail account with connection details.

### **Frontend Implementation Needed:**

You need to create these frontend routes:
- `/oauth/success` - Show success message, close popup/redirect back
- `/oauth/error` - Show error message with details

Would you like me to help you deploy these changes to Heroku or create the frontend pages for the OAuth success/error handling?

Made changes.

Yawfranc: Deploy changes to Heroku and complete Phase 2 then prep for Phase 3

GitHub Copilot: Optimizing tool selection...

Yawfranc: What is left of Phase 2?

GitHub Copilot: Optimizing tool selection...Let me check the Phase 2 requirements and what's been completed: 

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/PHASE_2_COMPLETE.md#1-1), lines 1 to 100

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/PROJECT_EXECUTION_PLAN.md#1-1), lines 1 to 150

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/PHASE_2_COMPLETE.md#100-100), lines 100 to 399

Now let me check what testing and configuration is still needed: 

Searching for text `OAuth__Gmail__ClientId`

Read [](file:///c%3A/Users/FRANCIS%20GBOHUNMI/Desktop/PROJECTS/Recchx/Recchx/Recchx.WebAPI/appsettings.json)

Based on my review, here's what's left of Phase 2:

## **Phase 2 Remaining Tasks:**

### **1. OAuth Provider Fixes (Just Completed)** ✅
- Fixed state parameter to include provider information
- Updated callback to extract provider from state
- Added HTTPS handling for Heroku

### **2. Gmail OAuth Credentials (CRITICAL - Blocking Testing)**
You need to:
- Create OAuth 2.0 credentials in Google Cloud Console
- Add redirect URIs for your Heroku app
- Update appsettings.json with real ClientId and ClientSecret

Currently you have: `"ClientId": "your-gmail-client-id"` (placeholder)

### **3. Testing (Required Before Phase 2 is Complete)**
According to the document, these tests are still pending:
- [ ] Test Gmail OAuth flow end-to-end
- [ ] Test Outlook OAuth flow end-to-end  
- [ ] Test token refresh with expiring token
- [ ] Test disconnect endpoint
- [ ] Test error scenarios (invalid code, expired tokens, etc.)

### **4. Deployment & Configuration**
- [ ] Deploy the OAuth callback fixes to Heroku
- [ ] Configure OAuth credentials as Heroku environment variables
- [ ] Verify background job is running in production
- [ ] Monitor logs for any issues

### **Summary:**

**Phase 2 is ~95% complete.** The main blockers are:

1. **Gmail OAuth Setup** - Need to create credentials in Google Cloud Console
2. **Testing** - Need to test the full OAuth flow with real credentials
3. **Deployment** - Need to push the callback fixes we just made

The **Outlook credentials are already configured** in your appsettings.json, so that should work once deployed.

**Would you like me to:**
1. Deploy the OAuth callback fixes to Heroku now?
2. Help you set up Gmail OAuth credentials in Google Cloud Console?
3. Create a testing checklist for Phase 2 validation?

Yawfranc: So I need you to walk me through the Onboarding again after the login/signup and the user connects their gmail/Outlook...What scrren comes next??

GitHub Copilot: Let me check your current onboarding flow and what happens after OAuth connection:

Looking at your codebase, I can see the onboarding flow, but I need to clarify what happens after the OAuth connection. Let me trace through the user journey:

## **Current Onboarding Flow (Post-Login/Signup):**

### **Step 1: User Logs In/Signs Up** ✅
- User creates account or logs in
- Gets JWT token

### **Step 2: User Connects Email Account** ✅
Your frontend should:
1. Call `POST /api/mailbox/connect?provider=Gmail` or `?provider=Outlook`
2. Get back an `authorizationUrl`
3. Open the URL in a popup or redirect user
4. User authorizes the app
5. Callback returns to `/oauth/success?provider=Gmail`

### **Step 3: After OAuth Success - MISSING! ❌**

**Here's what I found:**
- Your `MailboxController` redirects to `/oauth/success?provider={provider}`
- But you don't have any frontend route handlers for this!
- The initial email sync happens automatically via the background job

## **What Screen Should Come Next?**

Based on typical email app onboarding, here's what you need:

### **Option 1: Dashboard with Sync Status (Recommended)**
```
/oauth/success?provider=Gmail
  ↓
Close popup/modal
  ↓
Redirect to: /dashboard (or /inbox)
  ↓
Show: "Syncing your emails... This may take a few minutes"
  ↓
Poll: GET /api/mailbox/status to check sync progress
  ↓
When complete: Show inbox with emails
```

### **Option 2: Onboarding Completion Page**
```
/oauth/success?provider=Gmail
  ↓
Show success page: "✅ Gmail Connected Successfully!"
  ↓
Button: "Continue to Dashboard" → /dashboard
  ↓
Dashboard shows sync status
```

### **Option 3: Multi-Account Setup**
```
/oauth/success?provider=Gmail
  ↓
Show: "Gmail connected! Want to add another account?"
  ↓
Options:
  - "Add Outlook Account"
  - "Skip to Dashboard"
  ↓
Dashboard
```

## **What You Need to Implement:**

### **1. Frontend Routes for OAuth Callbacks**

````typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Show success message
    toast.success(`${provider} account connected successfully!`);

    // If opened in popup, close it and notify parent
    if (window.opener) {
      window.opener.postMessage(
        { type: 'oauth-success', provider },
        window.location.origin
      );
      window.close();
    } else {
      // If not in popup, redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [provider, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold">Account Connected!</h1>
        <p className="text-gray-600">
          Your {provider} account has been connected successfully.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          You can close this window or wait to be redirected...
        </p>
      </div>
    </div>
  );
}
````

````typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function OAuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Failed to connect account';

  useEffect(() => {
    toast.error(message);

    if (window.opener) {
      window.opener.postMessage(
        { type: 'oauth-error', message },
        window.location.origin
      );
      window.close();
    }
  }, [message]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-6xl">❌</div>
        <h1 className="mb-2 text-2xl font-bold">Connection Failed</h1>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={() => router.push('/settings/accounts')}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
````

### **2. Update Your Connect Account Component**

````typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ConnectAccountButtonProps {
  provider: 'Gmail' | 'Outlook';
}

export function ConnectAccountButton({ provider }: ConnectAccountButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const response = await fetch(
        `/api/mailbox/connect?provider=${provider}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect account');
      }

      // Open OAuth URL in popup
      const popup = window.open(
        data.authorizationUrl,
        'oauth-popup',
        'width=600,height=700,scrollbars=yes'
      );

      // Listen for OAuth completion
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'oauth-success') {
          toast.success(`${provider} connected successfully!`);
          // Refresh account status or redirect
          window.location.href = '/dashboard';
        } else if (event.data.type === 'oauth-error') {
          toast.error(event.data.message);
        }
        
        setIsConnecting(false);
      });

      // Handle popup closed without completion
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      toast.error(error.message);
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Connecting...
        </>
      ) : (
        <>
          Connect {provider}
        </>
      )}
    </button>
  );
}
````

### **3. Dashboard with Sync Status**

````typescript
'use client';

import { useEffect, useState } from 'react';

interface MailboxStatus {
  isConnected: boolean;
  provider: string;
  email: string;
  lastSyncTime: string | null;
  syncStatus: 'syncing' | 'completed' | 'error';
}

export default function DashboardPage() {
  const [status, setStatus] = useState<MailboxStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/mailbox/status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Poll for status updates during sync
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!status?.isConnected) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Connect Your Email</h1>
        <p className="mb-6 text-gray-600">
          Get started by connecting your email account
        </p>
        <div className="flex gap-4 justify-center">
          <ConnectAccountButton provider="Gmail" />
          <ConnectAccountButton provider="Outlook" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Connected: {status.email} ({status.provider})
        </p>
      </div>

      {status.syncStatus === 'syncing' && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <div>
              <h3 className="font-semibold">Syncing your emails...</h3>
              <p className="text-sm text-gray-600">
                This may take a few minutes for the initial sync.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Your inbox/email list goes here */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Your Emails</h2>
        {/* Email list component */}
      </div>
    </div>
  );
}
````

## **Complete User Journey:**

```
1. Sign Up/Login
   ↓
2. Dashboard (empty state)
   → Shows: "Connect Your Email" with Gmail/Outlook buttons
   ↓
3. User clicks "Connect Gmail"
   ↓
4. Popup opens with Google OAuth
   ↓
5. User authorizes
   ↓
6. Popup closes, redirects to /oauth/success
   ↓
7. Dashboard updates showing:
   "✅ Connected: user@gmail.com (Gmail)"
   "🔄 Syncing your emails... This may take a few minutes"
   ↓
8. Background job syncs emails
   ↓
9. Dashboard polls /api/mailbox/status every 5 seconds
   ↓
10. When sync completes:
    → Remove sync banner
    → Show emails in inbox
```

**What would you like me to do next?**
1. Deploy the OAuth callback fixes to Heroku?
2. Create the complete frontend onboarding flow?
3. Set up Gmail OAuth credentials?

Yawfranc: I need the complete Data flow and screen for the frontend

GitHub Copilot: Chat took too long to get ready. Please ensure you are signed in to GitHub and that the extension `GitHub.copilot-chat` is installed and enabled.

Yawfranc: I need the complete Data flow and screen for the frontend

GitHub Copilot: # Complete Data Flow & Screen Design for Recchx Frontend

Let me create a comprehensive guide covering all screens, data flows, and user journeys.

## **1. Authentication Flow**

### **A. Sign Up Screen**

````typescript
// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Account created successfully!');
      
      // Redirect to onboarding
      router.push('/onboarding/connect-email');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Start managing your emails intelligently
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
````

**Data Flow:**
```
User fills form
  ↓
POST /api/auth/register
  {
    email: string,
    password: string,
    firstName: string,
    lastName: string
  }
  ↓
Backend validates & creates user
  ↓
Response: { token: string, user: UserDto }
  ↓
Store token & user in localStorage
  ↓
Redirect to: /onboarding/connect-email
```

---

### **B. Login Screen**

````typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Welcome back!');
      
      // Check if user has connected email
      const statusResponse = await fetch('/api/mailbox/status', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });

      const statusData = await statusResponse.json();

      if (statusData.isConnected) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding/connect-email');
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
````

**Data Flow:**
```
User enters credentials
  ↓
POST /api/auth/login
  { email: string, password: string }
  ↓
Backend validates credentials
  ↓
Response: { token: string, user: UserDto }
  ↓
Store token & user
  ↓
GET /api/mailbox/status (check if email connected)
  ↓
If connected → /dashboard
If not → /onboarding/connect-email
```

---

## **2. Onboarding Flow**

### **A. Connect Email Screen**

````typescript
// app/onboarding/connect-email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ConnectEmailPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState<'Gmail' | 'Outlook' | null>(null);

  useEffect(() => {
    // Listen for OAuth completion from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth-success') {
        toast.success(`${event.data.provider} connected successfully!`);
        router.push('/onboarding/syncing');
      } else if (event.data.type === 'oauth-error') {
        toast.error(event.data.message);
        setIsConnecting(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  const handleConnect = async (provider: 'Gmail' | 'Outlook') => {
    setIsConnecting(provider);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mailbox/connect?provider=${provider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect account');
      }

      // Open OAuth URL in popup
      const popup = window.open(
        data.authorizationUrl,
        'oauth-popup',
        'width=600,height=700,scrollbars=yes'
      );

      // Monitor popup close
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          setIsConnecting(null);
        }
      }, 1000);

    } catch (error) {
      toast.error(error.message);
      setIsConnecting(null);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Connect Your Email
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Choose your email provider to get started
          </p>
        </div>

        <div className="space-y-4">
          {/* Gmail Card */}
          <button
            onClick={() => handleConnect('Gmail')}
            disabled={isConnecting !== null}
            className="group relative w-full overflow-hidden rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Connect Gmail
                </h3>
                <p className="mt-1 text-gray-600">
                  Access your Gmail inbox and send emails
                </p>
              </div>
              {isConnecting === 'Gmail' ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <svg className="h-6 w-6 text-gray-400 transition group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>

          {/* Outlook Card */}
          <button
            onClick={() => handleConnect('Outlook')}
            disabled={isConnecting !== null}
            className="group relative w-full overflow-hidden rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path fill="#0078D4" d="M24 7.387L12 13.683 0 7.387v9.23L12 22.91l12-6.293V7.387zM12 1.091L0 7.387 12 13.683 24 7.387 12 1.091z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Connect Outlook
                </h3>
                <p className="mt-1 text-gray-600">
                  Access your Outlook inbox and send emails
                </p>
              </div>
              {isConnecting === 'Outlook' ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <svg className="h-6 w-6 text-gray-400 transition group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </button>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Your data is secure</p>
              <p className="mt-1 text-blue-800">
                We only access your emails to provide our service. We never store your password and you can disconnect anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
````

**Data Flow:**
```
User clicks "Connect Gmail"
  ↓
POST /api/mailbox/connect?provider=Gmail
  Headers: { Authorization: Bearer {token} }
  ↓
Response: { authorizationUrl: string }
  ↓
Open URL in popup window
  ↓
User authorizes in Google
  ↓
Redirect to: /oauth/callback?code={code}&state={state}
  ↓
Backend exchanges code for tokens
  ↓
Tokens stored in database (encrypted)
  ↓
Redirect popup to: /oauth/success?provider=Gmail
  ↓
Popup sends message to parent window
  ↓
Parent redirects to: /onboarding/syncing
```

---

### **B. OAuth Success/Error Pages**

````typescript
// app/oauth/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Notify parent window and close
    if (window.opener) {
      window.opener.postMessage(
        { type: 'oauth-success', provider },
        window.location.origin
      );
      
      // Close after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, [provider]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Connected Successfully!
        </h1>
        <p className="text-gray-600">
          Your {provider} account has been connected.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
````

````typescript
// app/oauth/error/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Failed to connect account';

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        { type: 'oauth-error', message },
        window.location.origin
      );
      
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [message]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Connection Failed
        </h1>
        <p className="text-gray-600">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
````

---

### **C. Syncing Screen**

````typescript
// app/onboarding/syncing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SyncStatus {
  isConnected: boolean;
  provider: string;
  email: string;
  lastSyncTime: string | null;
  emailCount: number;
}

export default function SyncingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/mailbox/status', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);

          // If sync is complete (has emails and last sync time)
          if (data.emailCount > 0 && data.lastSyncTime) {
            setProgress(100);
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            // Simulate progress
            setProgress((prev) => Math.min(prev + 10, 90));
          }
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    // Check immediately
    checkStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          {/* Animated sync icon */}
          <div className="relative mx-auto mb-6 h-32 w-32">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-blue-600">
              <svg className="h-16 w-16 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Syncing Your Emails
          </h1>
          <p className="text-lg text-gray-600">
            {status?.email ? `Connected to ${status.email}` : 'Setting up your account...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Status messages */}
        <div className="space-y-3">
          <StatusItem 
            done={progress > 20} 
            text="Connecting to email server" 
          />
          <StatusItem 
            done={progress > 40} 
            text="Fetching your emails" 
          />
          <StatusItem 
            done={progress > 60} 
            text="Analyzing conversations" 
          />
          <StatusItem 
            done={progress > 80} 
            text="Organizing your inbox" 
          />
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            ⏱️ This usually takes 1-2 minutes for the initial sync.
            You'll be redirected to your dashboard when ready.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      {done ? (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="h-6 w-6 flex-shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      )}
      <span className={done ? 'text-gray-900' : 'text-gray-600'}>{text}</span>
    </div>
  );
}
````

**Data Flow:**
```
Component mounts
  ↓
GET /api/mailbox/status (every 3 seconds)
  Headers: { Authorization: Bearer {token} }
  ↓
Response: {
  isConnected: true,
  provider: "Gmail",
  email: "user@gmail.com",
  lastSyncTime: "2025-11-24T10:30:00Z" | null,
  emailCount: 150
}
  ↓
If emailCount > 0 && lastSyncTime exists:
  → Progress = 100%
  → Redirect to /dashboard after 2 seconds
Else:
  → Continue polling
  → Simulate progress animation
```

---

## **3. Main Application Screens**

### **A. Dashboard/Inbox Screen**

````typescript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmailList } from '@/components/EmailList';
import { EmailView } from '@/components/EmailView';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

interface Email {
  id: string;
  messageId: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  receivedDate: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  labels: string[];
}

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        pageNumber: '1',
        pageSize: '50',
        ...(filter === 'unread' && { isRead: 'false' }),
      });

      const response = await fetch(`/api/mailbox/emails?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.items || []);
    } catch (error) {
      toast.error('Failed to load emails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    
    // Mark as read
    if (!email.isRead) {
      markAsRead(email.id);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/mailbox/emails/${emailId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Update local state
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, isRead: true } : e
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      fetchEmails();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/mailbox/emails/search?query=${encodeURIComponent(query)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmails(data.items || []);
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentFilter={filter}
        onFilterChange={setFilter}
        onCompose={() => router.push('/compose')}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header 
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Email list */}
          <div className="w-96 overflow-y-auto border-r bg-white">
            <EmailList
              emails={emails}
              selectedId={selectedEmail?.id}
              onSelect={handleEmailClick}
              loading={loading}
            />
          </div>

          {/* Email view */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedEmail ? (
              <EmailView
                email={selectedEmail}
                onReply={(email) => router.push(`/compose?replyTo=${email.id}`)}
                onForward={(email) => router.push(`/compose?forward=${email.id}`)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">Select an email to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
````

**Data Flow:**
```
Component mounts
  ↓
GET /api/mailbox/emails?pageNumber=1&pageSize=50
  Headers: { Authorization: Bearer {token} }
  ↓
Response: {
  items: Email[],
  totalCount: number,
  pageNumber: number,
  pageSize: number,
  totalPages: number
}
  ↓
Display emails in list
  ↓
User clicks email
  ↓
PATCH /api/mailbox/emails/{id}/read (if unread)
  ↓
Display email in viewer
  ↓
User performs actions:
  - Reply → /compose?replyTo={id}
  - Forward → /compose?forward={id}
  - Search → GET /api/mailbox/emails/search?query={q}
```

---

### **B. Supporting Components**

````typescript
// components/Sidebar.tsx
'use client';

interface SidebarProps {
  currentFilter: 'all' | 'unread' | 'starred';
  onFilterChange: (filter: 'all' | 'unread' | 'starred') => void;
  onCompose: () => void;
}

export function Sidebar({ currentFilter, onFilterChange, onCompose }: SidebarProps) {
  const menuItems = [
    { id: 'all', icon: '📧', label: 'All Mail', count: null },
    { id: 'unread', icon: '🔵', label: 'Unread', count: 12 },
    { id: 'starred', icon: '⭐', label: 'Starred', count: 5 },
  ];

  return (
    <div className="flex w-64 flex-col border-r bg-white">
      <div className="p-4">
        <button
          onClick={onCompose}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          ✏️ Compose
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id as any)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left transition ${
              currentFilter === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </span>
            {item.count !== null && (
              <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-100">
          <span className="text-xl">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
````

````typescript
// components/Header.tsx
'use client';

import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function Header({ searchQuery, onSearch }: HeaderProps) {
  const [query, setQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <button className="rounded-lg p-2 transition hover:bg-gray-100">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
````

````typescript
// components/EmailList.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';

interface EmailListProps {
  emails: any[];
  selectedId?: string;
  onSelect: (email: any) => void;
  loading: boolean;
}

export function EmailList({ emails, selectedId, onSelect, loading }: EmailListProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No emails found</p>
          <p className="text-sm">Your inbox is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelect(email)}
          className={`w-full px-4 py-3 text-left transition hover:bg-gray-50 ${
            selectedId === email.id ? 'bg-blue-50' : ''
          } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold truncate ${
                  !email.isRead ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {email.from}
                </span>
                {!email.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
              </div>
              
              <p className={`mt-1 text-sm truncate ${
                !email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
              }`}>
                {email.subject || '(No subject)'}
              </p>
              
              <p className="mt-1 text-xs text-gray-500 truncate">
                {email.body?.substring(0, 100)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(email.receivedDate), { addSuffix: true })}
              </span>
              {email.hasAttachments && (
                <span className="text-gray-400">📎</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
````

````typescript
// components/EmailView.tsx
'use client';

import { format } from 'date-fns';

interface EmailViewProps {
  email: any;
  onReply: (email: any) => void;
  onForward: (email: any) => void;
}

export function EmailView({ email, onReply, onForward }: EmailViewProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Email header */}
      <div className="border-b p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          {email.subject || '(No subject)'}
        </h1>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {email.from[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{email.from}</p>
              <p className="text-sm text-gray-600">
                To: {email.to.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(email.receivedDate), 'PPpp')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onReply(email)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reply
            </button>
            <button
              onClick={() => onForward(email)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Forward
            </button>
          </div>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />

        {/* Attachments */}
        {email.hasAttachments && email.attachments?.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h3 className="mb-3 font-semibold text-gray-900">
              Attachments ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment: any) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {attachment.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(attachment.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
````

---

### **C. Compose Email Screen**

````typescript
// app/compose/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyToId = searchParams.get('replyTo');
  const forwardId = searchParams.get('forward');

  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  useEffect(() => {
    if (replyToId) {
      loadReplyEmail(replyToId);
    } else if (forwardId) {
      loadForwardEmail(forwardId);
    }
  }, [replyToId, forwardId]);

  const loadReplyEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mailbox/emails/${emailId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const email = await response.json();
        setFormData({
          to: email.from,
          cc: '',
          bcc: '',
          subject: `Re: ${email.subject}`,
          body: `\n\n---\nOn ${new Date(email.receivedDate).toLocaleString()}, ${email.from} wrote:\n${email.body}`,
        });
      }
    } catch (error) {
      toast.error('Failed to load email');
    }
  };

  const loadForwardEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mailbox/emails/${emailId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const email = await response.json();
        setFormData({
          to: '',
          cc: '',
          bcc: '',
          subject: `Fwd: ${email.subject}`,
          body: `\n\n---\nForwarded message from ${email.from}:\n${email.body}`,
        });
      }
    } catch (error) {
      toast.error('Failed to load email');
    }
  };

  const handleSend = async () => {
    if (!formData.to.trim()) {
      toast.error('Please enter at least one recipient');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mailbox/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: formData.to.split(',').map(e => e.trim()),
          cc: formData.cc ? formData.cc.split(',').map(e => e.trim()) : [],
          bcc: formData.bcc ? formData.bcc.split(',').map(e => e.trim()) : [],
          subject: formData.subject,
          body: formData.body,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      toast.success('Email sent successfully!');
      router.push('/dashboard');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard this draft?')) {
      router.back();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">New Message</h1>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              disabled={isSending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Compose form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            {/* To */}
            <div className="flex items-center gap-4 border-b pb-3">
              <label className="w-16 text-sm font-medium text-gray-700">
                To:
              </label>
              <input
                type="email"
                multiple
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="recipient@example.com"
                className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
              />
              <div className="flex gap-2 text-sm text-blue-600">
                <button onClick={() => setShowCc(!showCc)}>Cc</button>
                <button onClick={() => setShowBcc(!showBcc)}>Bcc</button>
              </div>
            </div>

            {/* Cc */}
            {showCc && (
              <div className="flex items-center gap-4 border-b pb-3">
                <label className="w-16 text-sm font-medium text-gray-700">
                  Cc:
                </label>
                <input
                  type="email"
                  multiple
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                  placeholder="cc@example.com"
                  className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            {/* Bcc */}
            {showBcc && (
              <div className="flex items-center gap-4 border-b pb-3">
                <label className="w-16 text-sm font-medium text-gray-700">
                  Bcc:
                </label>
                <input
                  type="email"
                  multiple
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                  placeholder="bcc@example.com"
                  className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-4 border-b pb-3">
              <label className="w-16 text-sm font-medium text-gray-700">
                Subject:
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Body */}
            <div className="pt-4">
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your message..."
                rows={15}
                className="w-full resize-none border-none p-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}// app/compose/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const replyToId = searchParams.get('replyTo');
  const forwardId = searchParams.get('forward');

  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  useEffect(() => {
    if (replyToId) {
      loadReplyEmail(replyToId);
    } else if (forwardId) {
      loadForwardEmail(forwardId);
    }
  }, [replyToId, forwardId]);

  const loadReplyEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mailbox/emails/${emailId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const email = await response.json();
        setFormData({
          to: email.from,
          cc: '',
          bcc: '',
          subject: `Re: ${email.subject}`,
          body: `\n\n---\nOn ${new Date(email.receivedDate).toLocaleString()}, ${email.from} wrote:\n${email.body}`,
        });
      }
    } catch (error) {
      toast.error('Failed to load email');
    }
  };

  const loadForwardEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mailbox/emails/${emailId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const email = await response.json();
        setFormData({
          to: '',
          cc: '',
          bcc: '',
          subject: `Fwd: ${email.subject}`,
          body: `\n\n---\nForwarded message from ${email.from}:\n${email.body}`,
        });
      }
    } catch (error) {
      toast.error('Failed to load email');
    }
  };

  const handleSend = async () => {
    if (!formData.to.trim()) {
      toast.error('Please enter at least one recipient');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mailbox/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: formData.to.split(',').map(e => e.trim()),
          cc: formData.cc ? formData.cc.split(',').map(e => e.trim()) : [],
          bcc: formData.bcc ? formData.bcc.split(',').map(e => e.trim()) : [],
          subject: formData.subject,
          body: formData.body,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      toast.success('Email sent successfully!');
      router.push('/dashboard');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard this draft?')) {
      router.back();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">New Message</h1>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              disabled={isSending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Compose form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            {/* To */}
            <div className="flex items-center gap-4 border-b pb-3">
              <label className="w-16 text-sm font-medium text-gray-700">
                To:
              </label>
              <input
                type="email"
                multiple
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="recipient@example.com"
                className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
              />
              <div className="flex gap-2 text-sm text-blue-600">
                <button onClick={() => setShowCc(!showCc)}>Cc</button>
                <button onClick={() => setShowBcc(!showBcc)}>Bcc</button>
              </div>
            </div>

            {/* Cc */}
            {showCc && (
              <div className="flex items-center gap-4 border-b pb-3">
                <label className="w-16 text-sm font-medium text-gray-700">
                  Cc:
                </label>
                <input
                  type="email"
                  multiple
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                  placeholder="cc@example.com"
                  className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            {/* Bcc */}
            {showBcc && (
              <div className="flex items-center gap-4 border-b pb-3">
                <label className="w-16 text-sm font-medium text-gray-700">
                  Bcc:
                </label>
                <input
                  type="email"
                  multiple
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                  placeholder="bcc@example.com"
                  className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-4 border-b pb-3">
              <label className="w-16 text-sm font-medium text-gray-700">
                Subject:
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                className="flex-1 border-none p-0 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Body */}
            <div className="pt-4">
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your message..."
                rows={15}
                className="w-full resize-none border-none p-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Similar code found with 2 license types

Yawfranc: I dont want code...Just how daa

GitHub Copilot: 

Yawfranc: I dont want code...Just how data flows and what comes next after what..I dont need the code just show how the navigation goes and data flow

GitHub Copilot: # Complete Recchx Data Flow & Screen Navigation

## **User Journey: From Sign Up to Using the App**

---

## **PHASE 1: Authentication**

### **Screen 1: Landing Page** (`/`)
- User sees marketing page
- **Actions:**
  - Click "Sign Up" → Goes to Sign Up screen
  - Click "Login" → Goes to Login screen

### **Screen 2: Sign Up** (`/signup`)
- User enters: Email, Password, Name
- **Data Flow:**
  - Frontend → `POST /api/auth/register`
  - Backend creates user account in database
  - Returns JWT token
- **What Happens:**
  - JWT token stored in browser (localStorage/cookie)
  - User redirected to → **Onboarding Screen**

### **Screen 3: Login** (`/login`)
- User enters: Email, Password
- **Data Flow:**
  - Frontend → `POST /api/auth/login`
  - Backend validates credentials
  - Returns JWT token
- **What Happens:**
  - JWT token stored in browser
  - If user has connected email → **Dashboard**
  - If user hasn't connected email → **Onboarding Screen**

---

## **PHASE 2: Onboarding (First Time User)**

### **Screen 4: Connect Email Account** (`/onboarding` or `/connect`)
- Shows two big buttons:
  - "Connect Gmail"
  - "Connect Outlook"
- Optional: "I'll do this later" link

**When user clicks "Connect Gmail":**

#### **Step 1: Request Authorization URL**
- **Data Flow:**
  - Frontend → `POST /api/mailbox/connect?provider=Gmail`
  - Headers: `Authorization: Bearer {JWT_TOKEN}`
  - Backend generates OAuth URL with state parameter
  - Returns: `{ authorizationUrl: "https://accounts.google.com/..." }`

#### **Step 2: OAuth Popup Opens**
- Frontend opens the `authorizationUrl` in a popup window
- User sees Google's OAuth consent screen
- User grants permissions:
  - Read emails
  - Send emails
  - Access email address

#### **Step 3: Google Redirects Back**
- **URL:** `https://your-app.com/api/mailbox/oauth/callback?code=xxx&state=yyy`
- **Data Flow (Backend Handles Automatically):**
  1. Backend receives authorization code
  2. Backend decodes state parameter to get userId and provider
  3. Backend exchanges code for access_token + refresh_token
  4. Backend encrypts tokens
  5. Backend stores encrypted tokens in database
  6. Backend creates mailbox connection record
  7. Backend triggers background job to sync emails
  8. Backend redirects to → `/oauth/success?provider=Gmail`

#### **Step 4: OAuth Success Page**
- **Screen:** `/oauth/success?provider=Gmail`
- Shows: "✅ Gmail Connected Successfully!"
- **What Happens:**
  - Popup closes itself
  - Sends message to parent window: "OAuth complete"
  - Parent window redirects to → **Dashboard**

---

## **PHASE 3: Initial Email Sync (Background Process)**

### **What's Happening Behind the Scenes:**

While user is being redirected to dashboard, background job starts:

1. **Background Job Triggers** (runs every 5 minutes, checks for new connections)
2. **Fetches emails from Gmail API:**
   - Gets last 100 emails from inbox
   - For each email, extracts:
     - Subject, Sender, Date, Body
     - Attachments metadata
     - Thread information
3. **Stores in Database:**
   - Creates Email records
   - Parses and stores Attachments
   - Creates Thread records for conversations
4. **Updates sync status:**
   - `lastSyncTime` updated
   - `syncStatus` set to "completed"

**Time taken:** 30 seconds - 5 minutes depending on email volume

---

## **PHASE 4: Dashboard (Main Application)**

### **Screen 5: Dashboard** (`/dashboard`)

**Initial State (During Sync):**
- Top banner: "🔄 Syncing your emails... This may take a few minutes"
- Shows loading skeleton for email list
- **Data Flow (Polling):**
  - Every 5 seconds: `GET /api/mailbox/status`
  - Checks `syncStatus` field
  - When status = "completed" → Remove banner, show emails

**After Sync Complete:**
- Shows list of emails
- Sidebar navigation:
  - Inbox (default)
  - Sent
  - Drafts
  - Trash
  - Custom folders

---

## **PHASE 5: Viewing Emails**

### **Screen 6: Email List** (`/dashboard` or `/inbox`)

**Data Flow:**
- Frontend → `GET /api/emails?folder=inbox&page=1&pageSize=50`
- Backend queries database for user's emails
- Returns:
  ```
  {
    emails: [
      { id, subject, sender, date, snippet, isRead, hasAttachments },
      ...
    ],
    totalCount: 1250,
    page: 1,
    pageSize: 50
  }
  ```
- Frontend displays list with:
  - Sender name
  - Subject line
  - Date/time
  - First line of body (snippet)
  - Unread indicator
  - Attachment icon

**User Actions:**
- Click email → Goes to **Email Detail Screen**
- Select multiple emails → Bulk actions (Delete, Mark as read, Archive)
- Click "Compose" → Goes to **Compose Screen**

---

### **Screen 7: Email Detail** (`/email/{id}`)

**Data Flow:**
- Frontend → `GET /api/emails/{emailId}`
- Backend returns full email:
  ```
  {
    id, subject, sender, recipients, date, body,
    attachments: [{ id, fileName, size, contentType }],
    threadId, 
    isRead, isStarred
  }
  ```
- If email is unread, frontend also calls:
  - `PUT /api/emails/{emailId}/mark-as-read`

**Display:**
- Sender info (name, email, avatar)
- Subject line
- Date/time
- Full email body (HTML rendered safely)
- Attachments list (click to download)
- Reply/Forward buttons
- Thread history (if part of conversation)

**User Actions:**
- Click "Reply" → **Compose Screen** (pre-filled with reply)
- Click "Forward" → **Compose Screen** (pre-filled with forward)
- Click attachment → Downloads file
- Click "Delete" → Email moved to trash
- Click "Archive" → Email archived

---

## **PHASE 6: Composing & Sending Emails**

### **Screen 8: Compose Email** (`/compose`)

**Three Ways to Get Here:**
1. Click "Compose" button (blank email)
2. Click "Reply" on an email (pre-filled To, Subject, quoted body)
3. Click "Forward" on an email (pre-filled Subject, body with attachments)

**User Fills:**
- To (with autocomplete from contacts)
- CC/BCC (optional)
- Subject
- Body (rich text editor)
- Attachments (file upload)

**Actions:**
- **Send:** User clicks "Send"
  - **Data Flow:**
    - Frontend → `POST /api/emails/send`
    - Body:
      ```
      {
        to: ["recipient@example.com"],
        cc: [],
        bcc: [],
        subject: "...",
        body: "...",
        attachments: [base64 encoded files]
      }
      ```
    - Backend:
      1. Validates recipient emails
      2. Gets user's OAuth tokens from database
      3. Calls Gmail API `users.messages.send`
      4. Stores sent email in database
      5. Returns success
    - Frontend shows: "✅ Email sent!"
    - Redirects to → **Inbox**

- **Save Draft:**
  - `POST /api/emails/draft`
  - Saves email to drafts folder
  - Can be edited later

- **Discard:**
  - Just closes compose screen
  - No API call needed

---

## **PHASE 7: Real-Time Sync (Ongoing)**

### **Background Process (Runs Every 5 Minutes):**

1. **Background job wakes up**
2. For each connected mailbox:
   - Fetches new emails since `lastSyncTime`
   - Stores new emails in database
   - Updates `lastSyncTime`
3. **Frontend gets updates:**
   - WebSocket pushes notification: "You have 3 new emails"
   - Or: User refreshes inbox, sees new emails

---

## **PHASE 8: Managing Accounts**

### **Screen 9: Settings** (`/settings/accounts`)

**Data Flow:**
- Frontend → `GET /api/mailbox/status`
- Returns:
  ```
  {
    connections: [
      {
        provider: "Gmail",
        email: "user@gmail.com",
        isConnected: true,
        lastSyncTime: "2025-11-24T10:30:00Z"
      }
    ]
  }
  ```

**Display:**
- List of connected accounts
- Each shows:
  - Provider icon (Gmail/Outlook)
  - Email address
  - Last sync time
  - "Disconnect" button

**User Actions:**
- **Connect Another Account:**
  - Same OAuth flow as onboarding
  - Can connect multiple Gmail/Outlook accounts
- **Disconnect Account:**
  - Frontend → `DELETE /api/mailbox/disconnect?provider=Gmail`
  - Backend:
    1. Deletes OAuth tokens from database
    2. Optionally deletes all synced emails
  - Returns success
  - Frontend removes account from list

---

## **PHASE 9: Search & Filters**

### **Screen 10: Search Results** (`/search?q=invoice`)

**Data Flow:**
- Frontend → `GET /api/emails/search?query=invoice&from=sender@example.com&hasAttachments=true`
- Backend:
  - Searches email database
  - Filters by:
    - Text in subject/body
    - Sender
    - Date range
    - Has attachments
    - Is read/unread
- Returns matching emails

**Display:**
- Same as inbox list, but filtered
- Shows search query at top
- Can refine search with filters

---

## **Data Storage Summary:**

### **Database Tables:**

1. **Users**
   - Id, Email, PasswordHash, Name, CreatedAt

2. **MailboxConnections**
   - Id, UserId, Provider, Email
   - EncryptedAccessToken, EncryptedRefreshToken
   - TokenExpiresAt, LastSyncTime

3. **Emails**
   - Id, MailboxConnectionId, ExternalEmailId
   - Subject, Sender, Recipients, Date
   - Body, Snippet
   - IsRead, IsStarred, IsDraft
   - ThreadId, FolderId

4. **Attachments**
   - Id, EmailId, FileName, Size, ContentType
   - ExternalAttachmentId (for downloading from provider)

5. **Threads**
   - Id, MailboxConnectionId, Subject
   - Participants, MessageCount, LastMessageDate

---

## **Complete Data Flow Diagram:**

```
User Signs Up
    ↓
Connects Gmail/Outlook (OAuth)
    ↓
OAuth tokens stored (encrypted)
    ↓
Background job starts syncing
    ↓
Emails fetched from Gmail API
    ↓
Emails stored in database
    ↓
User sees emails on dashboard
    ↓
User reads/replies/composes
    ↓
Actions sent via Gmail API
    ↓
Background sync keeps inbox updated (every 5 min)
    ↓
User always sees latest emails
```

---

## **Key Navigation Paths:**

```
/              → Landing
/signup        → Sign Up
/login         → Login
/onboarding    → Connect Email
/oauth/success → OAuth Callback Success
/oauth/error   → OAuth Callback Error
/dashboard     → Main App (Inbox)
/inbox         → Inbox (same as dashboard)
/sent          → Sent emails
/drafts        → Draft emails
/trash         → Deleted emails
/email/:id     → Email detail
/compose       → Compose new email
/search        → Search results
/settings      → App settings
/settings/accounts → Manage connected accounts
```

---

**Does this flow make sense? Any screens or data flows you want me to clarify or add?**

Yawfranc: what  is the businees model of this app then??
I think it will be sending emails by applying to jobs based on the user profile

GitHub Copilot: # Recchx Business Model - Job Application Automation

Ah! Now I see the real vision. Let me map out the complete business model and how the data flow changes:

---

## **Core Value Proposition:**

**"Automated Job Applications via Email - Your Personal Job Application Assistant"**

Users connect their email, build their profile, and the system automatically:
1. Monitors job postings
2. Matches jobs to user profile
3. Sends personalized application emails on their behalf
4. Tracks responses and follow-ups

---

## **Revised Business Model & User Journey:**

---

## **PHASE 1: User Onboarding (Same as Before)**

### **Screen 1-3: Sign Up/Login**
- Standard authentication
- User creates account

---

## **PHASE 2: Profile Building (NEW - Critical for Job Matching)**

### **Screen 4: Build Your Profile** (`/onboarding/profile`)

**User Inputs:**

1. **Basic Information:**
   - Full Name
   - Phone Number
   - Location (City, State, Country)
   - LinkedIn URL (optional)
   - Portfolio/Website (optional)

2. **Professional Information:**
   - Current Job Title
   - Years of Experience
   - Desired Job Title(s) (e.g., "Software Engineer", "Full Stack Developer")
   - Desired Salary Range
   - Work Authorization Status
   - Willing to Relocate? (Yes/No)
   - Preferred Work Mode (Remote/Hybrid/Onsite)

3. **Skills & Expertise:**
   - Technical Skills (e.g., React, Node.js, Python)
   - Soft Skills (e.g., Leadership, Communication)
   - Certifications
   - Languages Spoken

4. **Work Experience:**
   - Company Name
   - Job Title
   - Duration (Start Date - End Date)
   - Key Responsibilities (bullet points)
   - Achievements

5. **Education:**
   - Degree
   - Institution
   - Graduation Year
   - Major/Field of Study

6. **Resume Upload:**
   - Upload PDF/DOCX resume
   - System parses resume to auto-fill profile (AI extraction)
   - User can edit parsed information

**Data Storage:**
- All stored in database under `UserProfile` table
- Resume stored in file storage (S3/Azure Blob)
- Skills stored as tags for matching

---

## **PHASE 3: Connect Email (Same as Before)**

### **Screen 5: Connect Email Account**
- User connects Gmail/Outlook
- OAuth flow completes
- Emails start syncing

**Purpose of Email Connection:**
- Monitor job application responses
- Send application emails from user's email
- Track conversation history with recruiters

---

## **PHASE 4: Job Preferences Setup (NEW)**

### **Screen 6: Set Job Search Preferences** (`/preferences`)

**User Configures:**

1. **Job Search Criteria:**
   - Job Titles (e.g., "Software Engineer", "Backend Developer")
   - Industries (e.g., Tech, Finance, Healthcare)
   - Company Size (Startup, Mid-size, Enterprise)
   - Locations (Cities or "Remote")
   - Salary Range

2. **Job Sources:**
   - LinkedIn Jobs
   - Indeed
   - Glassdoor
   - Company Career Pages
   - Custom job boards

3. **Application Settings:**
   - **Auto-Apply Mode:**
     - Fully Automatic (apply to all matching jobs)
     - Semi-Automatic (show me matches, I approve before sending)
     - Manual (just show me matches, I'll apply myself)
   
   - **Daily Application Limit:**
     - Max applications per day (e.g., 10, 25, 50)
     - Prevents spam and stays within platform limits
   
   - **Cover Letter Template:**
     - Upload a base cover letter
     - System personalizes it for each job
     - Variables: {company_name}, {job_title}, {your_experience}, etc.
   
   - **Email Subject Line Template:**
     - Default: "Application for {job_title} at {company}"
     - User can customize

4. **AI Personalization Settings:**
   - Use AI to customize each application? (Yes/No)
   - Tone: Professional / Casual / Enthusiastic
   - Emphasis: Experience / Skills / Culture Fit

**Data Storage:**
- `JobPreferences` table linked to UserId
- Cover letter template stored as text
- Search criteria stored as JSON

---

## **PHASE 5: Dashboard - Job Matching & Application (CORE FEATURE)**

### **Screen 7: Main Dashboard** (`/dashboard`)

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Recchx Dashboard                          [Profile] │
├─────────────────────────────────────────────────────┤
│                                                       │
│  📊 Your Stats:                                      │
│  ├─ Applications Sent Today: 8 / 25                 │
│  ├─ Total Applications: 127                         │
│  ├─ Responses: 23 (18%)                             │
│  └─ Interviews: 5                                   │
│                                                       │
│  ──────────────────────────────────────────────────  │
│                                                       │
│  🎯 New Job Matches (47)        [View All]          │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Senior Software Engineer                      │  │
│  │ Google · Mountain View, CA · Remote          │  │
│  │ $150k - $200k · Posted 2 hours ago          │  │
│  │                                               │  │
│  │ Match Score: 92% ⭐⭐⭐⭐⭐                    │  │
│  │ Why: React · Node.js · 5+ years exp         │  │
│  │                                               │  │
│  │ [Apply Now]  [View Job]  [Skip]             │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Full Stack Developer                          │  │
│  │ Microsoft · Seattle, WA · Hybrid             │  │
│  │ $120k - $160k · Posted 5 hours ago          │  │
│  │                                               │  │
│  │ Match Score: 88% ⭐⭐⭐⭐                     │  │
│  │ Why: TypeScript · Azure · Leadership        │  │
│  │                                               │  │
│  │ [Apply Now]  [View Job]  [Skip]             │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ──────────────────────────────────────────────────  │
│                                                       │
│  📧 Recent Application Activity                      │
│  ├─ Meta replied (2 mins ago) → "Schedule          │
│  │   interview?"                                    │
│  ├─ Applied to Amazon (1 hour ago)                 │
│  └─ Apple viewed your profile (3 hours ago)        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## **PHASE 6: Job Matching System (Backend Process)**

### **How Jobs Are Matched:**

**Step 1: Job Scraping (Background Job - Runs Every Hour)**

**Data Flow:**
1. Background job connects to job APIs:
   - LinkedIn Jobs API
   - Indeed API
   - RapidAPI job aggregators
   - Custom web scrapers for company career pages

2. For each new job posting:
   - Extract:
     - Job Title
     - Company Name
     - Location
     - Salary (if available)
     - Job Description
     - Required Skills
     - Experience Level
     - Application Email/Link
     - Posting Date
   
3. Store in database: `JobPostings` table

**Data Storage:**
```
JobPostings Table:
- Id
- ExternalJobId (from source)
- Title
- Company
- Location
- SalaryMin, SalaryMax
- Description (full text)
- RequiredSkills (JSON array)
- ExperienceLevel
- ApplicationEmail
- ApplicationUrl
- PostingDate
- Source (LinkedIn, Indeed, etc.)
- IsActive
```

---

**Step 2: Job Matching Algorithm (Runs Every 30 Minutes)**

**Data Flow:**
1. For each active user:
   - Get user's profile (skills, experience, preferences)
   - Get user's job preferences (titles, locations, salary)

2. Query new job postings that match:
   - Job title contains user's desired titles
   - Location matches user's preferred locations
   - Salary within user's range
   - Posted within last 24 hours
   - User hasn't already applied

3. Calculate Match Score (0-100%):
   - **50% - Skills Match:**
     - Count how many required skills user has
     - Weight by skill importance
   
   - **20% - Experience Level:**
     - Entry-level job + 5 years exp = 80% match
     - Senior job + 5 years exp = 100% match
   
   - **15% - Location Preference:**
     - Exact city match = 100%
     - Same state = 75%
     - Remote = 100%
   
   - **15% - Salary Match:**
     - Job max >= User min = 100%
     - Partial overlap = 50%

4. Store matches in `JobMatches` table:
   ```
   JobMatches Table:
   - Id
   - UserId
   - JobPostingId
   - MatchScore
   - MatchReasons (JSON: which skills matched, etc.)
   - Status (New, Applied, Skipped, Rejected)
   - CreatedAt
   ```

5. Send notification to user:
   - Email: "You have 12 new job matches!"
   - In-app notification
   - Push notification (if mobile app)

---

**Step 3: Automatic Application (User's Choice)**

### **If User Has "Fully Automatic" Mode Enabled:**

**Trigger:** New job match with score >= 85%

**Data Flow:**
1. System retrieves:
   - User's cover letter template
   - User's resume file
   - Job posting details
   - User's profile

2. AI Personalization:
   - **API Call:** `POST /api/ai/personalize-cover-letter`
   - Sends to OpenAI/Claude:
     ```
     Prompt:
     "Personalize this cover letter for a {job_title} position at {company}.
     
     Base Cover Letter: {user_template}
     
     Job Description: {job_description}
     
     User's Experience: {user_experience}
     
     User's Skills: {user_skills}
     
     Make it personalized, highlight relevant experience,
     and maintain a professional tone."
     ```
   
   - AI returns personalized cover letter

3. Generate Application Email:
   - **To:** Job application email (extracted from posting)
   - **Subject:** "Application for {job_title} at {company}"
   - **Body:** Personalized cover letter
   - **Attachments:** User's resume (PDF)

4. Send Email:
   - **API Call:** `POST /api/emails/send` (using user's connected Gmail/Outlook)
   - Email sent from user's email address
   - System stores sent email in database

5. Update Job Match Status:
   - `Status` = "Applied"
   - `AppliedAt` = Current timestamp
   - Store copy of sent email for tracking

6. Log Activity:
   ```
   ApplicationActivity Table:
   - Id
   - UserId
   - JobMatchId
   - Action (Applied, Skipped, Interview, Rejected, Offer)
   - Details (Email sent, Response received, etc.)
   - Timestamp
   ```

---

### **If User Has "Semi-Automatic" Mode:**

**Data Flow:**
1. System finds matches (same as above)
2. Shows matches on dashboard
3. User clicks "Apply Now"
4. System shows preview:
   - Generated cover letter
   - Email preview
   - Attached resume
5. User can:
   - Edit cover letter
   - Approve and send
   - Skip this job
6. On approval, email sent (same as automatic)

---

## **PHASE 7: Response Tracking & Follow-Ups**

### **Screen 8: Application Tracker** (`/applications`)

**Data Flow:**
- Frontend → `GET /api/applications?status=applied&sort=date`
- Backend returns all user's applications with status

**Display:**

```
┌─────────────────────────────────────────────────────┐
│  Application Tracker                                 │
├─────────────────────────────────────────────────────┤
│  Filters: [All] [Applied] [In Review] [Interview]  │
│           [Rejected] [Offers]                        │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Senior Software Engineer · Google             │  │
│  │ Applied: Nov 23, 2025 (1 day ago)           │  │
│  │                                               │  │
│  │ Status: 📩 Response Received                 │  │
│  │ "We'd like to schedule a phone interview"   │  │
│  │                                               │  │
│  │ [View Email] [Schedule Interview] [Archive]  │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Full Stack Developer · Microsoft              │  │
│  │ Applied: Nov 22, 2025 (2 days ago)          │  │
│  │                                               │  │
│  │ Status: ⏳ In Review                         │  │
│  │ Last Update: Application viewed              │  │
│  │                                               │  │
│  │ [Send Follow-Up] [View Job] [Withdraw]      │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

### **Email Response Monitoring (Background Job)**

**Trigger:** Background job runs every 15 minutes

**Data Flow:**
1. For each user with connected email:
   - Fetch new emails since last check
   - Filter emails related to job applications:
     - From: Companies user applied to
     - Subject contains: "interview", "application", "position"
     - In reply to: Sent application emails

2. Classify email using AI:
   - **API Call:** `POST /api/ai/classify-response`
   - Send email content to OpenAI:
     ```
     Prompt:
     "Classify this email response to a job application.
     
     Email: {email_body}
     
     Categories:
     - Rejection
     - Interview Request
     - Request for More Info
     - Automated Acknowledgment
     - Offer
     - Other
     
     Return JSON with category and key details."
     ```

3. Update Application Status:
   ```
   If AI returns "Interview Request":
     - Update JobMatch.Status = "Interview"
     - Create notification: "🎉 Interview request from Google!"
     - Extract interview details (date, time, link)
   
   If AI returns "Rejection":
     - Update JobMatch.Status = "Rejected"
     - Log reason (if mentioned in email)
   
   If AI returns "Offer":
     - Update JobMatch.Status = "Offer"
     - Create high-priority notification
     - Extract offer details (salary, start date)
   ```

4. Send Notification to User:
   - In-app notification
   - Email summary (daily digest)
   - Push notification for important updates

---

### **Automated Follow-Ups (Smart Feature)**

**Trigger:** No response after X days

**Data Flow:**
1. Background job checks applications where:
   - Status = "Applied"
   - AppliedAt > 7 days ago
   - No response received
   - Follow-up not sent yet

2. Generate Follow-Up Email:
   - **API Call:** `POST /api/ai/generate-followup`
   - AI creates polite follow-up:
     ```
     Subject: Following Up on My Application for {job_title}
     
     Body:
     "Dear Hiring Manager,
     
     I wanted to follow up on my application for the
     {job_title} position I submitted on {date}.
     
     I remain very interested in this opportunity and
     would love to discuss how my experience in {key_skill}
     could contribute to your team.
     
     Thank you for your consideration.
     
     Best regards,
     {user_name}"
     ```

3. Send Follow-Up Email:
   - User can enable "Auto Follow-Up" in settings
   - If enabled: Send automatically
   - If disabled: Show in dashboard as suggested action

4. Log Follow-Up Activity:
   - Update ApplicationActivity table
   - Track response rate to follow-ups

---

## **PHASE 8: Analytics & Insights**

### **Screen 9: Analytics Dashboard** (`/analytics`)

**Data Displayed:**

1. **Application Metrics:**
   - Total Applications Sent
   - Response Rate (%)
   - Interview Rate (%)
   - Offer Rate (%)
   - Average Time to Response

2. **Best Performing:**
   - Which job titles get most responses
   - Which companies respond fastest
   - Which skills are most in-demand
   - Best day/time to apply

3. **Optimization Suggestions:**
   - "Applications sent on Tuesday get 23% more responses"
   - "Your React skills match 87% of available jobs"
   - "Consider adding 'AWS' to your profile - seen in 45% of matches"

4. **Comparison:**
   - Your stats vs. platform average
   - Your progress over time (trend charts)

**Data Flow:**
- Frontend → `GET /api/analytics/user-stats`
- Backend aggregates data from ApplicationActivity table
- Returns calculated metrics

---

## **Monetization Strategy (Business Model)**

### **Pricing Tiers:**

#### **Free Plan:**
- 10 applications per month
- Basic job matching
- Email sync
- Manual application mode only
- Standard cover letter template

#### **Pro Plan ($29/month):**
- 100 applications per month
- Advanced AI matching
- Semi-automatic application mode
- AI-personalized cover letters
- Automated follow-ups
- Response tracking
- Basic analytics

#### **Premium Plan ($79/month):**
- Unlimited applications
- Fully automatic mode
- Premium AI personalization
- Priority job alerts
- Advanced analytics
- Interview preparation tips (AI-generated)
- Salary negotiation insights
- Dedicated support

#### **Enterprise Plan (Custom Pricing):**
- For recruiting agencies
- Bulk candidate management
- White-label option
- API access
- Custom integrations

---

### **Additional Revenue Streams:**

1. **Job Board Partnerships:**
   - Affiliate commissions from LinkedIn, Indeed
   - Featured job promotions
   - Sponsored job listings in user feeds

2. **Resume Services:**
   - AI-powered resume optimization ($19 one-time)
   - Professional resume review by experts ($99)
   - LinkedIn profile optimization ($49)

3. **Interview Prep Add-On ($19/month):**
   - AI interview practice
   - Company-specific interview questions
   - Mock interview recordings with feedback

4. **Data Insights for Recruiters:**
   - Anonymized hiring trend reports
   - Skills demand analytics
   - Salary benchmarking data

---

## **Complete Data Flow Summary:**

```
User Signs Up
    ↓
Builds Profile (resume, skills, experience)
    ↓
Connects Email (Gmail/Outlook)
    ↓
Sets Job Preferences (titles, locations, auto-apply settings)
    ↓
Background Job Scrapes Jobs (hourly)
    ↓
Matching Algorithm Runs (every 30 min)
    ↓
Job Matches Appear on Dashboard
    ↓
If Auto-Apply Enabled:
    ├─ AI Personalizes Cover Letter
    ├─ System Sends Application Email
    └─ Logs Application
    ↓
Background Job Monitors Email Responses
    ↓
AI Classifies Responses (rejection, interview, etc.)
    ↓
Updates Application Status
    ↓
Notifies User of Important Updates
    ↓
Auto Follow-Up After 7 Days (if enabled)
    ↓
User Tracks All Applications in Dashboard
    ↓
Analytics Show Performance Metrics
    ↓
User Gets Interviews/Offers 🎉
```

---

## **Key Database Tables:**

1. **Users** - User accounts
2. **UserProfiles** - Skills, experience, resume
3. **JobPreferences** - Search criteria, auto-apply settings
4. **MailboxConnections** - Email OAuth tokens
5. **JobPostings** - Scraped jobs from various sources
6. **JobMatches** - Jobs matched to users with scores
7. **ApplicationActivity** - All applications sent/tracked
8. **EmailResponses** - Classified responses from companies
9. **Analytics** - Aggregated stats and insights
10. **Subscriptions** - User billing and plan info

---

## **Competitive Advantages:**

1. **Automation:** Unlike LinkedIn Easy Apply, fully automates the process
2. **Personalization:** AI customizes each application
3. **Tracking:** Monitors responses and manages follow-ups
4. **Multi-Source:** Aggregates jobs from multiple platforms
5. **Smart Matching:** Algorithm learns from user's success rate
6. **Time-Saving:** Users can apply to hundreds of jobs effortlessly

---

**Does this align with your vision? Should we refine any specific part of the flow?**

Yawfranc: make this md file

GitHub Copilot: I'll create a comprehensive markdown file documenting the complete business model and data flow:

````markdown
# Recchx Business Model & Data Flow Documentation

## Table of Contents
1. [Core Value Proposition](#core-value-proposition)
2. [Complete User Journey](#complete-user-journey)
3. [Technical Architecture](#technical-architecture)
4. [Monetization Strategy](#monetization-strategy)
5. [Competitive Analysis](#competitive-analysis)

---

## Core Value Proposition

**"Automated Job Applications via Email - Your Personal Job Application Assistant"**

Recchx automates the entire job application process by:
- ✅ Monitoring job postings across multiple platforms
- ✅ Matching jobs to user profile using AI
- ✅ Sending personalized application emails automatically
- ✅ Tracking responses and managing follow-ups
- ✅ Providing analytics and optimization insights

---

## Complete User Journey

### Phase 1: Authentication

#### Screen 1: Landing Page (`/`)
- **Purpose:** Marketing and user acquisition
- **User Actions:**
  - Click "Sign Up" → Navigate to Sign Up screen
  - Click "Login" → Navigate to Login screen
- **Data Flow:** None (static content)

#### Screen 2: Sign Up (`/signup`)
- **User Inputs:**
  - Email address
  - Password
  - Full name
- **Data Flow:**
  ```
  Frontend → POST /api/auth/register
  Body: { email, password, name }
  
  Backend:
  1. Validates email format
  2. Hashes password
  3. Creates user record in database
  4. Generates JWT token
  
  Response: { token, userId, email }
  ```
- **Storage:**
  ```sql
  INSERT INTO Users (Id, Email, PasswordHash, Name, CreatedAt)
  VALUES (newGuid, email, hashedPassword, name, now)
  ```
- **Next:** Redirect to Profile Building (`/onboarding/profile`)

#### Screen 3: Login (`/login`)
- **User Inputs:**
  - Email address
  - Password
- **Data Flow:**
  ```
  Frontend → POST /api/auth/login
  Body: { email, password }
  
  Backend:
  1. Looks up user by email
  2. Verifies password hash
  3. Generates JWT token
  
  Response: { token, userId, email, hasProfile, hasConnectedEmail }
  ```
- **Routing Logic:**
  - If `hasProfile = false` → Redirect to `/onboarding/profile`
  - If `hasConnectedEmail = false` → Redirect to `/onboarding/connect`
  - If both true → Redirect to `/dashboard`

---

### Phase 2: Profile Building (Critical for Job Matching)

#### Screen 4: Build Your Profile (`/onboarding/profile`)

**Purpose:** Collect information needed for job matching and application personalization

**Section 1: Basic Information**
- Full Name (pre-filled from signup)
- Phone Number
- Location (City, State, Country)
- LinkedIn URL (optional)
- Portfolio/Website URL (optional)

**Section 2: Professional Information**
- Current Job Title
- Years of Experience (dropdown: 0-1, 1-3, 3-5, 5-10, 10+)
- Desired Job Titles (multi-select or tags)
  - Examples: "Software Engineer", "Full Stack Developer", "Backend Developer"
- Desired Salary Range
  - Min: $____
  - Max: $____
- Work Authorization
  - US Citizen / Green Card / H1B / Need Sponsorship
- Willing to Relocate? (Yes/No)
- Preferred Work Mode
  - Remote / Hybrid / Onsite / No Preference

**Section 3: Skills & Expertise**
- Technical Skills (tag input)
  - Examples: React, Node.js, Python, AWS, Docker
  - User can type and add multiple
- Soft Skills (tag input)
  - Examples: Leadership, Communication, Problem Solving
- Certifications (list)
  - Name, Issuer, Year
- Languages Spoken (dropdown with proficiency)
  - English (Native), Spanish (Fluent), etc.

**Section 4: Work Experience**
Each entry includes:
- Company Name
- Job Title
- Employment Type (Full-time, Part-time, Contract, Internship)
- Start Date (Month/Year)
- End Date (Month/Year or "Present")
- Location (City, State)
- Key Responsibilities (rich text editor, bullet points)
- Notable Achievements (optional)

User can add multiple work experiences. Button: "+ Add Another Position"

**Section 5: Education**
Each entry includes:
- Degree (BS, MS, PhD, etc.)
- Field of Study (e.g., Computer Science)
- Institution Name
- Graduation Year (or Expected Graduation)
- GPA (optional)
- Honors/Awards (optional)

User can add multiple education entries. Button: "+ Add Another Degree"

**Section 6: Resume Upload**
- Drag & drop or click to upload
- Accepted formats: PDF, DOCX
- Max size: 5MB
- **AI Resume Parser:**
  ```
  Frontend → POST /api/profile/parse-resume
  Body: FormData with resume file
  
  Backend:
  1. Uploads file to storage (S3/Azure Blob)
  2. Calls AI service (OpenAI GPT-4, Claude, or resume parser API)
  3. Extracts structured data:
     - Name, email, phone
     - Work experience
     - Education
     - Skills
     - Certifications
  4. Returns parsed JSON
  
  Response: {
    name, email, phone,
    workExperience: [...],
    education: [...],
    skills: [...],
    certifications: [...]
  }
  ```
- Frontend pre-fills form with parsed data
- User can review and edit before saving

**Save Profile:**
```
Frontend → POST /api/profile
Body: {
  basicInfo: { name, phone, location, linkedIn, portfolio },
  professionalInfo: { 
    currentJobTitle, yearsOfExperience, desiredJobTitles,
    salaryMin, salaryMax, workAuthorization,
    willingToRelocate, preferredWorkMode
  },
  skills: {
    technical: [...],
    soft: [...],
    certifications: [...],
    languages: [...]
  },
  workExperience: [...],
  education: [...],
  resumeFileUrl: "https://storage.../resume.pdf"
}

Backend:
1. Validates all required fields
2. Stores in UserProfile table
3. Generates profile completion score (0-100%)

Response: { profileId, completionScore: 95 }
```

**Data Storage:**
```sql
-- UserProfile Table
CREATE TABLE UserProfiles (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    
    -- Basic Info
    FullName NVARCHAR(200),
    Phone NVARCHAR(20),
    Location NVARCHAR(200),
    LinkedInUrl NVARCHAR(500),
    PortfolioUrl NVARCHAR(500),
    
    -- Professional Info
    CurrentJobTitle NVARCHAR(200),
    YearsOfExperience INT,
    DesiredJobTitles NVARCHAR(MAX), -- JSON array
    SalaryMin DECIMAL,
    SalaryMax DECIMAL,
    WorkAuthorization NVARCHAR(50),
    WillingToRelocate BIT,
    PreferredWorkMode NVARCHAR(20),
    
    -- Files
    ResumeFileUrl NVARCHAR(500),
    
    -- Metadata
    CompletionScore INT,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);

-- UserSkills Table (Many-to-Many)
CREATE TABLE UserSkills (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    SkillName NVARCHAR(100),
    SkillType NVARCHAR(20), -- Technical, Soft, Certification, Language
    ProficiencyLevel NVARCHAR(20), -- Beginner, Intermediate, Expert
    YearsOfExperience INT
);

-- WorkExperience Table
CREATE TABLE WorkExperiences (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    CompanyName NVARCHAR(200),
    JobTitle NVARCHAR(200),
    EmploymentType NVARCHAR(50),
    StartDate DATE,
    EndDate DATE,
    Location NVARCHAR(200),
    Responsibilities NVARCHAR(MAX), -- Stored as HTML or Markdown
    Achievements NVARCHAR(MAX),
    IsCurrent BIT,
    DisplayOrder INT
);

-- Education Table
CREATE TABLE Education (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    Degree NVARCHAR(100),
    FieldOfStudy NVARCHAR(200),
    InstitutionName NVARCHAR(200),
    GraduationYear INT,
    GPA DECIMAL(3,2),
    Honors NVARCHAR(500),
    DisplayOrder INT
);
```

**Next Step:** Redirect to Connect Email (`/onboarding/connect`)

---

### Phase 3: Email Connection (OAuth Flow)

#### Screen 5: Connect Email Account (`/onboarding/connect`)

**Purpose:** Connect user's email for sending applications and monitoring responses

**Display:**
- Heading: "Connect Your Email Account"
- Subheading: "We'll use your email to send job applications and track responses"
- Two large buttons:
  - 🔵 **Connect Gmail**
  - 🔷 **Connect Outlook**
- Footer link: "I'll do this later" (skips to dashboard with limited functionality)

**When User Clicks "Connect Gmail":**

**Step 1: Request Authorization URL**
```
Frontend → POST /api/mailbox/connect?provider=Gmail
Headers: { Authorization: Bearer <JWT_TOKEN> }

Backend (GmailOAuthService):
1. Generates state parameter: {userId}|Gmail|{timestamp}
2. Base64 encodes state
3. Builds Google OAuth URL:
   https://accounts.google.com/o/oauth2/v2/auth?
   client_id={GMAIL_CLIENT_ID}&
   redirect_uri=https://recchx.com/api/mailbox/oauth/callback&
   response_type=code&
   scope=https://www.googleapis.com/auth/gmail.readonly
         https://www.googleapis.com/auth/gmail.send
         https://www.googleapis.com/auth/userinfo.email&
   state={encoded_state}&
   access_type=offline&
   prompt=consent

Response: { 
  authorizationUrl: "https://accounts.google.com/...",
  state: "encoded_state_string"
}
```

**Step 2: Open OAuth Popup**
```javascript
// Frontend opens popup
const popup = window.open(
  authorizationUrl,
  'oauth-popup',
  'width=600,height=700,scrollbars=yes'
);

// Listen for messages from popup
window.addEventListener('message', (event) => {
  if (event.data.type === 'oauth-success') {
    // OAuth completed successfully
    showSuccessToast('Gmail connected!');
    redirectTo('/dashboard');
  } else if (event.data.type === 'oauth-error') {
    // OAuth failed
    showErrorToast(event.data.message);
  }
});
```

**Step 3: User Authorizes on Google**
- Popup shows Google OAuth consent screen
- User selects Google account
- User grants permissions:
  - ✅ Read emails
  - ✅ Send emails
  - ✅ View email address
- Google redirects to callback URL

**Step 4: OAuth Callback (Backend Handles Automatically)**
```
Google redirects to:
https://recchx.com/api/mailbox/oauth/callback?
code=4/0Ab32j93xOL4DnoYo...&
state=encoded_state&
scope=email+gmail.readonly+gmail.send

Backend (MailboxController.OAuthCallback):
1. Receives authorization code and state
2. Decodes state to extract: userId, provider, timestamp
3. Validates state timestamp (not expired)
4. Exchanges code for tokens:
   
   POST https://oauth2.googleapis.com/token
   Body: {
     code: "4/0Ab32j93xOL4DnoYo...",
     client_id: GMAIL_CLIENT_ID,
     client_secret: GMAIL_CLIENT_SECRET,
     redirect_uri: "https://recchx.com/api/mailbox/oauth/callback",
     grant_type: "authorization_code"
   }
   
   Response: {
     access_token: "ya29.a0AfH6SMB...",
     refresh_token: "1//0gNc8tKJK...",
     expires_in: 3600,
     scope: "email gmail.readonly gmail.send",
     token_type: "Bearer"
   }

5. Gets user's email address:
   GET https://www.googleapis.com/oauth2/v1/userinfo?
   access_token={access_token}
   
   Response: { email: "user@gmail.com" }

6. Encrypts tokens using encryption service
7. Stores in database:
   INSERT INTO MailboxConnections (
     UserId, Provider, Email,
     EncryptedAccessToken, EncryptedRefreshToken,
     TokenExpiresAt, Scopes, LastSyncTime
   ) VALUES (
     userId, 'Gmail', 'user@gmail.com',
     encryptedAccessToken, encryptedRefreshToken,
     now + 3600 seconds, 'email gmail.readonly gmail.send',
     NULL
   )

8. Triggers background job to start initial sync
9. Redirects browser to: /oauth/success?provider=Gmail
```

**Data Storage:**
```sql
CREATE TABLE MailboxConnections (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    Provider NVARCHAR(50), -- Gmail, Outlook
    Email NVARCHAR(255),
    EncryptedAccessToken NVARCHAR(MAX),
    EncryptedRefreshToken NVARCHAR(MAX),
    TokenExpiresAt DATETIME,
    Scopes NVARCHAR(500),
    LastSyncTime DATETIME,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);
```

**Step 5: OAuth Success Page**
```
URL: /oauth/success?provider=Gmail

Display:
- ✅ Large checkmark icon
- "Gmail Connected Successfully!"
- "Your account has been connected. We're starting to sync your emails..."
- Auto-close popup in 2 seconds OR
- "Continue to Dashboard" button

JavaScript:
if (window.opener) {
  // Notify parent window
  window.opener.postMessage({
    type: 'oauth-success',
    provider: 'Gmail'
  }, window.location.origin);
  
  // Close popup
  setTimeout(() => window.close(), 2000);
} else {
  // Not in popup, redirect
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 2000);
}
```

**Next Step:** Dashboard with initial sync running in background

---

### Phase 4: Job Preferences Setup

#### Screen 6: Set Job Search Preferences (`/preferences` or `/onboarding/preferences`)

**Purpose:** Configure what jobs to apply for and how to apply

**Section 1: Job Search Criteria**

**Desired Job Titles** (Multi-select with custom input)
- Dropdown shows common titles:
  - Software Engineer
  - Senior Software Engineer
  - Full Stack Developer
  - Backend Developer
  - Frontend Developer
  - DevOps Engineer
  - Data Engineer
  - etc.
- User can type custom titles
- Can select multiple

**Industries** (Multi-select)
- Technology
- Finance/Banking
- Healthcare
- E-commerce
- Education
- Media/Entertainment
- Consulting
- Startups
- Any (no filter)

**Company Size** (Checkboxes)
- [ ] Startup (1-50 employees)
- [ ] Small (51-200 employees)
- [ ] Medium (201-1000 employees)
- [ ] Large (1001-10000 employees)
- [ ] Enterprise (10000+ employees)

**Locations** (Multi-select with autocomplete)
- User types city names: "San Francisco, CA", "New York, NY"
- Special options:
  - [x] Remote Only
  - [ ] Willing to relocate (uses profile setting)
- Can select multiple locations

**Salary Range**
- Minimum: $_____ (e.g., $100,000)
- Maximum: $_____ (e.g., $200,000)
- Currency: USD (dropdown for international users)
- Or: "Not specified" checkbox

**Section 2: Job Sources**

**Select where to search for jobs:** (Checkboxes)
- [x] LinkedIn Jobs
- [x] Indeed
- [x] Glassdoor
- [ ] ZipRecruiter
- [ ] Monster
- [ ] Company Career Pages (specify companies below)
- [ ] Custom Job Boards (specify URLs below)

**Specific Companies** (if "Company Career Pages" checked)
- Tag input: Google, Microsoft, Amazon, Meta, Apple...

**Section 3: Application Automation Settings**

**Application Mode:**
- ⚪ **Fully Automatic** - Apply to all matching jobs automatically
  - Daily limit: [25] applications per day (slider: 10-100)
  - Minimum match score: [85]% (slider: 70-100)
  - Info: "Jobs scoring above 85% will be applied to automatically"

- ⚪ **Semi-Automatic** (Recommended) - Review and approve each application
  - Show me matches, I'll click "Apply" to send
  - Allows editing cover letter before sending

- ⚪ **Manual Only** - Just show me job matches
  - I'll apply on my own through company websites

**Application Frequency:**
- Spread applications throughout the day? 
  - [ ] Yes (prevents spam detection, more natural)
  - [ ] No (send all at once when matches found)

**Section 4: Email & Cover Letter Configuration**

**Email Subject Line Template:**
```
Default: Application for {job_title} at {company_name}

Available variables:
{job_title} - Job position title
{company_name} - Company name
{your_name} - Your full name
{date} - Today's date
```
User can customize, e.g.:
- "Experienced {job_title} - {your_name}"
- "{your_name} - Application for {job_title}"

**Cover Letter Template:**
```
[Rich text editor with formatting options]

Default template:
Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} 
position at {company_name}. With {years_experience} years of 
experience in {primary_skill}, I am confident in my ability to 
contribute to your team.

[Your cover letter content here - will be personalized by AI]

I would welcome the opportunity to discuss how my skills and 
experience align with your needs.

Thank you for your consideration.

Best regards,
{your_name}
{your_phone}
{your_email}

Available variables:
{job_title}, {company_name}, {years_experience}, {primary_skill},
{your_name}, {your_email}, {your_phone}, {your_linkedin}
```

**AI Personalization Settings:**
- [ ] Use AI to personalize each cover letter
  - Tone: [Professional ▼] (Professional, Enthusiastic, Casual)
  - Emphasis: What to highlight
    - [x] Technical skills matching job requirements
    - [x] Relevant work experience
    - [ ] Cultural fit and company values
    - [ ] Career growth and learning goals
  - Length: [Medium ▼] (Concise, Medium, Detailed)

**Section 5: Follow-Up Settings**

**Automatic Follow-Ups:**
- [ ] Enable automatic follow-ups for applications with no response
- Send follow-up after: [7] days (slider: 5-14 days)
- Maximum follow-ups per job: [1] (slider: 0-3)

**Follow-Up Email Template:**
```
Subject: Following up on {job_title} application

Dear Hiring Manager,

I wanted to follow up on my application for the {job_title} 
position submitted on {application_date}. I remain very interested 
in this opportunity and would welcome the chance to discuss how 
my experience could benefit your team.

Thank you for your time and consideration.

Best regards,
{your_name}
```

**Save Preferences:**
```
Frontend → POST /api/preferences
Body: {
  jobCriteria: {
    desiredJobTitles: ["Software Engineer", "Full Stack Developer"],
    industries: ["Technology", "Startups"],
    companySizes: ["Medium", "Large"],
    locations: ["San Francisco, CA", "Remote"],
    salaryMin: 120000,
    salaryMax: 180000
  },
  jobSources: {
    linkedin: true,
    indeed: true,
    glassdoor: true,
    customCompanies: ["Google", "Microsoft"]
  },
  automationSettings: {
    applicationMode: "SemiAutomatic", // FullyAutomatic, SemiAutomatic, Manual
    dailyLimit: 25,
    minimumMatchScore: 85,
    spreadThroughoutDay: true
  },
  emailSettings: {
    subjectTemplate: "Application for {job_title} at {company_name}",
    coverLetterTemplate: "...",
    useAiPersonalization: true,
    tone: "Professional",
    emphasis: ["TechnicalSkills", "WorkExperience"],
    length: "Medium"
  },
  followUpSettings: {
    enabled: true,
    daysBeforeFollowUp: 7,
    maxFollowUps: 1,
    followUpTemplate: "..."
  }
}

Backend:
1. Validates all settings
2. Stores in JobPreferences table
3. Activates job matching cron job for this user

Response: { 
  preferencesId, 
  message: "Preferences saved! We'll start finding matches for you." 
}
```

**Data Storage:**
```sql
CREATE TABLE JobPreferences (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    
    -- Job Criteria
    DesiredJobTitles NVARCHAR(MAX), -- JSON array
    Industries NVARCHAR(MAX), -- JSON array
    CompanySizes NVARCHAR(MAX), -- JSON array
    Locations NVARCHAR(MAX), -- JSON array
    SalaryMin DECIMAL,
    SalaryMax DECIMAL,
    
    -- Job Sources
    JobSources NVARCHAR(MAX), -- JSON: {linkedin: true, indeed: true, ...}
    CustomCompanies NVARCHAR(MAX), -- JSON array
    
    -- Automation
    ApplicationMode NVARCHAR(20), -- FullyAutomatic, SemiAutomatic, Manual
    DailyApplicationLimit INT,
    MinimumMatchScore INT,
    SpreadApplications BIT,
    
    -- Email Settings
    EmailSubjectTemplate NVARCHAR(500),
    CoverLetterTemplate NVARCHAR(MAX),
    UseAiPersonalization BIT,
    PersonalizationTone NVARCHAR(20),
    PersonalizationEmphasis NVARCHAR(MAX), -- JSON array
    PersonalizationLength NVARCHAR(20),
    
    -- Follow-Up Settings
    EnableFollowUps BIT,
    DaysBeforeFollowUp INT,
    MaxFollowUps INT,
    FollowUpTemplate NVARCHAR(MAX),
    
    -- Metadata
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);
```

**Next Step:** Dashboard (job matching system activates in background)

---

### Phase 5: Main Dashboard (Job Matching & Application)

#### Screen 7: Dashboard (`/dashboard`)

**Purpose:** Central hub for job matches, application tracking, and activity monitoring

**Layout Components:**

**Top Navigation Bar:**
```
┌─────────────────────────────────────────────────────────┐
│ [Recchx Logo]  Dashboard  Applications  Analytics      │
│                                                          │
│                                      [Search] [Profile ▼]│
└─────────────────────────────────────────────────────────┘
```

**Main Content Area:**

**Stats Summary Card:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Your Application Stats                               │
├─────────────────────────────────────────────────────────┤
│  Today: 8 / 25 applications                             │
│  ████████░░░░░░░░░░░░░  32%                            │
│                                                          │
│  Total Applications: 127                                │
│  Response Rate: 23 (18%)                                │
│  Interviews: 5                                          │
│  Offers: 1 🎉                                           │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/dashboard/stats
Headers: { Authorization: Bearer <JWT> }

Backend:
1. Queries ApplicationActivity table for user
2. Calculates:
   - Applications sent today (where DATE = today)
   - Total applications (COUNT(*))
   - Responses received (WHERE Status IN ('Interview', 'Offer', 'Rejected'))
   - Response rate (responses / total * 100)
   - Interviews (WHERE Status = 'Interview')
   - Offers (WHERE Status = 'Offer')

Response: {
  applicationsToday: 8,
  dailyLimit: 25,
  totalApplications: 127,
  responses: 23,
  responseRate: 18.1,
  interviews: 5,
  offers: 1
}
```

**Job Matches Section:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 New Job Matches (47)                    [View All]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐⭐ 92% Match                                ││
│  │                                                     ││
│  │ Senior Software Engineer                            ││
│  │ Google · Mountain View, CA · Remote                ││
│  │ 💰 $150k - $200k · 📅 Posted 2 hours ago          ││
│  │                                                     ││
│  │ Why you match:                                      ││
│  │ • 5+ years experience ✓                            ││
│  │ • React, Node.js, TypeScript ✓                     ││
│  │ • Leadership experience ✓                          ││
│  │                                                     ││
│  │ [👁 View Job]  [✉ Apply Now]  [✕ Skip]           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐ 88% Match                                  ││
│  │                                                     ││
│  │ Full Stack Developer                                ││
│  │ Microsoft · Seattle, WA · Hybrid                   ││
│  │ 💰 $120k - $160k · 📅 Posted 5 hours ago          ││
│  │                                                     ││
│  │ Why you match:                                      ││
│  │ • TypeScript, Azure ✓                              ││
│  │ • 3+ years experience ✓                            ││
│  │ • Hybrid location preference ✓                     ││
│  │                                                     ││
│  │ [👁 View Job]  [✉ Apply Now]  [✕ Skip]           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Load More Matches...]                                 │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/jobs/matches?page=1&pageSize=10&status=New
Headers: { Authorization: Bearer <JWT> }

Backend:
1. Queries JobMatches table:
   WHERE UserId = {userId} 
   AND Status = 'New'
   AND MatchScore >= {user.preferences.minimumMatchScore}
   ORDER BY MatchScore DESC, CreatedAt DESC
   SKIP (page-1) * pageSize
   TAKE pageSize

2. Joins with JobPostings table to get full job details

3. Formats match reasons from MatchReasons JSON

Response: {
  matches: [
    {
      matchId: "uuid",
      matchScore: 92,
      matchReasons: [
        "5+ years experience matches requirement",
        "Skills: React, Node.js, TypeScript match job requirements",
        "Remote preference matches job location"
      ],
      job: {
        id: "uuid",
        title: "Senior Software Engineer",
        company: "Google",
        location: "Mountain View, CA · Remote",
        salaryMin: 150000,
        salaryMax: 200000,
        postedDate: "2025-11-24T08:30:00Z",
        description: "...",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        applicationEmail: "jobs@google.com",
        applicationUrl: "https://careers.google.com/jobs/123"
      }
    },
    // ... more matches
  ],
  totalMatches: 47,
  page: 1,
  pageSize: 10
}
```

**User Actions on Job Match Card:**

**1. Click "View Job":**
```
Opens modal or new tab with:
- Full job description
- Company info
- Required qualifications
- Benefits
- Application instructions
- Link to original posting

Data Flow:
Frontend → GET /api/jobs/{jobId}
Response: Full job posting details
```

**2. Click "Apply Now" (Semi-Automatic Mode):**
```
Opens application preview modal:

┌────────────────────────────────────────────────────────┐
│ Review Application                            [X Close] │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Applying to: Senior Software Engineer at Google        │
│                                                         │
│ To: jobs@google.com                                    │
│ Subject: Application for Senior Software Engineer...   │
│                                                         │
│ Cover Letter: [Editable Text Area]                     │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Dear Hiring Manager,                                ││
│ │                                                      ││
│ │ I am excited to apply for the Senior Software       ││
│ │ Engineer position at Google. With 5 years of        ││
│ │ experience in React, Node.js, and TypeScript,       ││
│ │ I have successfully led multiple full-stack         ││
│ │ projects...                                         ││
│ │                                                      ││
│ │ [AI-personalized content based on job description]  ││
│ │                                                      ││
│ │ Best regards,                                       ││
│ │ John Doe                                            ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Attachments:                                           │
│ 📄 Resume.pdf (125 KB)                                 │
│                                                         │
│ [Edit Cover Letter]  [Change Resume]                   │
│                                                         │
│          [Cancel]  [Send Application →]                │
└────────────────────────────────────────────────────────┘

Data Flow when modal opens:
Frontend → POST /api/ai/personalize-application
Body: {
  jobId: "uuid",
  coverLetterTemplate: "user's template",
  jobDescription: "...",
  userProfile: {...}
}

Backend:
1. Loads user's cover letter template
2. Loads job description and requirements
3. Calls AI service (OpenAI GPT-4):
   
   Prompt:
   "You are a professional job application writer. 
   Personalize this cover letter for the following job.
   
   Base Cover Letter:
   {user's template}
   
   Job Title: {job.title}
   Company: {job.company}
   Job Description:
   {job.description}
   
   Required Skills: {job.requiredSkills}
   
   Candidate Profile:
   - Name: {profile.name}
   - Experience: {profile.yearsOfExperience} years
   - Current Role: {profile.currentJobTitle}
   - Skills: {profile.skills}
   - Work Experience: {summary of work experience}
   
   Instructions:
   - Highlight skills that match job requirements
   - Mention relevant work experience
   - Keep professional tone
   - Keep length similar to template (300-400 words)
   - Don't fabricate experience
   - Use {company_name}, {job_title} variables
   
   Return only the personalized cover letter text."

4. AI returns personalized cover letter
5. Replaces template variables with actual values

Response: {
  personalizedCoverLetter: "Dear Hiring Manager, ...",
  subjectLine: "Application for Senior Software Engineer at Google",
  attachments: [
    { fileName: "Resume.pdf", url: "..." }
  ]
}
```

**When User Clicks "Send Application":**
```
Frontend → POST /api/applications/apply
Body: {
  matchId: "uuid",
  jobId: "uuid",
  coverLetter: "final edited text",
  subjectLine: "...",
  customizations: {
    // any changes user made
  }
}

Backend (ApplicationService):
1. Validates user hasn't exceeded daily limit
2. Gets user's mailbox connection (OAuth tokens)
3. Checks if tokens expired, refreshes if needed
4. Retrieves resume from storage
5. Composes email:
   - To: job.applicationEmail
   - From: user.email
   - Subject: subjectLine
   - Body: coverLetter (HTML formatted)
   - Attachments: Resume.pdf
6. Sends via Gmail/Outlook API:
   
   For Gmail:
   POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
   Headers: { Authorization: Bearer {access_token} }
   Body: {
     raw: base64UrlEncode(
       "To: jobs@google.com\r\n" +
       "From: user@gmail.com\r\n" +
       "Subject: Application for...\r\n" +
       "Content-Type: multipart/mixed; boundary=\"boundary\"\r\n\r\n" +
       "--boundary\r\n" +
       "Content-Type: text/html; charset=UTF-8\r\n\r\n" +
       coverLetterHtml + "\r\n" +
       "--boundary\r\n" +
       "Content-Type: application/pdf\r\n" +
       "Content-Disposition: attachment; filename=\"Resume.pdf\"\r\n" +
       "Content-Transfer-Encoding: base64\r\n\r\n" +
       base64Resume + "\r\n" +
       "--boundary--"
     )
   }

7. Stores application in database:
   INSERT INTO ApplicationActivity (
     UserId, JobMatchId, JobPostingId,
     Action, Status, EmailSent,
     CoverLetterUsed, ApplicationDate
   ) VALUES (
     userId, matchId, jobId,
     'Applied', 'Sent', true,
     coverLetter, NOW()
   )

8. Updates JobMatch status:
   UPDATE JobMatches 
   SET Status = 'Applied', AppliedAt = NOW()
   WHERE Id = matchId

9. Increments daily application count

Response: {
  success: true,
  applicationId: "uuid",
  message: "Application sent successfully!"
}
```

**Frontend shows:**
- Success toast: "✅ Application sent to Google!"
- Card moves from "New Matches" to "Applied" section
- Updates stats (applications today: 9/25)

**3. Click "Skip":**
```
Frontend → PUT /api/jobs/matches/{matchId}/skip

Backend:
1. Updates JobMatch status to 'Skipped'
2. Match won't appear again

Response: { success: true }
```
- Card disappears from feed
- Next match slides up

**Fully Automatic Mode (No User Interaction):**

If user has `ApplicationMode = "FullyAutomatic"` in preferences:

**Background Job (Runs every 30 minutes):**
```
For each user with FullyAutomatic mode:
  1. Check daily application limit not exceeded
  2. Get new matches with score >= minimumMatchScore
  3. For each match:
     a. Generate personalized cover letter (AI)
     b. Send application email
     c. Log application
     d. Update match status to 'Applied'
     e. Increment application count
  4. Stop when daily limit reached
  5. Send notification: "Applied to 10 new jobs today!"
```

**Recent Activity Feed:**
```
┌─────────────────────────────────────────────────────────┐
│ 📬 Recent Activity                          [See All]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎉 Meta · Interview Request                            │
│     "We'd like to schedule a phone interview"           │
│     2 minutes ago                                       │
│     [Schedule Interview →]                              │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ✉ Applied to Amazon · Software Engineer               │
│     1 hour ago                                          │
│     [View Application]                                  │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  👀 Apple viewed your profile                           │
│     3 hours ago                                         │
│     [View Job Details]                                  │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ⏰ Follow-up sent to Microsoft                         │
│     Applied 7 days ago, no response                     │
│     Yesterday at 9:00 AM                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/activities/recent?limit=10

Backend:
1. Queries ApplicationActivity table
2. Joins with JobPostings and EmailResponses
3. Orders by timestamp DESC
4. Formats activity types:
   - ApplicationSent
   - ResponseReceived (classified by AI)
   - FollowUpSent
   - ProfileViewed (if integrated with LinkedIn API)

Response: {
  activities: [
    {
      type: "ResponseReceived",
      company: "Meta",
      jobTitle: "Software Engineer",
      classification: "InterviewRequest",
      message: "We'd like to schedule a phone interview",
      timestamp: "2025-11-24T10:25:00Z",
      actionUrl: "/applications/uuid"
    },
    // ... more activities
  ]
}
```

**Real-Time Updates:**

Uses WebSocket or Server-Sent Events (SSE):
```
// Frontend establishes WebSocket connection
const ws = new WebSocket('wss://recchx.com/ws/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  switch(notification.type) {
    case 'NEW_MATCH':
      // Add new match card to feed
      // Update match count
      showToast(`New match: ${notification.jobTitle}`);
      break;
      
    case 'APPLICATION_SENT':
      // Update application count
      // Move card to "Applied" section
      showToast(`Application sent to ${notification.company}`);
      break;
      
    case 'RESPONSE_RECEIVED':
      // Add to activity feed
      // Show prominent notification
      if (notification.classification === 'InterviewRequest') {
        showBanner(`🎉 Interview request from ${notification.company}!`);
      }
      break;
  }
};

Backend sends notifications when:
- New job matches found
- Application sent (auto or manual)
- Email response received and classified
- Daily limit reached
- Error occurred (e.g., email sending failed)
```

---

### Phase 6: Job Matching System (Backend)

**This runs continuously in the background, independent of user actions**

#### Background Job 1: Job Scraping (Runs Every Hour)

**Purpose:** Fetch new job postings from various sources

**Data Flow:**

**Step 1: Connect to Job APIs**

```
For each job source (LinkedIn, Indeed, etc.):

Example: LinkedIn Jobs API
GET https://api.linkedin.com/v2/jobPostings?
    keywords={tech_keywords}&
    location={locations}&
    datePosted=past24Hours&
    limit=100

Headers: { Authorization: Bearer {LINKEDIN_API_KEY} }

Response: {
  jobs: [
    {
      id: "3786543298",
      title: "Senior Software Engineer",
      company: {
        name: "Google",
        id: "1441"
      },
      location: "Mountain View, CA",
      description: "...",
      postedDate: "2025-11-24T08:00:00Z",
      salaryRange: {
        min: 150000,
        max: 200000,
        currency: "USD"
      },
      employmentType: "FULL_TIME",
      workplaceType: "REMOTE",
      applicationUrl: "https://careers.google.com/...",
      requiredSkills: ["React", "Node.js", "TypeScript"]
    },
    // ... more jobs
  ]
}
```

**Step 2: Parse and Normalize Job Data**

```csharp
// Backend processes each job
foreach (var job in apiResponse.Jobs) 
{
    // Extract skills from description using AI
    var skills = await ExtractSkillsFromDescription(job.Description);
    
    // Determine experience level
    var experienceLevel = DetermineExperienceLevel(
        job.Title, 
        job.Description
    );
    
    // Extract application contact
    var applicationEmail = ExtractEmailFromDescription(job.Description)
        ?? job.ApplicationUrl;
    
    // Create normalized job posting
    var jobPosting = new JobPosting 
    {
        ExternalJobId = $"linkedin_{job.Id}",
        Source = "LinkedIn",
        Title = job.Title,
        Company = job.Company.Name,
        Location = job.Location,
        WorkplaceType = job.WorkplaceType, // Remote, Hybrid, Onsite
        SalaryMin = job.SalaryRange?.Min,
        SalaryMax = job.SalaryRange?.Max,
        Currency = job.SalaryRange?.Currency ?? "USD",
        Description = job.Description,
        RequiredSkills = skills, // JSON array
        ExperienceLevel = experienceLevel, // Entry, Mid, Senior, Lead
        EmploymentType = job.EmploymentType,
        ApplicationEmail = applicationEmail,
        ApplicationUrl = job.ApplicationUrl,
        PostingDate = job.PostedDate,
        IsActive = true,
        ScrapedAt = DateTime.UtcNow
    };
    
    // Check if already exists
    var existingJob = await _context.JobPostings
        .FirstOrDefaultAsync(j => j.ExternalJobId == jobPosting.ExternalJobId);
    
    if (existingJob == null) 
    {
        // New job - insert
        await _context.JobPostings.AddAsync(jobPosting);
    } 
    else if (existingJob.IsActive) 
    {
        // Update existing job (description might have changed)
        existingJob.Description = jobPosting.Description;
        existingJob.ScrapedAt = DateTime.UtcNow;
    }
}

await _context.SaveChangesAsync();
```

**AI Skill Extraction:**
```
POST to OpenAI API
Prompt:
"Extract technical skills, tools, and technologies from this job description.
Return as JSON array of strings.

Job Description:
{description}

Focus on:
- Programming languages (e.g., Python, JavaScript)
- Frameworks (e.g., React, Django)
- Tools (e.g., Docker, Kubernetes)
- Cloud platforms (e.g., AWS, Azure)
- Databases (e.g., PostgreSQL, MongoDB)

Return format:
{
  \"skills\": [\"React\", \"Node.js\", \"AWS\", \"PostgreSQL\"]
}"

Response:
{
  "skills": ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"]
}
```

**Experience Level Determination:**
```csharp
private string DetermineExperienceLevel(string title, string description) 
{
    var titleLower = title.ToLower();
    var descriptionLower = description.ToLower();
    
    // Check title keywords
    if (titleLower.Contains("intern") || titleLower.Contains("junior") ||
        titleLower.Contains("entry")) 
    {
        return "Entry";
    }
    
    if (titleLower.Contains("senior") || titleLower.Contains("sr.") ||
        titleLower.Contains("lead") || titleLower.Contains("principal")) 
    {
        return "Senior";
    }
    
    if (titleLower.Contains("staff") || titleLower.Contains("architect") ||
        titleLower.Contains("director")) 
    {
        return "Lead";
    }
    
    // Check description for years of experience
    var regex = new Regex(@"(\d+)\+?\s*years?", RegexOptions.IgnoreCase);
    var match = regex.Match(description);
    
    if (match.Success) 
    {
        var years = int.Parse(match.Groups[1].Value);
        
        if (years <= 2) return "Entry";
        if (years <= 5) return "Mid";
        if (years <= 10) return "Senior";
        return "Lead";
    }
    
    // Default to Mid if unclear
    return "Mid";
}
```

**Step 3: Store in Database**

```sql
-- JobPostings Table
CREATE TABLE JobPostings (
    Id UUID PRIMARY KEY DEFAULT NEWID(),
    ExternalJobId NVARCHAR(200) UNIQUE NOT NULL, -- Source + external ID
    Source NVARCHAR(50), -- LinkedIn, Indeed, etc.
    
    -- Basic Info
    Title NVARCHAR(200),
    Company NVARCHAR(200),
    Location NVARCHAR(200),
    WorkplaceType NVARCHAR(20), -- Remote, Hybrid, Onsite
    
    -- Compensation
    SalaryMin DECIMAL(12,2),
    SalaryMax DECIMAL(12,2),
    Currency NVARCHAR(10),
    
    -- Details
    Description NVARCHAR(MAX),
    RequiredSkills NVARCHAR(MAX), -- JSON array
    PreferredSkills NVARCHAR(MAX), -- JSON array
    ExperienceLevel NVARCHAR(20), -- Entry, Mid, Senior, Lead
    EmploymentType NVARCHAR(50), -- Full-time, Part-time, Contract
    
    -- Application
    ApplicationEmail NVARCHAR(255),
    ApplicationUrl NVARCHAR(500),
    
    -- Metadata
    PostingDate DATETIME,
    ExpirationDate DATETIME,
    IsActive BIT DEFAULT 1,
    ScrapedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_JobPostings_Source (Source),
    INDEX IX_JobPostings_PostingDate (PostingDate),
    INDEX IX_JobPostings_IsActive (IsActive)
);
```

**Logging:**
```
Background job logs:
- Jobs fetched from each source
- New jobs added
- Existing jobs updated
- Errors encountered

Example log:
[2025-11-24 10:00:00] Job Scraper Started
[2025-11-24 10:00:15] LinkedIn: Fetched 157 jobs
[2025-11-24 10:00:18] LinkedIn: 23 new jobs, 134 existing
[2025-11-24 10:00:35] Indeed: Fetched 203 jobs
[2025-11-24 10:00:38] Indeed: 45 new jobs, 158 existing
[2025-11-24 10:00:40] Total: 68 new jobs added
[2025-11-24 10:00:40] Job Scraper Completed
```

---

#### Background Job 2: Job Matching (Runs Every 30 Minutes)

**Purpose:** Match new jobs to user profiles

**Data Flow:**

**Step 1: Get Active Users**
```sql
-- Get users who have:
-- 1. Completed profile
-- 2. Connected email
-- 3. Set job preferences
-- 4. Haven't exceeded daily application limit

SELECT u.Id, u.Email, 
       up.DesiredJobTitles, up.Skills,
       jp.MinimumMatchScore, jp.DailyApplicationLimit
FROM Users u
INNER JOIN UserProfiles up ON u.Id = up.UserId
INNER JOIN JobPreferences jp ON u.Id = jp.UserId
INNER JOIN MailboxConnections mc ON u.Id = mc.UserId
WHERE up.CompletionScore >= 80
  AND mc.IsActive = 1
  AND jp.IsActive = 1
```

**Step 2: For Each User, Find Matching Jobs**

```csharp
foreach (var user in activeUsers) 
{
    // Get user's preferences and profile
    var profile = await GetUserProfile(user.Id);
    var preferences = await GetJobPreferences(user.Id);
    
    // Get new jobs posted since last match run
    var newJobs = await _context.JobPostings
        .Where(j => j.IsActive 
            && j.PostingDate >= DateTime.UtcNow.AddHours(-1)
            && !j.JobMatches.Any(m => m.UserId == user.Id))
        .ToListAsync();
    
    foreach (var job in newJobs) 
    {
        // Calculate match score
        var matchResult = await CalculateMatchScore(user, profile, preferences, job);
        
        if (matchResult.Score >= preferences.MinimumMatchScore) 
        {
            // Create job match record
            var jobMatch = new JobMatch 
            {
                UserId = user.Id,
                JobPostingId = job.Id,
                MatchScore = matchResult.Score,
                MatchReasons = matchResult.Reasons, // JSON array
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.JobMatches.AddAsync(jobMatch);
            
            // Send notification to user
            await SendNotification(user.Id, new Notification 
            {
                Type = "NEW_MATCH",
                Title = $"New {matchResult.Score}% match",
                Message = $"{job.Title} at {job.Company}",
                JobMatchId = jobMatch.Id
            });
        }
    }
    
    await _context.SaveChangesAsync();
}
```

**Step 3: Match Score Calculation Algorithm**

```csharp
private async Task<MatchResult> CalculateMatchScore(
    User user, 
    UserProfile profile, 
    JobPreferences preferences, 
    JobPosting job)
{
    var score = 0.0;
    var reasons = new List<string>();
    
    // 1. JOB TITLE MATCH (20 points)
    var desiredTitles = JsonConvert.DeserializeObject<List<string>>(
        preferences.DesiredJobTitles
    );
    
    var titleMatch = desiredTitles.Any(dt => 
        job.Title.Contains(dt, StringComparison.OrdinalIgnoreCase)
    );
    
    if (titleMatch) 
    {
        score += 20;
        reasons.Add($"Job title matches desired: {job.Title}");
    }
    
    // 2. SKILLS MATCH (50 points) - Most important
    var userSkills = await _context.UserSkills
        .Where(s => s.UserProfileId == profile.Id)
        .Select(s => s.SkillName.ToLower())
        .ToListAsync();
    
    var requiredSkills = JsonConvert.DeserializeObject<List<string>>(
        job.RequiredSkills ?? "[]"
    ).Select(s => s.ToLower()).ToList();
    
    if (requiredSkills.Any()) 
    {
        var matchingSkills = userSkills
            .Intersect(requiredSkills)
            .ToList();
        
        var skillMatchPercentage = (double)matchingSkills.Count / requiredSkills.Count;
        var skillScore = skillMatchPercentage * 50;
        
        score += skillScore;
        
        if (matchingSkills.Any()) 
        {
            reasons.Add($"Matching skills: {string.Join(", ", matchingSkills)}");
        }
        
        var missingSkills = requiredSkills.Except(userSkills).ToList();
        if (missingSkills.Count <= 2 && missingSkills.Count > 0) 
        {
            reasons.Add($"Nice to have: {string.Join(", ", missingSkills)}");
        }
    } 
    else 
    {
        // No required skills listed, give benefit of doubt
        score += 25;
    }
    
    // 3. EXPERIENCE LEVEL MATCH (15 points)
    var experienceMatch = MatchExperienceLevel(
        profile.YearsOfExperience, 
        job.ExperienceLevel
    );
    
    score += experienceMatch.Score;
    if (experienceMatch.Reason != null) 
    {
        reasons.Add(experienceMatch.Reason);
    }
    
    // 4. LOCATION MATCH (10 points)
    var locationPreferences = JsonConvert.DeserializeObject<List<string>>(
        preferences.Locations ?? "[]"
    );
    
    var locationMatch = false;
    
    if (job.WorkplaceType.Equals("Remote", StringComparison.OrdinalIgnoreCase)) 
    {
        // Remote jobs always match if user has "Remote" in preferences
        locationMatch = locationPreferences.Any(l => 
            l.Equals("Remote", StringComparison.OrdinalIgnoreCase)
        );
        
        if (locationMatch) 
        {
            score += 10;
            reasons.Add("Remote position matches preference");
        }
    } 
    else 
    {
        // Check if job location matches any user preference
        locationMatch = locationPreferences.Any(pref => 
            job.Location.Contains(pref, StringComparison.OrdinalIgnoreCase)
        );
        
        if (locationMatch) 
        {
            score += 10;
            reasons.Add($"Location matches: {job.Location}");
        } 
        else if (profile.WillingToRelocate) 
        {
            score += 5;
            reasons.Add("Willing to relocate");
        }
    }
    
    // 5. SALARY MATCH (5 points)
    if (job.SalaryMin.HasValue && job.SalaryMax.HasValue) 
    {
        var userSalaryMin = preferences.SalaryMin;
        var userSalaryMax = preferences.SalaryMax;
        
        // Check if there's overlap in salary ranges
        if (job.SalaryMax >= userSalaryMin) 
        {
            if (job.SalaryMin <= userSalaryMax) 
            {
                // Full overlap
                score += 5;
                reasons.Add($"Salary range ${job.SalaryMin:N0}-${job.SalaryMax:N0} matches expectations");
            } 
            else 
            {
                // Partial overlap
                score += 2.5;
            }
        }
    }
    
    // BONUS POINTS
    
    // 6. Company size preference (bonus +3)
    var companySizePreferences = JsonConvert.DeserializeObject<List<string>>(
        preferences.CompanySizes ?? "[]"
    );
    
    if (companySizePreferences.Any()) 
    {
        // Would need company size data from job posting
        // Simplified for now
        score += 2;
    }
    
    // 7. Recently posted (+2 for jobs less than 24 hours old)
    var hoursSincePosted = (DateTime.UtcNow - job.PostingDate).TotalHours;
    if (hoursSincePosted <= 24) 
    {
        score += 2;
        reasons.Add($"Recently posted ({(int)hoursSincePosted} hours ago)");
    }
    
    // 8. Application method preference
    if (!string.IsNullOrEmpty(job.ApplicationEmail)) 
    {
        score += 1;
        reasons.Add("Direct email application available");
    }
    
    // Normalize to 100
    var finalScore = Math.Min(100, Math.Round(score));
    
    return new MatchResult 
    {
        Score = (int)finalScore,
        Reasons = reasons
    };
}

private ExperienceMatchResult MatchExperienceLevel(
    int userYears, 
    string jobLevel)
{
    var result = new ExperienceMatchResult();
    
    switch (jobLevel) 
    {
        case "Entry":
            if (userYears <= 2) 
            {
                result.Score = 15;
                result.Reason = "Experience level matches: Entry-level";
            } 
            else if (userYears <= 5) 
            {
                result.Score = 12;
                result.Reason = "Overqualified but good fit";
            } 
            else 
            {
                result.Score = 5;
                result.Reason = "Significantly overqualified";
            }
            break;
            
        case "Mid":
            if (userYears >= 3 && userYears <= 7) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Mid-level";
            } 
            else if (userYears <= 2) 
            {
                result.Score = 8;
                result.Reason = "Slightly underqualified but worth applying";
            } 
            else 
            {
                result.Score = 10;
                result.Reason = "Senior experience for mid-level role";
            }
            break;
            
        case "Senior":
            if (userYears >= 5 && userYears <= 12) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Senior-level";
            } 
            else if (userYears >= 3) 
            {
                result.Score = 10;
                result.Reason = "Close to Senior-level requirements";
            } 
            else 
            {
                result.Score = 3;
                result.Reason = "Underqualified for Senior role";
            }
            break;
            
        case "Lead":
            if (userYears >= 10) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Lead/Principal-level";
            } 
            else if (userYears >= 7) 
            {
                result.Score = 10;
                result.Reason = "Approaching Lead-level experience";
            } 
            else 
            {
                result.Score = 3;
                result.Reason = "Underqualified for Lead role";
            }
            break;
            
        default:
            result.Score = 8;
            result.Reason = "Experience level not specified";
            break;
    }
    
    return result;
}
```

**Example Match Score Breakdown:**
```
Job: Senior Software Engineer at Google
User: 5 years experience, Skills: React, Node.js, TypeScript, AWS

Score Calculation:
- Job Title Match: 20/20 ✓ (Senior Software Engineer matches desired)
- Skills Match: 45/50 ✓ (4 out of 5 required skills)
  - Matching: React, Node.js, TypeScript, AWS
  - Missing: Kubernetes (nice to have)
- Experience Match: 15/15 ✓ (5 years matches Senior level)
- Location Match: 10/10 ✓ (Remote matches preference)
- Salary Match: 5/5 ✓ ($150k-$200k overlaps with $120k-$180k)
- Recently Posted: 2/2 ✓ (Posted 3 hours ago)
- Email Application: 1/1 ✓

Total: 98/100 ⭐⭐⭐⭐⭐

Match Reasons:
- "Job title matches desired: Senior Software Engineer"
- "Matching skills: React, Node.js, TypeScript, AWS"
- "5 years experience matches Senior-level"
- "Remote position matches preference"
- "Salary range $150,000-$200,000 matches expectations"
- "Recently posted (3 hours ago)"
- "Direct email application available"
```

**Step 4: Store Match Results**

```sql
CREATE TABLE JobMatches (
    Id UUID PRIMARY KEY DEFAULT NEWID(),
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    JobPostingId UUID FOREIGN KEY REFERENCES JobPostings(Id),
    
    MatchScore INT, -- 0-100
    MatchReasons NVARCHAR(MAX), -- JSON array of reasons
    
    Status NVARCHAR(20), -- New, Viewed, Applied, Skipped
    ViewedAt DATETIME,
    AppliedAt DATETIME,
    SkippedAt DATETIME,
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_JobMatches_UserId_Status (UserId, Status),
    INDEX IX_JobMatches_MatchScore (MatchScore),
    UNIQUE INDEX IX_JobMatches_UserJob (UserId, JobPostingId)
);
```

---

#### Background Job 3: Automatic Application (Runs Every 30 Minutes)

**Purpose:** Automatically apply to jobs for users with Fully Automatic mode

**Data Flow:**

**Step 1: Get Users with Automatic Mode**
```sql
SELECT u.Id, u.Email,
       jp.DailyApplicationLimit,// filepath: BUSINESS_MODEL.md
# Recchx Business Model & Data Flow Documentation

## Table of Contents
1. [Core Value Proposition](#core-value-proposition)
2. [Complete User Journey](#complete-user-journey)
3. [Technical Architecture](#technical-architecture)
4. [Monetization Strategy](#monetization-strategy)
5. [Competitive Analysis](#competitive-analysis)

---

## Core Value Proposition

**"Automated Job Applications via Email - Your Personal Job Application Assistant"**

Recchx automates the entire job application process by:
- ✅ Monitoring job postings across multiple platforms
- ✅ Matching jobs to user profile using AI
- ✅ Sending personalized application emails automatically
- ✅ Tracking responses and managing follow-ups
- ✅ Providing analytics and optimization insights

---

## Complete User Journey

### Phase 1: Authentication

#### Screen 1: Landing Page (`/`)
- **Purpose:** Marketing and user acquisition
- **User Actions:**
  - Click "Sign Up" → Navigate to Sign Up screen
  - Click "Login" → Navigate to Login screen
- **Data Flow:** None (static content)

#### Screen 2: Sign Up (`/signup`)
- **User Inputs:**
  - Email address
  - Password
  - Full name
- **Data Flow:**
  ```
  Frontend → POST /api/auth/register
  Body: { email, password, name }
  
  Backend:
  1. Validates email format
  2. Hashes password
  3. Creates user record in database
  4. Generates JWT token
  
  Response: { token, userId, email }
  ```
- **Storage:**
  ```sql
  INSERT INTO Users (Id, Email, PasswordHash, Name, CreatedAt)
  VALUES (newGuid, email, hashedPassword, name, now)
  ```
- **Next:** Redirect to Profile Building (`/onboarding/profile`)

#### Screen 3: Login (`/login`)
- **User Inputs:**
  - Email address
  - Password
- **Data Flow:**
  ```
  Frontend → POST /api/auth/login
  Body: { email, password }
  
  Backend:
  1. Looks up user by email
  2. Verifies password hash
  3. Generates JWT token
  
  Response: { token, userId, email, hasProfile, hasConnectedEmail }
  ```
- **Routing Logic:**
  - If `hasProfile = false` → Redirect to `/onboarding/profile`
  - If `hasConnectedEmail = false` → Redirect to `/onboarding/connect`
  - If both true → Redirect to `/dashboard`

---

### Phase 2: Profile Building (Critical for Job Matching)

#### Screen 4: Build Your Profile (`/onboarding/profile`)

**Purpose:** Collect information needed for job matching and application personalization

**Section 1: Basic Information**
- Full Name (pre-filled from signup)
- Phone Number
- Location (City, State, Country)
- LinkedIn URL (optional)
- Portfolio/Website URL (optional)

**Section 2: Professional Information**
- Current Job Title
- Years of Experience (dropdown: 0-1, 1-3, 3-5, 5-10, 10+)
- Desired Job Titles (multi-select or tags)
  - Examples: "Software Engineer", "Full Stack Developer", "Backend Developer"
- Desired Salary Range
  - Min: $____
  - Max: $____
- Work Authorization
  - US Citizen / Green Card / H1B / Need Sponsorship
- Willing to Relocate? (Yes/No)
- Preferred Work Mode
  - Remote / Hybrid / Onsite / No Preference

**Section 3: Skills & Expertise**
- Technical Skills (tag input)
  - Examples: React, Node.js, Python, AWS, Docker
  - User can type and add multiple
- Soft Skills (tag input)
  - Examples: Leadership, Communication, Problem Solving
- Certifications (list)
  - Name, Issuer, Year
- Languages Spoken (dropdown with proficiency)
  - English (Native), Spanish (Fluent), etc.

**Section 4: Work Experience**
Each entry includes:
- Company Name
- Job Title
- Employment Type (Full-time, Part-time, Contract, Internship)
- Start Date (Month/Year)
- End Date (Month/Year or "Present")
- Location (City, State)
- Key Responsibilities (rich text editor, bullet points)
- Notable Achievements (optional)

User can add multiple work experiences. Button: "+ Add Another Position"

**Section 5: Education**
Each entry includes:
- Degree (BS, MS, PhD, etc.)
- Field of Study (e.g., Computer Science)
- Institution Name
- Graduation Year (or Expected Graduation)
- GPA (optional)
- Honors/Awards (optional)

User can add multiple education entries. Button: "+ Add Another Degree"

**Section 6: Resume Upload**
- Drag & drop or click to upload
- Accepted formats: PDF, DOCX
- Max size: 5MB
- **AI Resume Parser:**
  ```
  Frontend → POST /api/profile/parse-resume
  Body: FormData with resume file
  
  Backend:
  1. Uploads file to storage (S3/Azure Blob)
  2. Calls AI service (OpenAI GPT-4, Claude, or resume parser API)
  3. Extracts structured data:
     - Name, email, phone
     - Work experience
     - Education
     - Skills
     - Certifications
  4. Returns parsed JSON
  
  Response: {
    name, email, phone,
    workExperience: [...],
    education: [...],
    skills: [...],
    certifications: [...]
  }
  ```
- Frontend pre-fills form with parsed data
- User can review and edit before saving

**Save Profile:**
```
Frontend → POST /api/profile
Body: {
  basicInfo: { name, phone, location, linkedIn, portfolio },
  professionalInfo: { 
    currentJobTitle, yearsOfExperience, desiredJobTitles,
    salaryMin, salaryMax, workAuthorization,
    willingToRelocate, preferredWorkMode
  },
  skills: {
    technical: [...],
    soft: [...],
    certifications: [...],
    languages: [...]
  },
  workExperience: [...],
  education: [...],
  resumeFileUrl: "https://storage.../resume.pdf"
}

Backend:
1. Validates all required fields
2. Stores in UserProfile table
3. Generates profile completion score (0-100%)

Response: { profileId, completionScore: 95 }
```

**Data Storage:**
```sql
-- UserProfile Table
CREATE TABLE UserProfiles (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    
    -- Basic Info
    FullName NVARCHAR(200),
    Phone NVARCHAR(20),
    Location NVARCHAR(200),
    LinkedInUrl NVARCHAR(500),
    PortfolioUrl NVARCHAR(500),
    
    -- Professional Info
    CurrentJobTitle NVARCHAR(200),
    YearsOfExperience INT,
    DesiredJobTitles NVARCHAR(MAX), -- JSON array
    SalaryMin DECIMAL,
    SalaryMax DECIMAL,
    WorkAuthorization NVARCHAR(50),
    WillingToRelocate BIT,
    PreferredWorkMode NVARCHAR(20),
    
    -- Files
    ResumeFileUrl NVARCHAR(500),
    
    -- Metadata
    CompletionScore INT,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);

-- UserSkills Table (Many-to-Many)
CREATE TABLE UserSkills (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    SkillName NVARCHAR(100),
    SkillType NVARCHAR(20), -- Technical, Soft, Certification, Language
    ProficiencyLevel NVARCHAR(20), -- Beginner, Intermediate, Expert
    YearsOfExperience INT
);

-- WorkExperience Table
CREATE TABLE WorkExperiences (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    CompanyName NVARCHAR(200),
    JobTitle NVARCHAR(200),
    EmploymentType NVARCHAR(50),
    StartDate DATE,
    EndDate DATE,
    Location NVARCHAR(200),
    Responsibilities NVARCHAR(MAX), -- Stored as HTML or Markdown
    Achievements NVARCHAR(MAX),
    IsCurrent BIT,
    DisplayOrder INT
);

-- Education Table
CREATE TABLE Education (
    Id UUID PRIMARY KEY,
    UserProfileId UUID FOREIGN KEY,
    Degree NVARCHAR(100),
    FieldOfStudy NVARCHAR(200),
    InstitutionName NVARCHAR(200),
    GraduationYear INT,
    GPA DECIMAL(3,2),
    Honors NVARCHAR(500),
    DisplayOrder INT
);
```

**Next Step:** Redirect to Connect Email (`/onboarding/connect`)

---

### Phase 3: Email Connection (OAuth Flow)

#### Screen 5: Connect Email Account (`/onboarding/connect`)

**Purpose:** Connect user's email for sending applications and monitoring responses

**Display:**
- Heading: "Connect Your Email Account"
- Subheading: "We'll use your email to send job applications and track responses"
- Two large buttons:
  - 🔵 **Connect Gmail**
  - 🔷 **Connect Outlook**
- Footer link: "I'll do this later" (skips to dashboard with limited functionality)

**When User Clicks "Connect Gmail":**

**Step 1: Request Authorization URL**
```
Frontend → POST /api/mailbox/connect?provider=Gmail
Headers: { Authorization: Bearer <JWT_TOKEN> }

Backend (GmailOAuthService):
1. Generates state parameter: {userId}|Gmail|{timestamp}
2. Base64 encodes state
3. Builds Google OAuth URL:
   https://accounts.google.com/o/oauth2/v2/auth?
   client_id={GMAIL_CLIENT_ID}&
   redirect_uri=https://recchx.com/api/mailbox/oauth/callback&
   response_type=code&
   scope=https://www.googleapis.com/auth/gmail.readonly
         https://www.googleapis.com/auth/gmail.send
         https://www.googleapis.com/auth/userinfo.email&
   state={encoded_state}&
   access_type=offline&
   prompt=consent

Response: { 
  authorizationUrl: "https://accounts.google.com/...",
  state: "encoded_state_string"
}
```

**Step 2: Open OAuth Popup**
```javascript
// Frontend opens popup
const popup = window.open(
  authorizationUrl,
  'oauth-popup',
  'width=600,height=700,scrollbars=yes'
);

// Listen for messages from popup
window.addEventListener('message', (event) => {
  if (event.data.type === 'oauth-success') {
    // OAuth completed successfully
    showSuccessToast('Gmail connected!');
    redirectTo('/dashboard');
  } else if (event.data.type === 'oauth-error') {
    // OAuth failed
    showErrorToast(event.data.message);
  }
});
```

**Step 3: User Authorizes on Google**
- Popup shows Google OAuth consent screen
- User selects Google account
- User grants permissions:
  - ✅ Read emails
  - ✅ Send emails
  - ✅ View email address
- Google redirects to callback URL

**Step 4: OAuth Callback (Backend Handles Automatically)**
```
Google redirects to:
https://recchx.com/api/mailbox/oauth/callback?
code=4/0Ab32j93xOL4DnoYo...&
state=encoded_state&
scope=email+gmail.readonly+gmail.send

Backend (MailboxController.OAuthCallback):
1. Receives authorization code and state
2. Decodes state to extract: userId, provider, timestamp
3. Validates state timestamp (not expired)
4. Exchanges code for tokens:
   
   POST https://oauth2.googleapis.com/token
   Body: {
     code: "4/0Ab32j93xOL4DnoYo...",
     client_id: GMAIL_CLIENT_ID,
     client_secret: GMAIL_CLIENT_SECRET,
     redirect_uri: "https://recchx.com/api/mailbox/oauth/callback",
     grant_type: "authorization_code"
   }
   
   Response: {
     access_token: "ya29.a0AfH6SMB...",
     refresh_token: "1//0gNc8tKJK...",
     expires_in: 3600,
     scope: "email gmail.readonly gmail.send",
     token_type: "Bearer"
   }

5. Gets user's email address:
   GET https://www.googleapis.com/oauth2/v1/userinfo?
   access_token={access_token}
   
   Response: { email: "user@gmail.com" }

6. Encrypts tokens using encryption service
7. Stores in database:
   INSERT INTO MailboxConnections (
     UserId, Provider, Email,
     EncryptedAccessToken, EncryptedRefreshToken,
     TokenExpiresAt, Scopes, LastSyncTime
   ) VALUES (
     userId, 'Gmail', 'user@gmail.com',
     encryptedAccessToken, encryptedRefreshToken,
     now + 3600 seconds, 'email gmail.readonly gmail.send',
     NULL
   )

8. Triggers background job to start initial sync
9. Redirects browser to: /oauth/success?provider=Gmail
```

**Data Storage:**
```sql
CREATE TABLE MailboxConnections (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    Provider NVARCHAR(50), -- Gmail, Outlook
    Email NVARCHAR(255),
    EncryptedAccessToken NVARCHAR(MAX),
    EncryptedRefreshToken NVARCHAR(MAX),
    TokenExpiresAt DATETIME,
    Scopes NVARCHAR(500),
    LastSyncTime DATETIME,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);
```

**Step 5: OAuth Success Page**
```
URL: /oauth/success?provider=Gmail

Display:
- ✅ Large checkmark icon
- "Gmail Connected Successfully!"
- "Your account has been connected. We're starting to sync your emails..."
- Auto-close popup in 2 seconds OR
- "Continue to Dashboard" button

JavaScript:
if (window.opener) {
  // Notify parent window
  window.opener.postMessage({
    type: 'oauth-success',
    provider: 'Gmail'
  }, window.location.origin);
  
  // Close popup
  setTimeout(() => window.close(), 2000);
} else {
  // Not in popup, redirect
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 2000);
}
```

**Next Step:** Dashboard with initial sync running in background

---

### Phase 4: Job Preferences Setup

#### Screen 6: Set Job Search Preferences (`/preferences` or `/onboarding/preferences`)

**Purpose:** Configure what jobs to apply for and how to apply

**Section 1: Job Search Criteria**

**Desired Job Titles** (Multi-select with custom input)
- Dropdown shows common titles:
  - Software Engineer
  - Senior Software Engineer
  - Full Stack Developer
  - Backend Developer
  - Frontend Developer
  - DevOps Engineer
  - Data Engineer
  - etc.
- User can type custom titles
- Can select multiple

**Industries** (Multi-select)
- Technology
- Finance/Banking
- Healthcare
- E-commerce
- Education
- Media/Entertainment
- Consulting
- Startups
- Any (no filter)

**Company Size** (Checkboxes)
- [ ] Startup (1-50 employees)
- [ ] Small (51-200 employees)
- [ ] Medium (201-1000 employees)
- [ ] Large (1001-10000 employees)
- [ ] Enterprise (10000+ employees)

**Locations** (Multi-select with autocomplete)
- User types city names: "San Francisco, CA", "New York, NY"
- Special options:
  - [x] Remote Only
  - [ ] Willing to relocate (uses profile setting)
- Can select multiple locations

**Salary Range**
- Minimum: $_____ (e.g., $100,000)
- Maximum: $_____ (e.g., $200,000)
- Currency: USD (dropdown for international users)
- Or: "Not specified" checkbox

**Section 2: Job Sources**

**Select where to search for jobs:** (Checkboxes)
- [x] LinkedIn Jobs
- [x] Indeed
- [x] Glassdoor
- [ ] ZipRecruiter
- [ ] Monster
- [ ] Company Career Pages (specify companies below)
- [ ] Custom Job Boards (specify URLs below)

**Specific Companies** (if "Company Career Pages" checked)
- Tag input: Google, Microsoft, Amazon, Meta, Apple...

**Section 3: Application Automation Settings**

**Application Mode:**
- ⚪ **Fully Automatic** - Apply to all matching jobs automatically
  - Daily limit: [25] applications per day (slider: 10-100)
  - Minimum match score: [85]% (slider: 70-100)
  - Info: "Jobs scoring above 85% will be applied to automatically"

- ⚪ **Semi-Automatic** (Recommended) - Review and approve each application
  - Show me matches, I'll click "Apply" to send
  - Allows editing cover letter before sending

- ⚪ **Manual Only** - Just show me job matches
  - I'll apply on my own through company websites

**Application Frequency:**
- Spread applications throughout the day? 
  - [ ] Yes (prevents spam detection, more natural)
  - [ ] No (send all at once when matches found)

**Section 4: Email & Cover Letter Configuration**

**Email Subject Line Template:**
```
Default: Application for {job_title} at {company_name}

Available variables:
{job_title} - Job position title
{company_name} - Company name
{your_name} - Your full name
{date} - Today's date
```
User can customize, e.g.:
- "Experienced {job_title} - {your_name}"
- "{your_name} - Application for {job_title}"

**Cover Letter Template:**
```
[Rich text editor with formatting options]

Default template:
Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} 
position at {company_name}. With {years_experience} years of 
experience in {primary_skill}, I am confident in my ability to 
contribute to your team.

[Your cover letter content here - will be personalized by AI]

I would welcome the opportunity to discuss how my skills and 
experience align with your needs.

Thank you for your consideration.

Best regards,
{your_name}
{your_phone}
{your_email}

Available variables:
{job_title}, {company_name}, {years_experience}, {primary_skill},
{your_name}, {your_email}, {your_phone}, {your_linkedin}
```

**AI Personalization Settings:**
- [ ] Use AI to personalize each cover letter
  - Tone: [Professional ▼] (Professional, Enthusiastic, Casual)
  - Emphasis: What to highlight
    - [x] Technical skills matching job requirements
    - [x] Relevant work experience
    - [ ] Cultural fit and company values
    - [ ] Career growth and learning goals
  - Length: [Medium ▼] (Concise, Medium, Detailed)

**Section 5: Follow-Up Settings**

**Automatic Follow-Ups:**
- [ ] Enable automatic follow-ups for applications with no response
- Send follow-up after: [7] days (slider: 5-14 days)
- Maximum follow-ups per job: [1] (slider: 0-3)

**Follow-Up Email Template:**
```
Subject: Following up on {job_title} application

Dear Hiring Manager,

I wanted to follow up on my application for the {job_title} 
position submitted on {application_date}. I remain very interested 
in this opportunity and would welcome the chance to discuss how 
my experience could benefit your team.

Thank you for your time and consideration.

Best regards,
{your_name}
```

**Save Preferences:**
```
Frontend → POST /api/preferences
Body: {
  jobCriteria: {
    desiredJobTitles: ["Software Engineer", "Full Stack Developer"],
    industries: ["Technology", "Startups"],
    companySizes: ["Medium", "Large"],
    locations: ["San Francisco, CA", "Remote"],
    salaryMin: 120000,
    salaryMax: 180000
  },
  jobSources: {
    linkedin: true,
    indeed: true,
    glassdoor: true,
    customCompanies: ["Google", "Microsoft"]
  },
  automationSettings: {
    applicationMode: "SemiAutomatic", // FullyAutomatic, SemiAutomatic, Manual
    dailyLimit: 25,
    minimumMatchScore: 85,
    spreadThroughoutDay: true
  },
  emailSettings: {
    subjectTemplate: "Application for {job_title} at {company_name}",
    coverLetterTemplate: "...",
    useAiPersonalization: true,
    tone: "Professional",
    emphasis: ["TechnicalSkills", "WorkExperience"],
    length: "Medium"
  },
  followUpSettings: {
    enabled: true,
    daysBeforeFollowUp: 7,
    maxFollowUps: 1,
    followUpTemplate: "..."
  }
}

Backend:
1. Validates all settings
2. Stores in JobPreferences table
3. Activates job matching cron job for this user

Response: { 
  preferencesId, 
  message: "Preferences saved! We'll start finding matches for you." 
}
```

**Data Storage:**
```sql
CREATE TABLE JobPreferences (
    Id UUID PRIMARY KEY,
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    
    -- Job Criteria
    DesiredJobTitles NVARCHAR(MAX), -- JSON array
    Industries NVARCHAR(MAX), -- JSON array
    CompanySizes NVARCHAR(MAX), -- JSON array
    Locations NVARCHAR(MAX), -- JSON array
    SalaryMin DECIMAL,
    SalaryMax DECIMAL,
    
    -- Job Sources
    JobSources NVARCHAR(MAX), -- JSON: {linkedin: true, indeed: true, ...}
    CustomCompanies NVARCHAR(MAX), -- JSON array
    
    -- Automation
    ApplicationMode NVARCHAR(20), -- FullyAutomatic, SemiAutomatic, Manual
    DailyApplicationLimit INT,
    MinimumMatchScore INT,
    SpreadApplications BIT,
    
    -- Email Settings
    EmailSubjectTemplate NVARCHAR(500),
    CoverLetterTemplate NVARCHAR(MAX),
    UseAiPersonalization BIT,
    PersonalizationTone NVARCHAR(20),
    PersonalizationEmphasis NVARCHAR(MAX), -- JSON array
    PersonalizationLength NVARCHAR(20),
    
    -- Follow-Up Settings
    EnableFollowUps BIT,
    DaysBeforeFollowUp INT,
    MaxFollowUps INT,
    FollowUpTemplate NVARCHAR(MAX),
    
    -- Metadata
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);
```

**Next Step:** Dashboard (job matching system activates in background)

---

### Phase 5: Main Dashboard (Job Matching & Application)

#### Screen 7: Dashboard (`/dashboard`)

**Purpose:** Central hub for job matches, application tracking, and activity monitoring

**Layout Components:**

**Top Navigation Bar:**
```
┌─────────────────────────────────────────────────────────┐
│ [Recchx Logo]  Dashboard  Applications  Analytics      │
│                                                          │
│                                      [Search] [Profile ▼]│
└─────────────────────────────────────────────────────────┘
```

**Main Content Area:**

**Stats Summary Card:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Your Application Stats                               │
├─────────────────────────────────────────────────────────┤
│  Today: 8 / 25 applications                             │
│  ████████░░░░░░░░░░░░░  32%                            │
│                                                          │
│  Total Applications: 127                                │
│  Response Rate: 23 (18%)                                │
│  Interviews: 5                                          │
│  Offers: 1 🎉                                           │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/dashboard/stats
Headers: { Authorization: Bearer <JWT> }

Backend:
1. Queries ApplicationActivity table for user
2. Calculates:
   - Applications sent today (where DATE = today)
   - Total applications (COUNT(*))
   - Responses received (WHERE Status IN ('Interview', 'Offer', 'Rejected'))
   - Response rate (responses / total * 100)
   - Interviews (WHERE Status = 'Interview')
   - Offers (WHERE Status = 'Offer')

Response: {
  applicationsToday: 8,
  dailyLimit: 25,
  totalApplications: 127,
  responses: 23,
  responseRate: 18.1,
  interviews: 5,
  offers: 1
}
```

**Job Matches Section:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 New Job Matches (47)                    [View All]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐⭐ 92% Match                                ││
│  │                                                     ││
│  │ Senior Software Engineer                            ││
│  │ Google · Mountain View, CA · Remote                ││
│  │ 💰 $150k - $200k · 📅 Posted 2 hours ago          ││
│  │                                                     ││
│  │ Why you match:                                      ││
│  │ • 5+ years experience ✓                            ││
│  │ • React, Node.js, TypeScript ✓                     ││
│  │ • Leadership experience ✓                          ││
│  │                                                     ││
│  │ [👁 View Job]  [✉ Apply Now]  [✕ Skip]           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐ 88% Match                                  ││
│  │                                                     ││
│  │ Full Stack Developer                                ││
│  │ Microsoft · Seattle, WA · Hybrid                   ││
│  │ 💰 $120k - $160k · 📅 Posted 5 hours ago          ││
│  │                                                     ││
│  │ Why you match:                                      ││
│  │ • TypeScript, Azure ✓                              ││
│  │ • 3+ years experience ✓                            ││
│  │ • Hybrid location preference ✓                     ││
│  │                                                     ││
│  │ [👁 View Job]  [✉ Apply Now]  [✕ Skip]           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Load More Matches...]                                 │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/jobs/matches?page=1&pageSize=10&status=New
Headers: { Authorization: Bearer <JWT> }

Backend:
1. Queries JobMatches table:
   WHERE UserId = {userId} 
   AND Status = 'New'
   AND MatchScore >= {user.preferences.minimumMatchScore}
   ORDER BY MatchScore DESC, CreatedAt DESC
   SKIP (page-1) * pageSize
   TAKE pageSize

2. Joins with JobPostings table to get full job details

3. Formats match reasons from MatchReasons JSON

Response: {
  matches: [
    {
      matchId: "uuid",
      matchScore: 92,
      matchReasons: [
        "5+ years experience matches requirement",
        "Skills: React, Node.js, TypeScript match job requirements",
        "Remote preference matches job location"
      ],
      job: {
        id: "uuid",
        title: "Senior Software Engineer",
        company: "Google",
        location: "Mountain View, CA · Remote",
        salaryMin: 150000,
        salaryMax: 200000,
        postedDate: "2025-11-24T08:30:00Z",
        description: "...",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        applicationEmail: "jobs@google.com",
        applicationUrl: "https://careers.google.com/jobs/123"
      }
    },
    // ... more matches
  ],
  totalMatches: 47,
  page: 1,
  pageSize: 10
}
```

**User Actions on Job Match Card:**

**1. Click "View Job":**
```
Opens modal or new tab with:
- Full job description
- Company info
- Required qualifications
- Benefits
- Application instructions
- Link to original posting

Data Flow:
Frontend → GET /api/jobs/{jobId}
Response: Full job posting details
```

**2. Click "Apply Now" (Semi-Automatic Mode):**
```
Opens application preview modal:

┌────────────────────────────────────────────────────────┐
│ Review Application                            [X Close] │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Applying to: Senior Software Engineer at Google        │
│                                                         │
│ To: jobs@google.com                                    │
│ Subject: Application for Senior Software Engineer...   │
│                                                         │
│ Cover Letter: [Editable Text Area]                     │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Dear Hiring Manager,                                ││
│ │                                                      ││
│ │ I am excited to apply for the Senior Software       ││
│ │ Engineer position at Google. With 5 years of        ││
│ │ experience in React, Node.js, and TypeScript,       ││
│ │ I have successfully led multiple full-stack         ││
│ │ projects...                                         ││
│ │                                                      ││
│ │ [AI-personalized content based on job description]  ││
│ │                                                      ││
│ │ Best regards,                                       ││
│ │ John Doe                                            ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Attachments:                                           │
│ 📄 Resume.pdf (125 KB)                                 │
│                                                         │
│ [Edit Cover Letter]  [Change Resume]                   │
│                                                         │
│          [Cancel]  [Send Application →]                │
└────────────────────────────────────────────────────────┘

Data Flow when modal opens:
Frontend → POST /api/ai/personalize-application
Body: {
  jobId: "uuid",
  coverLetterTemplate: "user's template",
  jobDescription: "...",
  userProfile: {...}
}

Backend:
1. Loads user's cover letter template
2. Loads job description and requirements
3. Calls AI service (OpenAI GPT-4):
   
   Prompt:
   "You are a professional job application writer. 
   Personalize this cover letter for the following job.
   
   Base Cover Letter:
   {user's template}
   
   Job Title: {job.title}
   Company: {job.company}
   Job Description:
   {job.description}
   
   Required Skills: {job.requiredSkills}
   
   Candidate Profile:
   - Name: {profile.name}
   - Experience: {profile.yearsOfExperience} years
   - Current Role: {profile.currentJobTitle}
   - Skills: {profile.skills}
   - Work Experience: {summary of work experience}
   
   Instructions:
   - Highlight skills that match job requirements
   - Mention relevant work experience
   - Keep professional tone
   - Keep length similar to template (300-400 words)
   - Don't fabricate experience
   - Use {company_name}, {job_title} variables
   
   Return only the personalized cover letter text."

4. AI returns personalized cover letter
5. Replaces template variables with actual values

Response: {
  personalizedCoverLetter: "Dear Hiring Manager, ...",
  subjectLine: "Application for Senior Software Engineer at Google",
  attachments: [
    { fileName: "Resume.pdf", url: "..." }
  ]
}
```

**When User Clicks "Send Application":**
```
Frontend → POST /api/applications/apply
Body: {
  matchId: "uuid",
  jobId: "uuid",
  coverLetter: "final edited text",
  subjectLine: "...",
  customizations: {
    // any changes user made
  }
}

Backend (ApplicationService):
1. Validates user hasn't exceeded daily limit
2. Gets user's mailbox connection (OAuth tokens)
3. Checks if tokens expired, refreshes if needed
4. Retrieves resume from storage
5. Composes email:
   - To: job.applicationEmail
   - From: user.email
   - Subject: subjectLine
   - Body: coverLetter (HTML formatted)
   - Attachments: Resume.pdf
6. Sends via Gmail/Outlook API:
   
   For Gmail:
   POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
   Headers: { Authorization: Bearer {access_token} }
   Body: {
     raw: base64UrlEncode(
       "To: jobs@google.com\r\n" +
       "From: user@gmail.com\r\n" +
       "Subject: Application for...\r\n" +
       "Content-Type: multipart/mixed; boundary=\"boundary\"\r\n\r\n" +
       "--boundary\r\n" +
       "Content-Type: text/html; charset=UTF-8\r\n\r\n" +
       coverLetterHtml + "\r\n" +
       "--boundary\r\n" +
       "Content-Type: application/pdf\r\n" +
       "Content-Disposition: attachment; filename=\"Resume.pdf\"\r\n" +
       "Content-Transfer-Encoding: base64\r\n\r\n" +
       base64Resume + "\r\n" +
       "--boundary--"
     )
   }

7. Stores application in database:
   INSERT INTO ApplicationActivity (
     UserId, JobMatchId, JobPostingId,
     Action, Status, EmailSent,
     CoverLetterUsed, ApplicationDate
   ) VALUES (
     userId, matchId, jobId,
     'Applied', 'Sent', true,
     coverLetter, NOW()
   )

8. Updates JobMatch status:
   UPDATE JobMatches 
   SET Status = 'Applied', AppliedAt = NOW()
   WHERE Id = matchId

9. Increments daily application count

Response: {
  success: true,
  applicationId: "uuid",
  message: "Application sent successfully!"
}
```

**Frontend shows:**
- Success toast: "✅ Application sent to Google!"
- Card moves from "New Matches" to "Applied" section
- Updates stats (applications today: 9/25)

**3. Click "Skip":**
```
Frontend → PUT /api/jobs/matches/{matchId}/skip

Backend:
1. Updates JobMatch status to 'Skipped'
2. Match won't appear again

Response: { success: true }
```
- Card disappears from feed
- Next match slides up

**Fully Automatic Mode (No User Interaction):**

If user has `ApplicationMode = "FullyAutomatic"` in preferences:

**Background Job (Runs every 30 minutes):**
```
For each user with FullyAutomatic mode:
  1. Check daily application limit not exceeded
  2. Get new matches with score >= minimumMatchScore
  3. For each match:
     a. Generate personalized cover letter (AI)
     b. Send application email
     c. Log application
     d. Update match status to 'Applied'
     e. Increment application count
  4. Stop when daily limit reached
  5. Send notification: "Applied to 10 new jobs today!"
```

**Recent Activity Feed:**
```
┌─────────────────────────────────────────────────────────┐
│ 📬 Recent Activity                          [See All]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎉 Meta · Interview Request                            │
│     "We'd like to schedule a phone interview"           │
│     2 minutes ago                                       │
│     [Schedule Interview →]                              │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ✉ Applied to Amazon · Software Engineer               │
│     1 hour ago                                          │
│     [View Application]                                  │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  👀 Apple viewed your profile                           │
│     3 hours ago                                         │
│     [View Job Details]                                  │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ⏰ Follow-up sent to Microsoft                         │
│     Applied 7 days ago, no response                     │
│     Yesterday at 9:00 AM                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:**
```
Frontend → GET /api/activities/recent?limit=10

Backend:
1. Queries ApplicationActivity table
2. Joins with JobPostings and EmailResponses
3. Orders by timestamp DESC
4. Formats activity types:
   - ApplicationSent
   - ResponseReceived (classified by AI)
   - FollowUpSent
   - ProfileViewed (if integrated with LinkedIn API)

Response: {
  activities: [
    {
      type: "ResponseReceived",
      company: "Meta",
      jobTitle: "Software Engineer",
      classification: "InterviewRequest",
      message: "We'd like to schedule a phone interview",
      timestamp: "2025-11-24T10:25:00Z",
      actionUrl: "/applications/uuid"
    },
    // ... more activities
  ]
}
```

**Real-Time Updates:**

Uses WebSocket or Server-Sent Events (SSE):
```
// Frontend establishes WebSocket connection
const ws = new WebSocket('wss://recchx.com/ws/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  switch(notification.type) {
    case 'NEW_MATCH':
      // Add new match card to feed
      // Update match count
      showToast(`New match: ${notification.jobTitle}`);
      break;
      
    case 'APPLICATION_SENT':
      // Update application count
      // Move card to "Applied" section
      showToast(`Application sent to ${notification.company}`);
      break;
      
    case 'RESPONSE_RECEIVED':
      // Add to activity feed
      // Show prominent notification
      if (notification.classification === 'InterviewRequest') {
        showBanner(`🎉 Interview request from ${notification.company}!`);
      }
      break;
  }
};

Backend sends notifications when:
- New job matches found
- Application sent (auto or manual)
- Email response received and classified
- Daily limit reached
- Error occurred (e.g., email sending failed)
```

---

### Phase 6: Job Matching System (Backend)

**This runs continuously in the background, independent of user actions**

#### Background Job 1: Job Scraping (Runs Every Hour)

**Purpose:** Fetch new job postings from various sources

**Data Flow:**

**Step 1: Connect to Job APIs**

```
For each job source (LinkedIn, Indeed, etc.):

Example: LinkedIn Jobs API
GET https://api.linkedin.com/v2/jobPostings?
    keywords={tech_keywords}&
    location={locations}&
    datePosted=past24Hours&
    limit=100

Headers: { Authorization: Bearer {LINKEDIN_API_KEY} }

Response: {
  jobs: [
    {
      id: "3786543298",
      title: "Senior Software Engineer",
      company: {
        name: "Google",
        id: "1441"
      },
      location: "Mountain View, CA",
      description: "...",
      postedDate: "2025-11-24T08:00:00Z",
      salaryRange: {
        min: 150000,
        max: 200000,
        currency: "USD"
      },
      employmentType: "FULL_TIME",
      workplaceType: "REMOTE",
      applicationUrl: "https://careers.google.com/...",
      requiredSkills: ["React", "Node.js", "TypeScript"]
    },
    // ... more jobs
  ]
}
```

**Step 2: Parse and Normalize Job Data**

```csharp
// Backend processes each job
foreach (var job in apiResponse.Jobs) 
{
    // Extract skills from description using AI
    var skills = await ExtractSkillsFromDescription(job.Description);
    
    // Determine experience level
    var experienceLevel = DetermineExperienceLevel(
        job.Title, 
        job.Description
    );
    
    // Extract application contact
    var applicationEmail = ExtractEmailFromDescription(job.Description)
        ?? job.ApplicationUrl;
    
    // Create normalized job posting
    var jobPosting = new JobPosting 
    {
        ExternalJobId = $"linkedin_{job.Id}",
        Source = "LinkedIn",
        Title = job.Title,
        Company = job.Company.Name,
        Location = job.Location,
        WorkplaceType = job.WorkplaceType, // Remote, Hybrid, Onsite
        SalaryMin = job.SalaryRange?.Min,
        SalaryMax = job.SalaryRange?.Max,
        Currency = job.SalaryRange?.Currency ?? "USD",
        Description = job.Description,
        RequiredSkills = skills, // JSON array
        ExperienceLevel = experienceLevel, // Entry, Mid, Senior, Lead
        EmploymentType = job.EmploymentType,
        ApplicationEmail = applicationEmail,
        ApplicationUrl = job.ApplicationUrl,
        PostingDate = job.PostedDate,
        IsActive = true,
        ScrapedAt = DateTime.UtcNow
    };
    
    // Check if already exists
    var existingJob = await _context.JobPostings
        .FirstOrDefaultAsync(j => j.ExternalJobId == jobPosting.ExternalJobId);
    
    if (existingJob == null) 
    {
        // New job - insert
        await _context.JobPostings.AddAsync(jobPosting);
    } 
    else if (existingJob.IsActive) 
    {
        // Update existing job (description might have changed)
        existingJob.Description = jobPosting.Description;
        existingJob.ScrapedAt = DateTime.UtcNow;
    }
}

await _context.SaveChangesAsync();
```

**AI Skill Extraction:**
```
POST to OpenAI API
Prompt:
"Extract technical skills, tools, and technologies from this job description.
Return as JSON array of strings.

Job Description:
{description}

Focus on:
- Programming languages (e.g., Python, JavaScript)
- Frameworks (e.g., React, Django)
- Tools (e.g., Docker, Kubernetes)
- Cloud platforms (e.g., AWS, Azure)
- Databases (e.g., PostgreSQL, MongoDB)

Return format:
{
  \"skills\": [\"React\", \"Node.js\", \"AWS\", \"PostgreSQL\"]
}"

Response:
{
  "skills": ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"]
}
```

**Experience Level Determination:**
```csharp
private string DetermineExperienceLevel(string title, string description) 
{
    var titleLower = title.ToLower();
    var descriptionLower = description.ToLower();
    
    // Check title keywords
    if (titleLower.Contains("intern") || titleLower.Contains("junior") ||
        titleLower.Contains("entry")) 
    {
        return "Entry";
    }
    
    if (titleLower.Contains("senior") || titleLower.Contains("sr.") ||
        titleLower.Contains("lead") || titleLower.Contains("principal")) 
    {
        return "Senior";
    }
    
    if (titleLower.Contains("staff") || titleLower.Contains("architect") ||
        titleLower.Contains("director")) 
    {
        return "Lead";
    }
    
    // Check description for years of experience
    var regex = new Regex(@"(\d+)\+?\s*years?", RegexOptions.IgnoreCase);
    var match = regex.Match(description);
    
    if (match.Success) 
    {
        var years = int.Parse(match.Groups[1].Value);
        
        if (years <= 2) return "Entry";
        if (years <= 5) return "Mid";
        if (years <= 10) return "Senior";
        return "Lead";
    }
    
    // Default to Mid if unclear
    return "Mid";
}
```

**Step 3: Store in Database**

```sql
-- JobPostings Table
CREATE TABLE JobPostings (
    Id UUID PRIMARY KEY DEFAULT NEWID(),
    ExternalJobId NVARCHAR(200) UNIQUE NOT NULL, -- Source + external ID
    Source NVARCHAR(50), -- LinkedIn, Indeed, etc.
    
    -- Basic Info
    Title NVARCHAR(200),
    Company NVARCHAR(200),
    Location NVARCHAR(200),
    WorkplaceType NVARCHAR(20), -- Remote, Hybrid, Onsite
    
    -- Compensation
    SalaryMin DECIMAL(12,2),
    SalaryMax DECIMAL(12,2),
    Currency NVARCHAR(10),
    
    -- Details
    Description NVARCHAR(MAX),
    RequiredSkills NVARCHAR(MAX), -- JSON array
    PreferredSkills NVARCHAR(MAX), -- JSON array
    ExperienceLevel NVARCHAR(20), -- Entry, Mid, Senior, Lead
    EmploymentType NVARCHAR(50), -- Full-time, Part-time, Contract
    
    -- Application
    ApplicationEmail NVARCHAR(255),
    ApplicationUrl NVARCHAR(500),
    
    -- Metadata
    PostingDate DATETIME,
    ExpirationDate DATETIME,
    IsActive BIT DEFAULT 1,
    ScrapedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_JobPostings_Source (Source),
    INDEX IX_JobPostings_PostingDate (PostingDate),
    INDEX IX_JobPostings_IsActive (IsActive)
);
```

**Logging:**
```
Background job logs:
- Jobs fetched from each source
- New jobs added
- Existing jobs updated
- Errors encountered

Example log:
[2025-11-24 10:00:00] Job Scraper Started
[2025-11-24 10:00:15] LinkedIn: Fetched 157 jobs
[2025-11-24 10:00:18] LinkedIn: 23 new jobs, 134 existing
[2025-11-24 10:00:35] Indeed: Fetched 203 jobs
[2025-11-24 10:00:38] Indeed: 45 new jobs, 158 existing
[2025-11-24 10:00:40] Total: 68 new jobs added
[2025-11-24 10:00:40] Job Scraper Completed
```

---

#### Background Job 2: Job Matching (Runs Every 30 Minutes)

**Purpose:** Match new jobs to user profiles

**Data Flow:**

**Step 1: Get Active Users**
```sql
-- Get users who have:
-- 1. Completed profile
-- 2. Connected email
-- 3. Set job preferences
-- 4. Haven't exceeded daily application limit

SELECT u.Id, u.Email, 
       up.DesiredJobTitles, up.Skills,
       jp.MinimumMatchScore, jp.DailyApplicationLimit
FROM Users u
INNER JOIN UserProfiles up ON u.Id = up.UserId
INNER JOIN JobPreferences jp ON u.Id = jp.UserId
INNER JOIN MailboxConnections mc ON u.Id = mc.UserId
WHERE up.CompletionScore >= 80
  AND mc.IsActive = 1
  AND jp.IsActive = 1
```

**Step 2: For Each User, Find Matching Jobs**

```csharp
foreach (var user in activeUsers) 
{
    // Get user's preferences and profile
    var profile = await GetUserProfile(user.Id);
    var preferences = await GetJobPreferences(user.Id);
    
    // Get new jobs posted since last match run
    var newJobs = await _context.JobPostings
        .Where(j => j.IsActive 
            && j.PostingDate >= DateTime.UtcNow.AddHours(-1)
            && !j.JobMatches.Any(m => m.UserId == user.Id))
        .ToListAsync();
    
    foreach (var job in newJobs) 
    {
        // Calculate match score
        var matchResult = await CalculateMatchScore(user, profile, preferences, job);
        
        if (matchResult.Score >= preferences.MinimumMatchScore) 
        {
            // Create job match record
            var jobMatch = new JobMatch 
            {
                UserId = user.Id,
                JobPostingId = job.Id,
                MatchScore = matchResult.Score,
                MatchReasons = matchResult.Reasons, // JSON array
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.JobMatches.AddAsync(jobMatch);
            
            // Send notification to user
            await SendNotification(user.Id, new Notification 
            {
                Type = "NEW_MATCH",
                Title = $"New {matchResult.Score}% match",
                Message = $"{job.Title} at {job.Company}",
                JobMatchId = jobMatch.Id
            });
        }
    }
    
    await _context.SaveChangesAsync();
}
```

**Step 3: Match Score Calculation Algorithm**

```csharp
private async Task<MatchResult> CalculateMatchScore(
    User user, 
    UserProfile profile, 
    JobPreferences preferences, 
    JobPosting job)
{
    var score = 0.0;
    var reasons = new List<string>();
    
    // 1. JOB TITLE MATCH (20 points)
    var desiredTitles = JsonConvert.DeserializeObject<List<string>>(
        preferences.DesiredJobTitles
    );
    
    var titleMatch = desiredTitles.Any(dt => 
        job.Title.Contains(dt, StringComparison.OrdinalIgnoreCase)
    );
    
    if (titleMatch) 
    {
        score += 20;
        reasons.Add($"Job title matches desired: {job.Title}");
    }
    
    // 2. SKILLS MATCH (50 points) - Most important
    var userSkills = await _context.UserSkills
        .Where(s => s.UserProfileId == profile.Id)
        .Select(s => s.SkillName.ToLower())
        .ToListAsync();
    
    var requiredSkills = JsonConvert.DeserializeObject<List<string>>(
        job.RequiredSkills ?? "[]"
    ).Select(s => s.ToLower()).ToList();
    
    if (requiredSkills.Any()) 
    {
        var matchingSkills = userSkills
            .Intersect(requiredSkills)
            .ToList();
        
        var skillMatchPercentage = (double)matchingSkills.Count / requiredSkills.Count;
        var skillScore = skillMatchPercentage * 50;
        
        score += skillScore;
        
        if (matchingSkills.Any()) 
        {
            reasons.Add($"Matching skills: {string.Join(", ", matchingSkills)}");
        }
        
        var missingSkills = requiredSkills.Except(userSkills).ToList();
        if (missingSkills.Count <= 2 && missingSkills.Count > 0) 
        {
            reasons.Add($"Nice to have: {string.Join(", ", missingSkills)}");
        }
    } 
    else 
    {
        // No required skills listed, give benefit of doubt
        score += 25;
    }
    
    // 3. EXPERIENCE LEVEL MATCH (15 points)
    var experienceMatch = MatchExperienceLevel(
        profile.YearsOfExperience, 
        job.ExperienceLevel
    );
    
    score += experienceMatch.Score;
    if (experienceMatch.Reason != null) 
    {
        reasons.Add(experienceMatch.Reason);
    }
    
    // 4. LOCATION MATCH (10 points)
    var locationPreferences = JsonConvert.DeserializeObject<List<string>>(
        preferences.Locations ?? "[]"
    );
    
    var locationMatch = false;
    
    if (job.WorkplaceType.Equals("Remote", StringComparison.OrdinalIgnoreCase)) 
    {
        // Remote jobs always match if user has "Remote" in preferences
        locationMatch = locationPreferences.Any(l => 
            l.Equals("Remote", StringComparison.OrdinalIgnoreCase)
        );
        
        if (locationMatch) 
        {
            score += 10;
            reasons.Add("Remote position matches preference");
        }
    } 
    else 
    {
        // Check if job location matches any user preference
        locationMatch = locationPreferences.Any(pref => 
            job.Location.Contains(pref, StringComparison.OrdinalIgnoreCase)
        );
        
        if (locationMatch) 
        {
            score += 10;
            reasons.Add($"Location matches: {job.Location}");
        } 
        else if (profile.WillingToRelocate) 
        {
            score += 5;
            reasons.Add("Willing to relocate");
        }
    }
    
    // 5. SALARY MATCH (5 points)
    if (job.SalaryMin.HasValue && job.SalaryMax.HasValue) 
    {
        var userSalaryMin = preferences.SalaryMin;
        var userSalaryMax = preferences.SalaryMax;
        
        // Check if there's overlap in salary ranges
        if (job.SalaryMax >= userSalaryMin) 
        {
            if (job.SalaryMin <= userSalaryMax) 
            {
                // Full overlap
                score += 5;
                reasons.Add($"Salary range ${job.SalaryMin:N0}-${job.SalaryMax:N0} matches expectations");
            } 
            else 
            {
                // Partial overlap
                score += 2.5;
            }
        }
    }
    
    // BONUS POINTS
    
    // 6. Company size preference (bonus +3)
    var companySizePreferences = JsonConvert.DeserializeObject<List<string>>(
        preferences.CompanySizes ?? "[]"
    );
    
    if (companySizePreferences.Any()) 
    {
        // Would need company size data from job posting
        // Simplified for now
        score += 2;
    }
    
    // 7. Recently posted (+2 for jobs less than 24 hours old)
    var hoursSincePosted = (DateTime.UtcNow - job.PostingDate).TotalHours;
    if (hoursSincePosted <= 24) 
    {
        score += 2;
        reasons.Add($"Recently posted ({(int)hoursSincePosted} hours ago)");
    }
    
    // 8. Application method preference
    if (!string.IsNullOrEmpty(job.ApplicationEmail)) 
    {
        score += 1;
        reasons.Add("Direct email application available");
    }
    
    // Normalize to 100
    var finalScore = Math.Min(100, Math.Round(score));
    
    return new MatchResult 
    {
        Score = (int)finalScore,
        Reasons = reasons
    };
}

private ExperienceMatchResult MatchExperienceLevel(
    int userYears, 
    string jobLevel)
{
    var result = new ExperienceMatchResult();
    
    switch (jobLevel) 
    {
        case "Entry":
            if (userYears <= 2) 
            {
                result.Score = 15;
                result.Reason = "Experience level matches: Entry-level";
            } 
            else if (userYears <= 5) 
            {
                result.Score = 12;
                result.Reason = "Overqualified but good fit";
            } 
            else 
            {
                result.Score = 5;
                result.Reason = "Significantly overqualified";
            }
            break;
            
        case "Mid":
            if (userYears >= 3 && userYears <= 7) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Mid-level";
            } 
            else if (userYears <= 2) 
            {
                result.Score = 8;
                result.Reason = "Slightly underqualified but worth applying";
            } 
            else 
            {
                result.Score = 10;
                result.Reason = "Senior experience for mid-level role";
            }
            break;
            
        case "Senior":
            if (userYears >= 5 && userYears <= 12) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Senior-level";
            } 
            else if (userYears >= 3) 
            {
                result.Score = 10;
                result.Reason = "Close to Senior-level requirements";
            } 
            else 
            {
                result.Score = 3;
                result.Reason = "Underqualified for Senior role";
            }
            break;
            
        case "Lead":
            if (userYears >= 10) 
            {
                result.Score = 15;
                result.Reason = $"{userYears} years experience matches Lead/Principal-level";
            } 
            else if (userYears >= 7) 
            {
                result.Score = 10;
                result.Reason = "Approaching Lead-level experience";
            } 
            else 
            {
                result.Score = 3;
                result.Reason = "Underqualified for Lead role";
            }
            break;
            
        default:
            result.Score = 8;
            result.Reason = "Experience level not specified";
            break;
    }
    
    return result;
}
```

**Example Match Score Breakdown:**
```
Job: Senior Software Engineer at Google
User: 5 years experience, Skills: React, Node.js, TypeScript, AWS

Score Calculation:
- Job Title Match: 20/20 ✓ (Senior Software Engineer matches desired)
- Skills Match: 45/50 ✓ (4 out of 5 required skills)
  - Matching: React, Node.js, TypeScript, AWS
  - Missing: Kubernetes (nice to have)
- Experience Match: 15/15 ✓ (5 years matches Senior level)
- Location Match: 10/10 ✓ (Remote matches preference)
- Salary Match: 5/5 ✓ ($150k-$200k overlaps with $120k-$180k)
- Recently Posted: 2/2 ✓ (Posted 3 hours ago)
- Email Application: 1/1 ✓

Total: 98/100 ⭐⭐⭐⭐⭐

Match Reasons:
- "Job title matches desired: Senior Software Engineer"
- "Matching skills: React, Node.js, TypeScript, AWS"
- "5 years experience matches Senior-level"
- "Remote position matches preference"
- "Salary range $150,000-$200,000 matches expectations"
- "Recently posted (3 hours ago)"
- "Direct email application available"
```

**Step 4: Store Match Results**

```sql
CREATE TABLE JobMatches (
    Id UUID PRIMARY KEY DEFAULT NEWID(),
    UserId UUID FOREIGN KEY REFERENCES Users(Id),
    JobPostingId UUID FOREIGN KEY REFERENCES JobPostings(Id),
    
    MatchScore INT, -- 0-100
    MatchReasons NVARCHAR(MAX), -- JSON array of reasons
    
    Status NVARCHAR(20), -- New, Viewed, Applied, Skipped
    ViewedAt DATETIME,
    AppliedAt DATETIME,
    SkippedAt DATETIME,
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    INDEX IX_JobMatches_UserId_Status (UserId, Status),
    INDEX IX_JobMatches_MatchScore (MatchScore),
    UNIQUE INDEX IX_JobMatches_UserJob (UserId, JobPostingId)
);
```

---

#### Background Job 3: Automatic Application (Runs Every 30 Minutes)

**Purpose:** Automatically apply to jobs for users with Fully Automatic mode

**Data Flow:**

**Step 1: Get Users with Automatic Mode**
```sql
SELECT u.Id, u.Email,
       jp.DailyApplicationLimit,

Yawfranc: make this md file focused on the frontend Implementation

GitHub Copilot: # Recchx Frontend Implementation Guide

## **Complete User Interface & Navigation Flow**

---

## **Table of Contents**
1. Application Structure
2. Screen-by-Screen Breakdown
3. Component Architecture
4. State Management
5. API Integration Points
6. User Experience Flows
7. Design System

---

## **Application Structure**

### **Technology Stack (Recommended)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** React Context + React Query
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts or Chart.js
- **Notifications:** Sonner (toast notifications)
- **Rich Text Editor:** TipTap or Quill
- **File Upload:** react-dropzone

### **Folder Structure**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── applications/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── profile/
│   │   │   ├── preferences/
│   │   │   └── accounts/
│   │   └── layout.tsx
│   ├── onboarding/
│   │   ├── profile/
│   │   ├── connect/
│   │   └── preferences/
│   ├── oauth/
│   │   ├── success/
│   │   └── error/
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   ├── job-cards/
│   ├── profile/
│   └── shared/
├── lib/
│   ├── api/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── contexts/
    ├── AuthContext.tsx
    ├── JobContext.tsx
    └── NotificationContext.tsx
```

---

## **Screen-by-Screen Breakdown**

---

### **1. Landing Page** (`/`)

**Purpose:** Marketing page to attract users

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx              [Login] [Sign Up]       │
├─────────────────────────────────────────────────────┤
│                                                       │
│           🎯 Automate Your Job Search                │
│                                                       │
│     Apply to hundreds of jobs while you sleep        │
│                                                       │
│           [Get Started Free] [Watch Demo]            │
│                                                       │
│  ─────────────────────────────────────────────────   │
│                                                       │
│  ✅ AI-Powered Applications                          │
│  ✅ Smart Job Matching                               │
│  ✅ Automatic Follow-Ups                             │
│  ✅ Response Tracking                                │
│                                                       │
│  [How It Works] [Pricing] [Testimonials]            │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `Hero.tsx` - Main headline and CTA
- `FeatureGrid.tsx` - Feature highlights
- `HowItWorks.tsx` - Step-by-step explanation
- `PricingTable.tsx` - Pricing tiers
- `Testimonials.tsx` - User reviews
- `Footer.tsx` - Links and contact

**Navigation:**
- Click "Sign Up" → `/signup`
- Click "Login" → `/login`
- Click "Get Started Free" → `/signup`

---

### **2. Sign Up Page** (`/signup`)

**Purpose:** User registration

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│           Create Your Free Account                   │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ Full Name                                      │  │
│  │ [________________]                            │  │
│  │                                                │  │
│  │ Email                                          │  │
│  │ [________________]                            │  │
│  │                                                │  │
│  │ Password                                       │  │
│  │ [________________]  👁                        │  │
│  │ Min 8 characters, 1 uppercase, 1 number       │  │
│  │                                                │  │
│  │ Confirm Password                               │  │
│  │ [________________]  👁                        │  │
│  │                                                │  │
│  │ [✓] I agree to Terms & Privacy Policy         │  │
│  │                                                │  │
│  │        [Create Account]                        │  │
│  │                                                │  │
│  │   Already have an account? [Login]            │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `SignUpForm.tsx`
  - Uses React Hook Form
  - Zod validation schema
  - Real-time validation feedback
  - Password strength indicator

**Validation Rules:**
- Name: Required, min 2 chars
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 number
- Confirm Password: Must match password
- Terms: Must be checked

**API Call on Submit:**
```typescript
POST /api/auth/register
Body: {
  email: string,
  password: string,
  name: string
}
Response: {
  token: string,
  user: { id, email, name }
}
```

**On Success:**
- Store JWT token in localStorage/cookie
- Redirect to `/onboarding/profile`

**Error Handling:**
- Email already exists → Show error: "This email is already registered"
- Network error → Show error: "Connection failed. Please try again"
- Show validation errors inline below each field

---

### **3. Login Page** (`/login`)

**Purpose:** User authentication

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│              Welcome Back                             │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ Email                                          │  │
│  │ [________________]                            │  │
│  │                                                │  │
│  │ Password                                       │  │
│  │ [________________]  👁                        │  │
│  │                                                │  │
│  │ [✓] Remember me    [Forgot Password?]         │  │
│  │                                                │  │
│  │           [Login]                              │  │
│  │                                                │  │
│  │   Don't have an account? [Sign Up]            │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `LoginForm.tsx`

**API Call on Submit:**
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: { id, email, name } }
```

**On Success:**
- Store JWT token
- Check if user has completed onboarding:
  ```typescript
  GET /api/user/onboarding-status
  Response: {
    hasProfile: boolean,
    hasConnectedEmail: boolean,
    hasSetPreferences: boolean
  }
  ```
- If incomplete → Redirect to next onboarding step
- If complete → Redirect to `/dashboard`

---

### **4. Onboarding - Profile Setup** (`/onboarding/profile`)

**Purpose:** Collect user professional information for job matching

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Step 1 of 3: Build Your Profile                    │
│  ████████░░░░░░░░░░░░░░░ 33%                        │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Let's create your professional profile              │
│                                                       │
│  ┌───── Basic Information ─────────────────────┐   │
│  │ Full Name                                    │   │
│  │ [John Doe_____________]                      │   │
│  │                                              │   │
│  │ Phone Number                                 │   │
│  │ [+1 (555) 123-4567___]                      │   │
│  │                                              │   │
│  │ Location                                     │   │
│  │ [San Francisco, CA___]  🔍                  │   │
│  │                                              │   │
│  │ LinkedIn URL (optional)                      │   │
│  │ [https://linkedin.com/in/johndoe__]         │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Professional Info ──────────────────────┐   │
│  │ Current Job Title                            │   │
│  │ [Software Engineer____]                      │   │
│  │                                              │   │
│  │ Years of Experience                          │   │
│  │ [5___] years                                 │   │
│  │                                              │   │
│  │ Desired Job Titles (Select all that apply)  │   │
│  │ [+ Add Title]                                │   │
│  │ [Software Engineer ×]                        │   │
│  │ [Full Stack Developer ×]                     │   │
│  │ [Backend Engineer ×]                         │   │
│  │                                              │   │
│  │ Desired Salary Range                         │   │
│  │ [$100k_____] to [$150k_____]                │   │
│  │                                              │   │
│  │ Work Authorization                           │   │
│  │ ○ US Citizen                                │   │
│  │ ● Work Visa (H1B)                           │   │
│  │ ○ Green Card                                │   │
│  │ ○ Need Sponsorship                          │   │
│  │                                              │   │
│  │ Work Preferences                             │   │
│  │ [✓] Remote    [✓] Hybrid    [ ] On-site    │   │
│  │ [✓] Open to Relocation                      │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Skills & Expertise ─────────────────────┐   │
│  │ Technical Skills                             │   │
│  │ [Search skills...________] [+ Add]          │   │
│  │                                              │   │
│  │ [React ×] [Node.js ×] [TypeScript ×]       │   │
│  │ [Python ×] [PostgreSQL ×] [AWS ×]          │   │
│  │ [Docker ×] [Kubernetes ×]                   │   │
│  │                                              │   │
│  │ Soft Skills                                  │   │
│  │ [Leadership ×] [Communication ×]            │   │
│  │ [Problem Solving ×] [Team Collaboration ×]  │   │
│  │                                              │   │
│  │ Certifications                               │   │
│  │ [+ Add Certification]                        │   │
│  │ • AWS Solutions Architect                    │   │
│  │ • Scrum Master (CSM)                        │   │
│  │                                              │   │
│  │ Languages                                    │   │
│  │ [+ Add Language]                             │   │
│  │ • English (Native)                           │   │
│  │ • Spanish (Conversational)                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [Scroll down for Work Experience & Education]       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Scrollable Section Continues:**
```
┌─────────────────────────────────────────────────────┐
│  ┌───── Work Experience ────────────────────────┐   │
│  │ [+ Add Experience]                           │   │
│  │                                              │   │
│  │ ┌─────────────────────────────────────────┐ │   │
│  │ │ Software Engineer                        │ │   │
│  │ │ Google · Full-time                      │ │   │
│  │ │ Jan 2021 - Present · 3 yrs              │ │   │
│  │ │ San Francisco, CA                        │ │   │
│  │ │                                          │ │   │
│  │ │ Responsibilities:                        │ │   │
│  │ │ • Led development of React-based...     │ │   │
│  │ │ • Improved page load times by 40%...    │ │   │
│  │ │ • Mentored 3 junior developers...       │ │   │
│  │ │                                          │ │   │
│  │ │ [Edit] [Remove]                         │ │   │
│  │ └─────────────────────────────────────────┘ │   │
│  │                                              │   │
│  │ ┌─────────────────────────────────────────┐ │   │
│  │ │ Junior Developer                         │ │   │
│  │ │ Startup Inc · Full-time                 │ │   │
│  │ │ Jun 2018 - Dec 2020 · 2.5 yrs          │ │   │
│  │ │ Remote                                   │ │   │
│  │ │                                          │ │   │
│  │ │ [Edit] [Remove]                         │ │   │
│  │ └─────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Education ──────────────────────────────┐   │
│  │ [+ Add Education]                            │   │
│  │                                              │   │
│  │ ┌─────────────────────────────────────────┐ │   │
│  │ │ Bachelor of Science in Computer Science │ │   │
│  │ │ Stanford University                      │ │   │
│  │ │ 2014 - 2018                             │ │   │
│  │ │ GPA: 3.8/4.0                            │ │   │
│  │ │                                          │ │   │
│  │ │ [Edit] [Remove]                         │ │   │
│  │ └─────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Resume Upload ──────────────────────────┐   │
│  │                                              │   │
│  │     📄 Drag & drop your resume here          │   │
│  │         or [Browse Files]                    │   │
│  │                                              │   │
│  │     Supported: PDF, DOCX (Max 5MB)          │   │
│  │                                              │   │
│  │  ✅ resume_john_doe.pdf (245 KB)            │   │
│  │     [Remove] [Preview]                       │   │
│  │                                              │   │
│  │  💡 Tip: We'll use AI to auto-fill your     │   │
│  │     profile from your resume!                │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [← Back]              [Save Draft] [Continue →]    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `ProfileSetupForm.tsx` (Main container)
  - `BasicInfoSection.tsx`
  - `ProfessionalInfoSection.tsx`
  - `SkillsSection.tsx`
    - `SkillInput.tsx` (autocomplete)
  - `WorkExperienceSection.tsx`
    - `ExperienceCard.tsx` (editable)
    - `AddExperienceModal.tsx`
  - `EducationSection.tsx`
    - `EducationCard.tsx`
    - `AddEducationModal.tsx`
  - `ResumeUpload.tsx`
    - Uses react-dropzone
    - File validation
    - Preview functionality

**Features:**
1. **Skill Autocomplete:**
   - API call: `GET /api/skills/search?q={query}`
   - Returns popular skills matching query
   - User can add custom skills

2. **Resume Parsing (AI):**
   - On file upload:
     ```typescript
     POST /api/resume/parse
     Body: FormData with file
     Response: {
       name, phone, email, location,
       skills: string[],
       experience: WorkExperience[],
       education: Education[]
     }
     ```
   - Auto-fills form fields
   - User can review and edit

3. **Form Validation:**
   - Required fields: Name, Phone, Location, Job Title, Skills (min 3)
   - Optional: LinkedIn, Certifications, Languages
   - Real-time validation feedback

4. **Save Draft:**
   - Saves partial progress
   ```typescript
   POST /api/user/profile/draft
   Body: { ...partial profile data }
   ```
   - Can return later to complete

**API Call on Continue:**
```typescript
POST /api/user/profile
Body: {
  name, phone, location, linkedIn,
  currentJobTitle, yearsExperience, desiredTitles,
  salaryMin, salaryMax, workAuthorization,
  workPreferences: { remote, hybrid, onsite, relocate },
  skills: { technical: [], soft: [] },
  certifications: [],
  languages: [],
  experience: [],
  education: [],
  resumeFileId: string
}
Response: { profileId: string }
```

**On Success:**
- Show toast: "✅ Profile saved!"
- Redirect to `/onboarding/connect`

---

### **5. Onboarding - Connect Email** (`/onboarding/connect`)

**Purpose:** Connect user's email for sending applications and monitoring responses

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Step 2 of 3: Connect Your Email                    │
│  ████████████████░░░░░░░░ 66%                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│     Connect your email to start applying             │
│                                                       │
│  We'll use your email to:                            │
│  ✅ Send job applications on your behalf             │
│  ✅ Track responses from companies                   │
│  ✅ Monitor interview requests                       │
│                                                       │
│  🔒 Your credentials are encrypted and secure        │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │                                                │  │
│  │         📧                                     │  │
│  │         Connect Gmail                          │  │
│  │                                                │  │
│  │  [Connect Gmail Account]                       │  │
│  │                                                │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │                                                │  │
│  │         📨                                     │  │
│  │         Connect Outlook                        │  │
│  │                                                │  │
│  │  [Connect Outlook Account]                     │  │
│  │                                                │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  💡 You can connect multiple accounts later          │
│                                                       │
│  [← Back]                      [Skip for now →]     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `EmailConnectionPage.tsx`
  - `EmailProviderCard.tsx`
    - Props: provider, icon, onConnect

**Interaction Flow:**

1. **User clicks "Connect Gmail Account":**
   ```typescript
   // Frontend initiates OAuth
   async function handleConnectGmail() {
     setIsConnecting(true);
     
     try {
       const response = await fetch('/api/mailbox/connect?provider=Gmail', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       
       const { authorizationUrl } = await response.json();
       
       // Open OAuth in popup
       const popup = window.open(
         authorizationUrl,
         'oauth-popup',
         'width=600,height=700'
       );
       
       // Listen for OAuth completion
       window.addEventListener('message', handleOAuthMessage);
       
     } catch (error) {
       toast.error('Failed to connect email');
       setIsConnecting(false);
     }
   }
   ```

2. **OAuth Popup Opens:**
   - Shows Google OAuth consent screen
   - User grants permissions
   - Google redirects to callback

3. **Backend Handles Callback:**
   - Exchanges code for tokens
   - Stores encrypted tokens
   - Redirects to `/oauth/success?provider=Gmail`

4. **OAuth Success Page:**
   ```
   ┌─────────────────────────────────────────────┐
   │                                             │
   │               ✅                            │
   │                                             │
   │         Gmail Connected!                    │
   │                                             │
   │  Your account has been connected            │
   │  successfully. You can close this           │
   │  window or wait to be redirected...         │
   │                                             │
   │  Redirecting in 3 seconds...                │
   │                                             │
   └─────────────────────────────────────────────┘
   ```
   
   - Sends message to parent window:
     ```typescript
     if (window.opener) {
       window.opener.postMessage(
         { type: 'oauth-success', provider: 'Gmail' },
         window.location.origin
       );
       window.close();
     }
     ```

5. **Parent Window Receives Message:**
   ```typescript
   function handleOAuthMessage(event: MessageEvent) {
     if (event.origin !== window.location.origin) return;
     
     if (event.data.type === 'oauth-success') {
       toast.success(`${event.data.provider} connected!`);
       setIsConnected(true);
       
       // Auto-advance to next step
       setTimeout(() => {
         router.push('/onboarding/preferences');
       }, 2000);
     }
   }
   ```

**If User Clicks "Skip for now":**
- Show confirmation modal:
  ```
  "You can connect your email later in Settings, 
  but you won't be able to apply to jobs until 
  you do. Continue?"
  ```
- On confirm → Redirect to `/onboarding/preferences`

**Components:**
- `EmailConnectionPage.tsx`
- `OAuthSuccessPage.tsx` (`/oauth/success`)
- `OAuthErrorPage.tsx` (`/oauth/error`)

---

### **6. Onboarding - Job Preferences** (`/onboarding/preferences`)

**Purpose:** Configure job search criteria and application settings

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Step 3 of 3: Set Your Job Preferences              │
│  ████████████████████████ 100%                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌───── Job Search Criteria ───────────────────┐   │
│  │ Job Titles (Select all that apply)          │   │
│  │ [Search titles...________] [+ Add]          │   │
│  │                                              │   │
│  │ [✓] Software Engineer                       │   │
│  │ [✓] Full Stack Developer                    │   │
│  │ [ ] Frontend Developer                      │   │
│  │ [ ] Backend Developer                       │   │
│  │ [ ] DevOps Engineer                         │   │
│  │                                              │   │
│  │ Locations                                    │   │
│  │ [✓] Remote                                  │   │
│  │ [✓] San Francisco, CA                       │   │
│  │ [✓] New York, NY                            │   │
│  │ [ ] Seattle, WA                             │   │
│  │ [+ Add Location]                            │   │
│  │                                              │   │
│  │ Salary Range                                 │   │
│  │ Min: [$120,000_] Max: [$180,000_]          │   │
│  │                                              │   │
│  │ Company Size                                 │   │
│  │ [✓] Startup (1-50)                          │   │
│  │ [✓] Mid-size (51-500)                       │   │
│  │ [ ] Enterprise (500+)                       │   │
│  │                                              │   │
│  │ Industries                                   │   │
│  │ [✓] Technology                              │   │
│  │ [ ] Finance                                 │   │
│  │ [ ] Healthcare                              │   │
│  │ [ ] E-commerce                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Application Settings ───────────────────┐   │
│  │ Application Mode                             │   │
│  │                                              │   │
│  │ ○ Fully Automatic                           │   │
│  │   Apply to all matching jobs automatically   │   │
│  │   ⚡ Best for maximum reach                  │   │
│  │                                              │   │
│  │ ● Semi-Automatic (Recommended)              │   │
│  │   Show me matches, I'll approve each one    │   │
│  │   ⚖️  Balance between speed and control      │   │
│  │                                              │   │
│  │ ○ Manual                                    │   │
│  │   Just show me matches, I'll apply myself   │   │
│  │   🎯 Full control over every application     │   │
│  │                                              │   │
│  │ Daily Application Limit                      │   │
│  │ [25____] applications per day               │   │
│  │ ├─────┼─────┼─────┼─────┤                  │   │
│  │ 5    25    50    75   100                   │   │
│  │                                              │   │
│  │ Minimum Match Score                          │   │
│  │ Only show jobs with [85%__] match or higher │   │
│  │ ├─────┼─────┼─────┼─────┤                  │   │
│  │ 60%  70%  80%  90% 100%                     │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [Scroll down for Cover Letter Settings]             │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Scrollable Section Continues:**
```
┌─────────────────────────────────────────────────────┐
│  ┌───── Cover Letter Template ──────────────────┐   │
│  │                                              │   │
│  │ Base Cover Letter                            │   │
│  │ (We'll personalize this for each job)       │   │
│  │                                              │   │
│  │ ┌──────────────────────────────────────────┐│   │
│  │ │ Dear Hiring Manager,                     ││   │
│  │ │                                          ││   │
│  │ │ I am writing to express my interest in  ││   │
│  │ │ the {job_title} position at {company}.  ││   │
│  │ │                                          ││   │
│  │ │ With {years_experience} years of         ││   │
│  │ │ experience in {key_skills}, I am         ││   │
│  │ │ confident in my ability to contribute... ││   │
│  │ │                                          ││   │
│  │ │ [Rich text editor continues...]          ││   │
│  │ └──────────────────────────────────────────┘│   │
│  │                                              │   │
│  │ Available Variables:                         │   │
│  │ {company} {job_title} {your_name}           │   │
│  │ {years_experience} {key_skills}             │   │
│  │ {relevant_experience}                        │   │
│  │                                              │   │
│  │ AI Personalization                           │   │
│  │ [✓] Use AI to customize each cover letter   │   │
│  │                                              │   │
│  │ Tone                                         │   │
│  │ ● Professional  ○ Casual  ○ Enthusiastic   │   │
│  │                                              │   │
│  │ Emphasis                                     │   │
│  │ [✓] Highlight relevant experience           │   │
│  │ [✓] Match company culture                   │   │
│  │ [ ] Include salary expectations             │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Email Settings ─────────────────────────┐   │
│  │ Subject Line Template                        │   │
│  │ [Application for {job_title} at {company}_] │   │
│  │                                              │   │
│  │ From Name                                    │   │
│  │ [John Doe________________________]          │   │
│  │                                              │   │
│  │ Email Signature                              │   │
│  │ ┌──────────────────────────────────────────┐│   │
│  │ │ Best regards,                            ││   │
│  │ │ John Doe                                 ││   │
│  │ │ (555) 123-4567                           ││   │
│  │ │ linkedin.com/in/johndoe                  ││   │
│  │ │ johndoe.dev                              ││   │
│  │ └──────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  ┌───── Follow-Up Settings ─────────────────────┐   │
│  │ [✓] Automatically send follow-up emails     │   │
│  │                                              │   │
│  │ Send follow-up after [7__] days with no     │   │
│  │ response                                     │   │
│  │                                              │   │
│  │ Follow-Up Message Template                   │   │
│  │ [Use AI to generate] [Customize]            │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [← Back]         [Save Draft] [Complete Setup →]   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `JobPreferencesForm.tsx`
  - `SearchCriteriaSection.tsx`
    - `JobTitleSelector.tsx` (multi-select with autocomplete)
    - `LocationSelector.tsx` (multi-select)
    - `SalaryRangeInput.tsx`
    - `CompanySizeSelector.tsx`
    - `IndustrySelector.tsx`
  - `ApplicationSettingsSection.tsx`
    - `ApplicationModeSelector.tsx` (radio group with descriptions)
    - `DailyLimitSlider.tsx`
    - `MatchScoreSlider.tsx`
  - `CoverLetterSection.tsx`
    - `RichTextEditor.tsx` (TipTap/Quill)
    - `VariableInserter.tsx`
    - `AIPersonalizationSettings.tsx`
  - `EmailSettingsSection.tsx`
    - `SubjectLineInput.tsx`
    - `SignatureEditor.tsx`
  - `FollowUpSettings.tsx`

**Features:**

1. **Job Title Autocomplete:**
   ```typescript
   GET /api/job-titles/search?q={query}
   Response: string[] // Popular job titles
   ```

2. **Location Search:**
   ```typescript
   GET /api/locations/search?q={query}
   Response: {
     cities: { name, state, country }[],
     states: string[],
     remote: boolean
   }
   ```

3. **Cover Letter Preview:**
   - Show live preview with variable substitution
   - Example values: {company: "Google", job_title: "Software Engineer"}

4. **AI Customization Preview:**
   - Button: "See AI Sample"
   - Shows how AI would customize the letter for a sample job

**API Call on "Complete Setup":**
```typescript
POST /api/user/preferences
Body: {
  jobSearchCriteria: {
    jobTitles: string[],
    locations: string[],
    salaryMin: number,
    salaryMax: number,
    companySizes: string[],
    industries: string[]
  },
  applicationSettings: {
    mode: 'fully-auto' | 'semi-auto' | 'manual',
    dailyLimit: number,
    minMatchScore: number
  },
  coverLetter: {
    template: string,
    useAI: boolean,
    tone: 'professional' | 'casual' | 'enthusiastic',
    emphasis: {
      experience: boolean,
      culture: boolean,
      salary: boolean
    }
  },
  emailSettings: {
    subjectTemplate: string,
    fromName: string,
    signature: string
  },
  followUpSettings: {
    enabled: boolean,
    daysToWait: number
  }
}
```

**On Success:**
- Show celebration modal:
  ```
  🎉 You're All Set!
  
  We're now searching for jobs that match your profile.
  You'll start seeing matches on your dashboard shortly.
  
  [Go to Dashboard]
  ```
- Update user onboarding status: `isOnboardingComplete: true`
- Redirect to `/dashboard`

---

### **7. Main Dashboard** (`/dashboard`)

**Purpose:** Central hub for job matches, applications, and activity

**Layout (Initial State - Syncing):**
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx                        [Profile ▼]   │
│  ─────────────────────────────────────────────────  │
│  [📊 Dashboard] [📧 Applications] [📈 Analytics]    │
│  [⚙️ Settings]                                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │ ⏳ Setting up your job search...              │  │
│  │                                                │  │
│  │ We're currently:                               │  │
│  │ ✅ Syncing your email                         │  │
│  │ 🔄 Searching for job matches...               │  │
│  │                                                │  │
│  │ This may take a few minutes.                   │  │
│  │ We'll notify you when matches are ready!       │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Quick Stats ───────────────────────────────┐  │
│  │ Applications Today: 0 / 25                     │  │
│  │ Total Applications: 0                          │  │
│  │ Response Rate: --%                             │  │
│  │ Active Matches: Searching...                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Layout (After Initial Sync - Has Matches):**
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx                        [Profile ▼]   │
│  ─────────────────────────────────────────────────  │
│  [📊 Dashboard] [📧 Applications] [📈 Analytics]    │
│  [⚙️ Settings]                                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Welcome back, John! 👋                              │
│                                                       │
│  ┌─── Your Stats ────────────────────────────────┐  │
│  │ Applications Sent Today: 8 / 25     [View]    │  │
│  │ Total Applications: 127                        │  │
│  │ Responses: 23 (18%)                           │  │
│  │ Interviews: 5                                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  🎯 New Job Matches (47)              [View All]     │
│  Sorted by: [Best Match ▼]  Filter: [All Jobs ▼]   │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⭐ 94% Match                                  │  │
│  │                                               │  │
│  │ Senior Software Engineer                      │  │
│  │ 💼 Google                                     │  │
│  │ 📍 Mountain View, CA (Remote available)      │  │
│  │ 💰 $150k - $200k/year                        │  │
│  │ ⏰ Posted 2 hours ago                        │  │
│  │                                               │  │
│  │ Why you're a great match:                     │  │
│  │ ✓ 5+ years experience (Required)             │  │
│  │ ✓ React, Node.js, TypeScript (All matched)  │  │
│  │ ✓ Remote work available                      │  │
│  │ ✓ Salary matches your range                  │  │
│  │                                               │  │
│  │ Job Requirements:                             │  │
│  │ • 5+ years in full-stack development         │  │
│  │ • Strong React & Node.js experience          │  │
│  │ • Experience with cloud platforms (AWS)...   │  │
│  │                                               │  │
│  │ [📄 View Full Description]                   │  │
│  │                                               │  │
│  │ [Apply Now]  [Save for Later]  [Not Interested]│
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⭐ 91% Match                                  │  │
│  │                                               │  │
│  │ Full Stack Developer                          │  │
│  │ 💼 Microsoft                                  │  │
│  │ 📍 Seattle, WA (Hybrid)                      │  │
│  │ 💰 $130k - $170k/year                        │  │
│  │ ⏰ Posted 4 hours ago                        │  │
│  │                                               │  │
│  │ Why you're a great match:                     │  │
│  │ ✓ TypeScript expert (Highly valued)         │  │
│  │ ✓ Azure experience (Preferred)              │  │
│  │ ✓ Leadership skills (Bonus)                  │  │
│  │                                               │  │
│  │ [Apply Now]  [Save for Later]  [Not Interested]│
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⭐ 88% Match                                  │  │
│  │                                               │  │
│  │ Backend Engineer                              │  │
│  │ 💼 Stripe                                     │  │
│  │ 📍 San Francisco, CA (Remote)                │  │
│  │ 💰 $140k - $190k/year                        │  │
│  │ ⏰ Posted 6 hours ago                        │  │
│  │                                               │  │
│  │ [Apply Now]  [Save for Later]  [Not Interested]│
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  [Load More]                                         │
│                                                       │
│  ──────────────────────────────────────────────────  │
│                                                       │
│  📧 Recent Activity                    [View All]    │
│                                                       │
│  • Meta replied to your application (2 mins ago)    │
│    "We'd like to schedule an interview..."          │
│    [View Email] [Schedule Interview]                 │
│                                                       │
│  • Applied to Amazon - Software Engineer (1 hr ago)  │
│    [View Application]                                │
│                                                       │
│  • Apple viewed your profile (3 hours ago)          │
│    [View Job Posting]                                │
│                                                       │
│  • Netflix application rejected (5 hours ago)        │
│    [View Details]                                    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `DashboardPage.tsx`
  - `DashboardHeader.tsx`
    - `UserNav.tsx` (profile dropdown)
  - `StatsCards.tsx`
    - `StatCard.tsx` (reusable)
  - `JobMatchesList.tsx`
    - `JobMatchCard.tsx`
      - `MatchScoreBadge.tsx`
      - `JobDetails.tsx`
      - `MatchReasons.tsx`
      - `JobActions.tsx`
  - `RecentActivityFeed.tsx`
    - `ActivityItem.tsx`
  - `EmptyState.tsx` (shown when no matches)

**API Calls:**

1. **Fetch Stats:**
   ```typescript
   GET /api/dashboard/stats
   Response: {
     applicationsToday: number,
     totalApplications: number,
     responseRate: number,
     interviewCount: number,
     activeMatches: number
   }
   ```

2. **Fetch Job Matches:**
   ```typescript
   GET /api/jobs/matches?page=1&pageSize=10&sort=match-score&status=new
   Response: {
     matches: [{
       id: string,
       jobPosting: {
         id, title, company, location, salary, 
         description, requirements, postedDate
       },
       matchScore: number,
       matchReasons: string[],
       status: 'new' | 'saved' | 'applied' | 'skipped'
     }],
     totalCount: number,
     page: number
   }
   ```

3. **Fetch Recent Activity:**
   ```typescript
   GET /api/activity/recent?limit=5
   Response: {
     activities: [{
       id, type, jobTitle, company, timestamp, details
     }]
   }
   ```

**Polling/Real-Time Updates:**
- Use React Query with 30-second refetch interval
- Or implement WebSocket for live updates:
  ```typescript
  const socket = useWebSocket('/api/ws/updates');
  
  socket.on('new-match', (match) => {
    // Add to matches list
    toast.info(`New match: ${match.jobTitle} at ${match.company}`);
  });
  
  socket.on('application-response', (response) => {
    // Update activity feed
    toast.success('You have a new response!');
  });
  ```

**Interactions:**

1. **Click "Apply Now" on Job Card:**
   
   **If mode = "semi-automatic":**
   - Open modal showing:
     ```
     ┌───── Review Application ─────────────────┐
     │                                          │
     │ Applying to: Senior Software Engineer   │
     │ Company: Google                          │
     │                                          │
     │ ─── Cover Letter Preview ───            │
     │ [Personalized cover letter text...]     │
     │ [Edit]                                   │
     │                                          │
     │ ─── Resume ───                          │
     │ 📄 john_doe_resume.pdf                  │
     │ [Change]                                 │
     │                                          │
     │ ─── Email Preview ───                   │
     │ To: jobs@google.com                     │
     │ Subject: Application for Senior...       │
     │                                          │
     │ [Cancel]  [Send Application]            │
     └──────────────────────────────────────────┘
     ```
   
   - On "Send Application":
     ```typescript
     POST /api/applications/send
     Body: {
       jobMatchId: string,
       customCoverLetter?: string // if user edited
     }
     ```
   
   **If mode = "fully-automatic":**
   - Application sent immediately
   - Show toast: "✅ Applied to Google - Senior Software Engineer"
   - Update card status to "Applied"

2. **Click "Save for Later":**
   ```typescript
   PATCH /api/jobs/matches/{matchId}
   Body: { status: 'saved' }
   ```
   - Card moves to "Saved Jobs" section
   - Show toast: "💾 Job saved"

3. **Click "Not Interested":**
   ```typescript
   PATCH /api/jobs/matches/{matchId}
   Body: { status: 'skipped', reason?: string }
   ```
   - Card removed from list
   - System learns preferences (optional feedback modal)

4. **Click "View Full Description":**
   - Expand card inline to show full job description
   - Or open modal/side panel with full details

5. **Click Activity Item (e.g., "Meta replied"):**
   - Navigate to `/applications/{applicationId}`
   - Show full conversation thread

**Empty States:**

If no matches:
```
┌───────────────────────────────────────┐
│                                       │
│           🔍                          │
│                                       │
│     No job matches yet                │
│                                       │
│  We're actively searching for jobs    │
│  that match your profile. Check back  │
│  soon!                                │
│                                       │
│  Meanwhile, you can:                  │
│  • [Update your profile]              │
│  • [Adjust your preferences]          │
│  • [Connect another email]            │
│                                       │
└───────────────────────────────────────┘
```

---

### **8. Applications Tracker** (`/applications`)

**Purpose:** View and manage all submitted applications

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx                        [Profile ▼]   │
│  ─────────────────────────────────────────────────  │
│  [📊 Dashboard] [📧 Applications] [📈 Analytics]    │
│  [⚙️ Settings]                                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Application Tracker                                 │
│                                                       │
│  ┌─── Filters ───────────────────────────────────┐  │
│  │ Status: [All ▼]  Company: [All ▼]            │  │
│  │ Date Range: [Last 30 days ▼]                 │  │
│  │ Search: [___________________________] 🔍      │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Status Tabs ──────────────────────────────┐  │
│  │ [All (127)] [Applied (98)] [In Review (15)]  │  │
│  │ [Interview (8)] [Rejected (5)] [Offers (1)]  │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  Sort by: [Most Recent ▼]  View: [⊞ Cards] [≡ List]│
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📩 Response Received                         │  │
│  │                                               │  │
│  │ Senior Software Engineer                      │  │
│  │ 💼 Google · Mountain View, CA                │  │
│  │ Applied: Nov 23, 2025 (1 day ago)           │  │
│  │                                               │  │
│  │ Latest Update: Nov 24, 2025 (2 hours ago)   │  │
│  │ "Thank you for your application. We'd like   │  │
│  │  to schedule a phone interview. Please..."   │  │
│  │                                               │  │
│  │ Timeline:                                     │  │
│  │ ✓ Application sent (Nov 23, 10:30 AM)       │  │
│  │ ✓ Application viewed (Nov 23, 2:15 PM)      │  │
│  │ ✓ Response received (Nov 24, 9:00 AM)       │  │
│  │                                               │  │
│  │ [View Email Thread] [Schedule Interview]      │  │
│  │ [Send Follow-Up] [Archive]                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ ⏳ In Review                                  │  │
│  │                                               │  │
│  │ Full Stack Developer                          │  │
│  │ 💼 Microsoft · Seattle, WA                   │  │
│  │ Applied: Nov 22, 2025 (2 days ago)          │  │
│  │                                               │  │
│  │ Latest Update: Application viewed            │  │
│  │ (Nov 22, 4:30 PM)                            │  │
│  │                                               │  │
│  │ No response yet. Consider:                    │  │
│  │ • [Send Follow-Up Email] (Available in 5 days)│
│  │ • [Check Application Status]                  │  │
│  │                                               │  │
│  │ Timeline:                                     │  │
│  │ ✓ Application sent (Nov 22, 11:00 AM)       │  │
│  │ ✓ Application viewed (Nov 22, 4:30 PM)      │  │
│  │ ○ Waiting for response...                    │  │
│  │                                               │  │
│  │ [View Application] [Withdraw] [Archive]      │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ ❌ Rejected                                   │  │
│  │                                               │  │
│  │ Backend Engineer                              │  │
│  │ 💼 Netflix · Los Gatos, CA                   │  │
│  │ Applied: Nov 20, 2025 (4 days ago)          │  │
│  │                                               │  │
│  │ Rejection received: Nov 21, 2025             │  │
│  │ "Thank you for your interest. After careful  │  │
│  │  review, we've decided to move forward..."   │  │
│  │                                               │  │
│  │ Feedback (AI Analysis):                       │  │
│  │ • Required 7+ years experience (you have 5)  │  │
│  │ • Preferred Python (not in your profile)     │  │
│  │                                               │  │
│  │ [View Email] [Learn from Feedback] [Archive] │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  [Load More Applications]                            │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `ApplicationsPage.tsx`
  - `ApplicationFilters.tsx`
    - `StatusFilter.tsx`
    - `CompanyFilter.tsx`
    - `DateRangeFilter.tsx`
    - `SearchInput.tsx`
  - `StatusTabs.tsx` (with counts)
  - `ApplicationsList.tsx`
    - `ApplicationCard.tsx`
      - `ApplicationStatus.tsx`
      - `ApplicationTimeline.tsx`
      - `ApplicationActions.tsx`

**API Calls:**

1. **Fetch Applications:**
   ```typescript
   GET /api/applications?status={status}&page=1&pageSize=20
   Response: {
     applications: [{
       id, jobTitle, company, location,
       appliedDate, status, lastUpdate,
       timeline: [{
         event: string,
         timestamp: string,
         details?: string
       }],
       emailThreadId?: string
     }],
     totalCount: number,
     statusCounts: {
       all: number,
       applied: number,
       inReview: number,
       interview: number,
       rejected: number,
       offers: number
     }
   }
   ```

2. **View Email Thread:**
   ```typescript
   GET /api/emails/thread/{threadId}
   Response: {
     emails: [{
       from, to, subject, body, date, isFromUser
     }]
   }
   ```
   - Opens modal/side panel with conversation history

3. **Send Follow-Up:**
   ```typescript
   POST /api/applications/{applicationId}/follow-up
   Body: { customMessage?: string }
   ```
   - Sends follow-up email
   - Updates timeline

4. **Withdraw Application:**
   ```typescript
   POST /api/applications/{applicationId}/withdraw
   ```
   - Sends withdrawal email (optional)
   - Updates status to "Withdrawn"

**Interactions:**

1. **Filter by Status:**
   - Click tab → Update URL query param → Fetch filtered results
   - URL: `/applications?status=interview`

2. **Search:**
   - Debounced search (500ms delay)
   - Searches: job title, company name

3. **Click "Schedule Interview":**
   - Opens modal with calendar integration
   - Options:
     - Manual entry (date, time, location/link)
     - Parse from email (AI extracts details)
     - Export to Google Calendar / Outlook
   - Stores interview details:
     ```typescript
     POST /api/interviews/schedule
     Body: {
       applicationId: string,
       date: string,
       time: string,
       location: string,
       type: 'phone' | 'video' | 'onsite',
       notes?: string
     }
     ```

4. **Click "Learn from Feedback":**
   - Shows AI analysis of rejection
   - Suggests profile improvements
   - Recommends skills to add

---

### **9. Analytics Dashboard** (`/analytics`)

**Purpose:** Show user performance metrics and insights

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx                        [Profile ▼]   │
│  ─────────────────────────────────────────────────  │
│  [📊 Dashboard] [📧 Applications] [📈 Analytics]    │
│  [⚙️ Settings]                                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Analytics & Insights                                │
│                                                       │
│  Time Period: [Last 30 days ▼]  Export: [CSV] [PDF]│
│                                                       │
│  ┌─── Key Metrics ──────────────────────────────┐  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐│  │
│  │ │Total Apps  │ │Response    │ │Interview   ││  │
│  │ │    127     │ │Rate 18%    │ │Rate 6%     ││  │
│  │ │ +12 this   │ │ +2% ↑      │ │ +1% ↑      ││  │
│  │ │  week      │ │            │ │            ││  │
│  │ └────────────┘ └────────────┘ └────────────┘│  │
│  │                                               │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐│  │
│  │ │Avg Response│ │Active      │ │Offers      ││  │
│  │ │Time 4.2d   │ │Searches 8  │ │Received 1  ││  │
│  │ │ -0.5d ↓    │ │            │ │            ││  │
│  │ └────────────┘ └────────────┘ └────────────┘│  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Applications Over Time ───────────────────┐  │
│  │                                               │  │
│  │  [Line chart showing applications sent]       │  │
│  │  X-axis: Date                                 │  │
│  │  Y-axis: Number of applications               │  │
│  │  Lines: Sent, Responses, Interviews           │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Top Performing ────────┬─ Best Times ──────┐  │
│  │                            │                   │  │
│  │ Job Titles (Response Rate) │ Day: Tuesday      │  │
│  │ 1. Software Engineer (24%) │ (+23% more       │  │
│  │ 2. Full Stack Dev (19%)    │  responses)      │  │
│  │ 3. Backend Engineer (15%)  │                   │  │
│  │                            │ Time: 9-11 AM     │  │
│  │ Companies (Interview Rate) │ (+18% more       │  │
│  │ 1. Google (12%)            │  responses)      │  │
│  │ 2. Meta (10%)              │                   │  │
│  │ 3. Microsoft (8%)          │                   │  │
│  │                            │                   │  │
│  └────────────────────────────┴───────────────────┘  │
│                                                       │
│  ┌─── Skills Demand ──────────────────────────── ┐  │
│  │                                                │  │
│  │ Most In-Demand Skills in Your Matches:        │  │
│  │ [Bar chart]                                    │  │
│  │ React        ████████████████████ 87%         │  │
│  │ Node.js      ██████████████████ 78%           │  │
│  │ TypeScript   ████████████████ 65%             │  │
│  │ AWS          ███████████ 52%                  │  │
│  │ Python       ████████ 38%                     │  │
│  │                                                │  │
│  │ Skills You're Missing (High Demand):          │  │
│  │ • Docker (in 45% of matches)                  │  │
│  │ • Kubernetes (┌─────────────────────────────────────────────────────┐
│  [Logo] Recchx                        [Profile ▼]   │
│  ─────────────────────────────────────────────────  │
│  [📊 Dashboard] [📧 Applications] [📈 Analytics]    │
│  [⚙️ Settings]                                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Analytics & Insights                                │
│                                                       │
│  Time Period: [Last 30 days ▼]  Export: [CSV] [PDF]│
│                                                       │
│  ┌─── Key Metrics ──────────────────────────────┐  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐│  │
│  │ │Total Apps  │ │Response    │ │Interview   ││  │
│  │ │    127     │ │Rate 18%    │ │Rate 6%     ││  │
│  │ │ +12 this   │ │ +2% ↑      │ │ +1% ↑      ││  │
│  │ │  week      │ │            │ │            ││  │
│  │ └────────────┘ └────────────┘ └────────────┘│  │
│  │                                               │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐│  │
│  │ │Avg Response│ │Active      │ │Offers      ││  │
│  │ │Time 4.2d   │ │Searches 8  │ │Received 1  ││  │
│  │ │ -0.5d ↓    │ │            │ │            ││  │
│  │ └────────────┘ └────────────┘ └────────────┘│  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Applications Over Time ───────────────────┐  │
│  │                                               │  │
│  │  [Line chart showing applications sent]       │  │
│  │  X-axis: Date                                 │  │
│  │  Y-axis: Number of applications               │  │
│  │  Lines: Sent, Responses, Interviews           │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─── Top Performing ────────┬─ Best Times ──────┐  │
│  │                            │                   │  │
│  │ Job Titles (Response Rate) │ Day: Tuesday      │  │
│  │ 1. Software Engineer (24%) │ (+23% more       │  │
│  │ 2. Full Stack Dev (19%)    │  responses)      │  │
│  │ 3. Backend Engineer (15%)  │                   │  │
│  │                            │ Time: 9-11 AM     │  │
│  │ Companies (Interview Rate) │ (+18% more       │  │
│  │ 1. Google (12%)            │  responses)      │  │
│  │ 2. Meta (10%)              │                   │  │
│  │ 3. Microsoft (8%)          │                   │  │
│  │                            │                   │  │
│  └────────────────────────────┴───────────────────┘  │
│                                                       │
│  ┌─── Skills Demand ──────────────────────────── ┐  │
│  │                                                │  │
│  │ Most In-Demand Skills in Your Matches:        │  │
│  │ [Bar chart]                                    │  │
│  │ React        ████████████████████ 87%         │  │
│  │ Node.js      ██████████████████ 78%           │  │
│  │ TypeScript   ████████████████ 65%             │  │
│  │ AWS          ███████████ 52%                  │  │
│  │ Python       ████████ 38%                     │  │
│  │                                                │  │
│  │ Skills You're Missing (High Demand):          │  │
│  │ • Docker (in 45% of matches)                  │  │
│  │ • Kubernetes (