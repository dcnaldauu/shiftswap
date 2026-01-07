# ShiftSwap Setup Guide

## Step-by-Step Installation

### 1. Install Node.js

If you don't have Node.js installed:

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install the LTS (Long Term Support) version
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- React and React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- Supabase client
- PDF generation library
- Signature pad
- React Router

### 3. Set Up Supabase Database

#### 3.1 Access Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project dashboard

#### 3.2 Run Database Schema

1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the `supabase-schema.sql` file in this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" to execute

This will create:
- Three tables: `profiles`, `shifts`, `swap_requests`
- Indexes for performance
- Row Level Security policies
- Automatic triggers for timestamps
- Function for auto-creating profiles on signup

#### 3.3 Verify Tables Created

1. Click "Table Editor" in the left sidebar
2. You should see three tables:
   - profiles
   - shifts
   - swap_requests

### 4. Configure Environment Variables

1. Locate the `.env` file in the project root
2. The Supabase credentials are already filled in:
   ```
   VITE_SUPABASE_URL=https://hvfvadcadrlfcnqeyflc.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_DAQw6iTQ-Jb2qHeR8Bot5Q_kNPEzLm6
   ```
3. Add your email service API key (see Email Setup section below)

### 5. Email Service Setup

Choose one of the following email services:

#### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test email
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add to `.env`:
   ```
   VITE_EMAIL_SERVICE_API_KEY=re_xxxxxxxxxxxxxxxxxx
   ```

#### Option B: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to Settings > API Keys
3. Create an API Key with "Mail Send" permissions
4. Copy the key and add to `.env`:
   ```
   VITE_EMAIL_SERVICE_API_KEY=SG.xxxxxxxxxxxxxxxxxx
   ```
5. Update `api/send-email.js` to use the SendGrid implementation (commented code is provided)

### 6. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 7. Test the Application

#### Create First User

1. Navigate to the app
2. Click "Sign Up"
3. Fill in:
   - Full Name: Test User
   - Staff ID: 1234 (exactly 4 digits)
   - Email: test@example.com
   - Password: password123
4. Click "Sign Up"
5. You'll be redirected to the signature page
6. Draw your signature
7. Click "Save Signature"
8. You should now see the main app with bottom navigation

#### Create a Test Shift

1. Click the gold "+" button in the center of bottom nav
2. Select "Giveaway"
3. Choose a date (tomorrow)
4. Set start time: 09:00
5. Set end time: 17:00
6. Select area: Gaming
7. Click "Post Shift"
8. Check "My Shifts" tab to see your posted shift

## Database Maintenance

### Auto-Cleanup of Old Requests

The database schema includes a function `delete_old_swap_requests()` that removes accepted/declined requests older than 7 days.

#### Option 1: Manual Cleanup (Recommended for Testing)

Run this SQL command in Supabase SQL Editor whenever needed:

```sql
SELECT delete_old_swap_requests();
```

#### Option 2: Automatic Scheduled Cleanup

Supabase supports pg_cron extension for scheduled tasks:

1. In Supabase Dashboard, go to Database → Extensions
2. Enable `pg_cron` extension
3. Run this SQL command:

```sql
SELECT cron.schedule(
  'delete-old-requests',
  '0 0 * * *',  -- Every day at midnight
  'SELECT delete_old_swap_requests();'
);
```

#### Option 3: Application-Level Cleanup

Create a cleanup utility that runs on app startup or periodically:

```javascript
// src/lib/cleanup.js
import { supabase } from './supabase'

export async function cleanupOldRequests() {
  try {
    const { error } = await supabase.rpc('delete_old_swap_requests')
    if (error) throw error
    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}
```

Call this function from your app:

```javascript
// In App.jsx or main.jsx
import { cleanupOldRequests } from './lib/cleanup'

useEffect(() => {
  cleanupOldRequests()
  // Run cleanup every 24 hours
  const interval = setInterval(cleanupOldRequests, 24 * 60 * 60 * 1000)
  return () => clearInterval(interval)
}, [])
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY` (or `SENDGRID_API_KEY`)
7. Deploy

The API endpoint (`/api/send-email.js`) will automatically be deployed as a serverless function.

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add Environment Variables in Site Settings
7. Move `/api/send-email.js` to `/netlify/functions/send-email.js`
8. Deploy

## Troubleshooting

### "npm: command not found"

- Node.js is not installed or not in PATH
- Solution: Install Node.js from [nodejs.org](https://nodejs.org/)

### Database Connection Error

- Check Supabase URL and key in `.env`
- Verify you're using the correct project
- Check if RLS policies are enabled

### Email Not Sending

- Verify API key is correct in `.env`
- Check email service dashboard for errors
- Ensure API endpoint is deployed
- Check browser console for detailed errors

### Signature Not Saving

- Check browser console for errors
- Verify signature_blob column exists in profiles table
- Ensure user is authenticated

### Shifts Not Appearing

- Check if shifts exist in database (Supabase Table Editor)
- Verify RLS policies allow reading
- Check browser console for errors
- Ensure shift status is "Open"

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore` for security
2. **Supabase RLS is enabled** - Only authenticated users can access data
3. **API keys are server-side** - Email API key should be in backend environment
4. **Signatures are base64** - No file uploads, stored directly in database

## Support Contacts

- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)
- Vite: [vitejs.dev](https://vitejs.dev)
- React: [react.dev](https://react.dev)
