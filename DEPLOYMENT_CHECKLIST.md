# ShiftSwap Deployment Checklist

## Pre-Deployment

### 1. Local Development Setup ✓

- [ ] Node.js installed (v16+)
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured in `.env`
- [ ] Local development server running (`npm run dev`)
- [ ] App accessible at `http://localhost:3000`

### 2. Database Setup ✓

- [ ] Supabase project created
- [ ] Database schema executed (`supabase-schema.sql`)
- [ ] All three tables created (profiles, shifts, swap_requests)
- [ ] RLS policies enabled and tested
- [ ] Test user created successfully
- [ ] Signature capture working

### 3. Email Service Setup ✓

Choose one:

**Option A: Resend**
- [ ] Account created at [resend.com](https://resend.com)
- [ ] API key generated
- [ ] Domain verified (or using test email)
- [ ] API key added to `.env`

**Option B: SendGrid**
- [ ] Account created at [sendgrid.com](https://sendgrid.com)
- [ ] API key generated with Mail Send permissions
- [ ] Sender identity verified
- [ ] API key added to `.env`
- [ ] `/api/send-email.js` updated to use SendGrid code

### 4. Testing Checklist ✓

**Authentication**
- [ ] Sign up with new account
- [ ] Signature capture works
- [ ] Login with existing account
- [ ] Password reset (if implemented)
- [ ] Sign out works

**Shift Management**
- [ ] Create giveaway shift
- [ ] Create swap shift
- [ ] 12-hour validation working
- [ ] Shift appears in marketplace
- [ ] Filter by area working
- [ ] Take giveaway shift
- [ ] Propose swap for shift

**Request Handling**
- [ ] Incoming requests show correctly
- [ ] Outgoing requests show correctly
- [ ] Accept swap request
- [ ] Other requests auto-decline
- [ ] Shift status changes to "Claimed"

**Status Management**
- [ ] Mark shift as "Approved" (Completed)
- [ ] Mark shift as "Declined" (returns to Open)
- [ ] Status filters working in My Shifts

**Email & PDF**
- [ ] Giveaway email sent
- [ ] Swap email sent
- [ ] PDF attachment included
- [ ] Signatures visible in PDF
- [ ] Email received at test address

**Settings**
- [ ] Update password
- [ ] Update signature
- [ ] Profile info displays correctly

## Deployment

### Option 1: Deploy to Vercel

#### Step 1: Prepare Repository
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] All tests passing locally

#### Step 2: Vercel Setup
- [ ] Sign in to [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Select repository: `shiftswap`

#### Step 3: Configure Project
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: **.**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

#### Step 4: Environment Variables
Add these in Vercel project settings:

```
VITE_SUPABASE_URL=https://hvfvadcadrlfcnqeyflc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DAQw6iTQ-Jb2qHeR8Bot5Q_kNPEzLm6
RESEND_API_KEY=re_xxxxxxxxxx (or SENDGRID_API_KEY)
```

- [ ] All environment variables added
- [ ] Values verified (no extra spaces)

#### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Visit deployed URL

#### Step 6: Verify Deployment
- [ ] Site loads correctly
- [ ] Login works
- [ ] Create shift works
- [ ] Email sending works
- [ ] All features functional

### Option 2: Deploy to Netlify

#### Step 1: Prepare Repository
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed
- [ ] API function moved to `/netlify/functions/send-email.js`

#### Step 2: Netlify Setup
- [ ] Sign in to [netlify.com](https://netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect to GitHub
- [ ] Select repository: `shiftswap`

#### Step 3: Configure Build Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`

#### Step 4: Environment Variables
Add in Site Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://hvfvadcadrlfcnqeyflc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DAQw6iTQ-Jb2qHeR8Bot5Q_kNPEzLm6
RESEND_API_KEY=re_xxxxxxxxxx (or SENDGRID_API_KEY)
```

- [ ] All environment variables added
- [ ] Values verified

#### Step 5: Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete
- [ ] Check deployment logs
- [ ] Visit deployed URL

#### Step 6: Verify Deployment
- [ ] Site loads correctly
- [ ] All features working
- [ ] Email function operational

## Post-Deployment

### 1. Database Maintenance Setup

Choose cleanup method:

**Option A: pg_cron (Automatic)**
- [ ] Enable pg_cron in Supabase Extensions
- [ ] Schedule daily cleanup job
- [ ] Verify job runs successfully

**Option B: Application-Level (Default)**
- [ ] Cleanup runs on app startup
- [ ] Cleanup runs every 24 hours
- [ ] Monitor console logs

**Option C: Manual**
- [ ] Document cleanup process for team
- [ ] Schedule weekly manual cleanup

### 2. Domain Setup (Optional)

- [ ] Custom domain purchased
- [ ] DNS configured
- [ ] Domain added to Vercel/Netlify
- [ ] SSL certificate issued
- [ ] HTTPS working

### 3. Email Domain Verification (Production)

For production use, verify your domain:

**Resend:**
- [ ] Add DNS records for domain
- [ ] Verify domain ownership
- [ ] Update `from` address in `/api/send-email.js`
- [ ] Test email delivery

**SendGrid:**
- [ ] Complete sender authentication
- [ ] Add DNS records
- [ ] Verify domain
- [ ] Update `from` address

### 4. Monitoring & Analytics (Optional)

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (e.g., Vercel Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure alert notifications

### 5. Team Onboarding

- [ ] Share deployed URL with team
- [ ] Provide login instructions
- [ ] Demonstrate key features
- [ ] Share support contact info

### 6. Documentation

- [ ] README.md updated with deployed URL
- [ ] User guide created (if needed)
- [ ] Admin documentation for maintenance
- [ ] Backup and recovery procedures

## Production Readiness

### Security Checklist
- [ ] Environment variables not exposed in frontend
- [ ] Supabase RLS policies tested
- [ ] API endpoints secured
- [ ] HTTPS enforced
- [ ] No sensitive data in logs

### Performance Checklist
- [ ] Build size optimized
- [ ] Images optimized (if any)
- [ ] Database indexes created
- [ ] Real-time subscriptions working
- [ ] Page load time acceptable (<3s)

### Functionality Checklist
- [ ] All user flows tested in production
- [ ] Email delivery confirmed
- [ ] PDF generation working
- [ ] Signature capture functional on mobile
- [ ] Navigation working on all devices

### Mobile Testing
- [ ] iOS Safari tested
- [ ] Android Chrome tested
- [ ] Responsive design verified
- [ ] Touch interactions working
- [ ] Bottom navigation accessible

## Rollback Plan

If deployment fails:

1. **Revert to previous version**
   - [ ] Identify last working commit
   - [ ] Rollback in Vercel/Netlify dashboard
   - [ ] Verify rollback successful

2. **Database issues**
   - [ ] Check Supabase status
   - [ ] Verify RLS policies
   - [ ] Check connection strings

3. **Email issues**
   - [ ] Verify API key
   - [ ] Check email service status
   - [ ] Test with fallback service

## Support & Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Check email delivery weekly
- [ ] Run database cleanup monthly
- [ ] Review user feedback monthly
- [ ] Update dependencies quarterly

### Emergency Contacts
- **Supabase Support**: https://supabase.com/support
- **Resend Support**: https://resend.com/support
- **Vercel Support**: https://vercel.com/support
- **Developer**: [Your contact info]

## Final Sign-Off

- [ ] All checklist items completed
- [ ] Production URL accessible
- [ ] Team notified
- [ ] Documentation complete
- [ ] Monitoring active

**Deployed URL**: _________________

**Deployment Date**: _________________

**Deployed By**: _________________

---

## Quick Reference

### Deployment Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://hvfvadcadrlfcnqeyflc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DAQw6iTQ-Jb2qHeR8Bot5Q_kNPEzLm6

# Email Service (choose one)
RESEND_API_KEY=re_xxxxx
# OR
SENDGRID_API_KEY=SG.xxxxx
```

### Important Files

- `supabase-schema.sql` - Database setup
- `.env` - Local environment variables
- `/api/send-email.js` - Email API endpoint
- `src/lib/supabase.js` - Supabase client
- `src/lib/pdfGenerator.js` - PDF generation
- `src/lib/cleanup.js` - Database cleanup
