# ShiftSwap - Quick Start Guide

Get ShiftSwap up and running in 5 minutes!

## Step 1: Install Node.js (if not installed)

Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

## Step 2: Install Dependencies

Open terminal in the `shiftswap` folder:

```bash
npm install
```

Wait for installation to complete (~2-3 minutes).

## Step 3: Set Up Database

1. Go to [supabase.com](https://supabase.com)
2. Sign in (or create account)
3. Your project is already set up at: `https://hvfvadcadrlfcnqeyflc.supabase.co`
4. Click **SQL Editor** (left sidebar)
5. Click **New Query**
6. Open `supabase-schema.sql` from this project folder
7. Copy all the SQL code
8. Paste into Supabase SQL Editor
9. Click **Run** button

You should see "Success. No rows returned" message.

## Step 4: Configure Email Service

### Quick Setup with Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `re_`)
6. Open `.env` file in this project
7. Replace `your_sendgrid_or_resend_api_key_here` with your key:

```
VITE_EMAIL_SERVICE_API_KEY=re_your_key_here
```

## Step 5: Start the App

In terminal:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Step 6: Create Your First Account

1. Click **Sign Up**
2. Fill in:
   - Full Name: Your Name
   - Staff ID: 1234 (any 4 digits)
   - Email: your@email.com
   - Password: (at least 6 characters)
3. Click **Sign Up**
4. Draw your signature on the canvas
5. Click **Save Signature**

You're in!

## Step 7: Post Your First Shift

1. Click the **gold + button** in the center bottom
2. Select **Giveaway** or **Swap**
3. Choose a date (tomorrow or later)
4. Set times (must be 12+ hours in future)
5. Select area: Gaming, GPU, or Bar
6. Click **Post Shift**

Done! Your shift is now live in the marketplace.

## Troubleshooting

### "npm: command not found"
→ Install Node.js from [nodejs.org](https://nodejs.org/)

### Database connection error
→ Check that `.env` has correct Supabase URL and key

### Email not sending
→ Verify Resend API key in `.env`
→ Check that you deployed the API endpoint (for production)

### Signature not saving
→ Make sure you drew something on the canvas
→ Check browser console for errors

## Navigation Guide

**Bottom Navigation Bar:**

- 📋 **Shifts** - Browse available shifts (marketplace)
- 🔄 **Requests** - Manage swap proposals (incoming/outgoing)
- **+ (Gold Button)** - Post a new shift
- 📅 **My Shifts** - Track your posted shifts
- ⚙️ **Settings** - Update password & signature

## Key Features

### Giveaway
- Post a shift you want to give away
- Anyone can take it immediately
- Auto-generates PDF and emails manager
- Track status: Open → Claimed → Approved/Declined

### Swap
- Post a shift you want to swap
- Others propose their shifts
- You choose which swap to accept
- Auto-declines other proposals
- Auto-generates PDF and emails manager

### Status Management
When someone takes your shift:
1. Status becomes **Claimed**
2. Wait for manager to review
3. Mark as **Approved** (Completed) or **Declined**
4. If declined, shift returns to marketplace

## Next Steps

- Read [README.md](README.md) for full documentation
- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) before going live

## Support

Need help? Check the [README.md](README.md) troubleshooting section or contact your system administrator.

---

**That's it! You're ready to use ShiftSwap!**

Happy shift swapping! 🎉
