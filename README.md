# ShiftSwap - Internal Shift Management Platform

A mobile-first web application for internal employee shift management, replacing manual paper forms and group chats with a structured marketplace for shift giveaways and swaps.

## Features

- **User Authentication**: Sign up with staff ID and mandatory signature capture
- **Shift Marketplace**: Browse and take available shifts with real-time updates
- **Giveaways & Swaps**: Post shifts as either giveaway or swap opportunities
- **Request Management**: Handle incoming and outgoing shift swap proposals
- **Status Tracking**: Monitor shift status from posting through manager approval
- **Automated Forms**: Auto-generated PDFs with signatures sent to management
- **Mobile-First Design**: Optimized for mobile devices with clean, minimalist UI

## Visual Design

- **Primary**: #000000 (Black) - Backgrounds, primary text
- **Secondary**: #FFFFFF (White) - Card backgrounds, secondary text
- **Accent**: #DDBB56 (Gold) - Primary buttons, active states, highlights
- **Aesthetic**: High-contrast, minimalist, Swiss-style typography

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: pdf-lib
- **Signature Capture**: signature_pad
- **Email**: Resend/SendGrid API
- **Routing**: React Router DOM

## Prerequisites

- Node.js 16+ and npm
- Supabase account
- Email service API key (Resend or SendGrid)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd shiftswap
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
VITE_SUPABASE_URL=https://hvfvadcadrlfcnqeyflc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DAQw6iTQ-Jb2qHeR8Bot5Q_kNPEzLm6
VITE_EMAIL_SERVICE_API_KEY=your_api_key_here
```

4. Set up the Supabase database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL commands

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Database Schema

### profiles
- `id` (UUID) - Primary key, references auth.users
- `email` (TEXT) - Unique email address
- `full_name` (TEXT) - Employee full name
- `staff_id` (TEXT) - 4-digit staff ID (unique)
- `signature_blob` (TEXT) - Base64 encoded signature image
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### shifts
- `id` (UUID) - Primary key
- `poster_id` (UUID) - References profiles
- `type` (TEXT) - 'Giveaway' or 'Swap'
- `date` (DATE) - Shift date
- `start_time` (TIME) - Shift start time
- `end_time` (TIME) - Shift end time
- `area` (TEXT) - 'Gaming', 'GPU', or 'Bar'
- `status` (TEXT) - 'Open', 'Claimed', 'Completed', 'Uncompleted'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### swap_requests
- `id` (UUID) - Primary key
- `shift_id` (UUID) - References shifts
- `proposer_id` (UUID) - References profiles
- `proposer_shift_date` (DATE)
- `proposer_start_time` (TIME)
- `proposer_end_time` (TIME)
- `proposer_area` (TEXT) - 'Gaming', 'GPU', or 'Bar'
- `status` (TEXT) - 'Pending', 'Accepted', 'Declined'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Business Rules

1. **12-Hour Minimum**: Shifts cannot be posted within 12 hours of start time
2. **Universal Access**: All employees can see and take any shift
3. **Manager Authority**: Hour-based restrictions enforced by manager approval, not app
4. **Status Flow**: Open → Claimed → Completed/Uncompleted
5. **Request Handshake**: Accepting one request auto-declines all others for that shift
6. **Auto-Cleanup**: Accepted/Declined requests older than 7 days are auto-deleted

## Shift Posting Workflow

1. **Create Shift**: User posts shift with 12-hour minimum validation
2. **Marketplace**: Shift appears in feed as "Open"
3. **Taking a Shift**:
   - **Giveaway**: Immediate claim → Email sent → Status: "Claimed"
   - **Swap**: Propose shift → Wait for acceptance → Email sent → Status: "Claimed"
4. **Manager Review**: Poster marks shift as "Approved" or "Declined"
   - **Approved**: Status → "Completed"
   - **Declined**: Status → "Open" (returns to marketplace)

## Email Integration

### Setup with Resend

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`: `VITE_EMAIL_SERVICE_API_KEY=re_...`
4. Deploy the `/api/send-email.js` function

### Setup with SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to `.env`: `VITE_EMAIL_SERVICE_API_KEY=SG...`
4. Update `/api/send-email.js` to use SendGrid implementation

## Deployment

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variables in dashboard
4. Deploy

### Backend API

The `/api/send-email.js` function can be deployed as:
- Vercel Serverless Function (automatic with Vercel deployment)
- Netlify Function (place in `/netlify/functions/`)
- Standalone Express/Node server

## Project Structure

```
shiftswap/
├── api/
│   └── send-email.js          # Email API endpoint
├── public/
│   └── assets/                # Static assets
├── src/
│   ├── components/
│   │   ├── MainLayout.jsx     # Bottom nav layout
│   │   └── ShiftCard.jsx      # Shift display card
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   ├── pdfGenerator.js    # PDF form generation
│   │   └── emailService.js    # Email sending logic
│   ├── pages/
│   │   ├── AuthPage.jsx       # Login/signup
│   │   ├── SignaturePage.jsx  # Signature capture
│   │   ├── ShiftsPage.jsx     # Marketplace feed
│   │   ├── RequestsPage.jsx   # Incoming/outgoing requests
│   │   ├── CreateShiftPage.jsx # Post new shift
│   │   ├── MyShiftsPage.jsx   # Personal shift management
│   │   └── SettingsPage.jsx   # Profile settings
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json
├── supabase-schema.sql        # Database schema
└── README.md
```

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### Signature Pad Not Working
- Ensure canvas is properly sized
- Check touch events are enabled
- Verify signature_pad library is imported correctly

### Email Not Sending
- Verify API key in `.env`
- Check email service API limits
- Ensure `/api/send-email` endpoint is deployed
- Check browser console for errors

### Database Connection Issues
- Verify Supabase URL and anon key
- Check RLS policies are enabled
- Ensure database schema is up to date

### PDF Generation Errors
- Verify pdf-lib is installed
- Check signature blobs are valid PNG base64
- Ensure proper error handling in pdfGenerator.js

## Support

For issues or questions, contact your system administrator.

## License

Internal use only - Proprietary
