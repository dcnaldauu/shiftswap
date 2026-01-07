# ShiftSwap - Documentation Index

Welcome to the ShiftSwap Internal Shift Management Platform! This index will help you navigate all documentation and get started quickly.

## 🚀 Getting Started (Choose Your Path)

### I want to get running in 5 minutes
→ **[QUICKSTART.md](QUICKSTART.md)**

### I want detailed installation instructions
→ **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

### I want to understand the project first
→ **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**

### I'm ready to deploy to production
→ **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**

## 📚 Documentation Files

### Core Documentation

| File | Purpose | When to Use |
|------|---------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup guide | First time setup, just want it running |
| **[README.md](README.md)** | Complete feature documentation | Understanding all features, troubleshooting |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Detailed installation steps | Step-by-step setup with explanations |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Complete project overview | Understanding architecture & structure |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Production deployment guide | Going live, pre-launch verification |
| **[APP_STRUCTURE.md](APP_STRUCTURE.md)** | Visual app structure & flows | Understanding user flows & navigation |

### Technical Documentation

| File | Purpose |
|------|---------|
| **[supabase-schema.sql](supabase-schema.sql)** | Complete database schema |
| **[package.json](package.json)** | Dependencies & scripts |
| **[.env.example](.env.example)** | Environment variable template |

## 🎯 Quick Links by Task

### Setting Up

- **Install dependencies**: See [QUICKSTART.md - Step 2](QUICKSTART.md#step-2-install-dependencies)
- **Set up database**: See [SETUP_GUIDE.md - Step 3](SETUP_GUIDE.md#3-set-up-supabase-database)
- **Configure email**: See [SETUP_GUIDE.md - Step 5](SETUP_GUIDE.md#5-email-service-setup)
- **Environment variables**: See [.env.example](.env.example)

### Understanding the App

- **User flows**: See [APP_STRUCTURE.md - Data Flow Diagrams](APP_STRUCTURE.md#data-flow-diagrams)
- **Page layouts**: See [APP_STRUCTURE.md - Page Breakdown](APP_STRUCTURE.md#page-breakdown)
- **Database schema**: See [PROJECT_SUMMARY.md - Database Schema](PROJECT_SUMMARY.md#database-schema)
- **Business rules**: See [README.md - Business Rules](README.md#business-rules-summary)

### Development

- **File structure**: See [PROJECT_SUMMARY.md - File Structure](PROJECT_SUMMARY.md#file-structure)
- **Component hierarchy**: See [APP_STRUCTURE.md - Component Hierarchy](APP_STRUCTURE.md#component-hierarchy)
- **Build commands**: See [PROJECT_SUMMARY.md - Build Commands](PROJECT_SUMMARY.md#build-commands)
- **Tech stack**: See [PROJECT_SUMMARY.md - Technology Stack](PROJECT_SUMMARY.md#technology-stack)

### Deployment

- **Pre-deployment checklist**: See [DEPLOYMENT_CHECKLIST.md - Pre-Deployment](DEPLOYMENT_CHECKLIST.md#pre-deployment)
- **Vercel deployment**: See [DEPLOYMENT_CHECKLIST.md - Deploy to Vercel](DEPLOYMENT_CHECKLIST.md#option-1-deploy-to-vercel)
- **Netlify deployment**: See [DEPLOYMENT_CHECKLIST.md - Deploy to Netlify](DEPLOYMENT_CHECKLIST.md#option-2-deploy-to-netlify)
- **Environment setup**: See [DEPLOYMENT_CHECKLIST.md - Environment Variables](DEPLOYMENT_CHECKLIST.md#step-4-environment-variables)

### Troubleshooting

- **Common issues**: See [README.md - Troubleshooting](README.md#troubleshooting)
- **Setup problems**: See [SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#troubleshooting)
- **Database issues**: See [DEPLOYMENT_CHECKLIST.md - Rollback Plan](DEPLOYMENT_CHECKLIST.md#rollback-plan)

## 📋 Feature Documentation

### Core Features

| Feature | Description | Documentation |
|---------|-------------|---------------|
| **Authentication** | Email/password signup with 4-digit staff ID | [README.md - Authentication](README.md#3-user-journey--authentication) |
| **Signature Capture** | Mandatory signature on first login | [README.md - Signature](README.md#phase-a-onboarding) |
| **Shift Marketplace** | Browse and filter available shifts | [README.md - Shifts Tab](README.md#a-shifts-tab-the-feed) |
| **Giveaway Shifts** | Give away shifts immediately | [APP_STRUCTURE.md - Giveaway Flow](APP_STRUCTURE.md#giveaway-flow) |
| **Swap Shifts** | Exchange shifts with other employees | [APP_STRUCTURE.md - Swap Flow](APP_STRUCTURE.md#swap-flow) |
| **Request Management** | Handle incoming/outgoing swap proposals | [README.md - Requests Tab](README.md#c-requests-tab-the-transaction-hub) |
| **Status Tracking** | Monitor shift approval status | [README.md - My Shifts Tab](README.md#d-my-shifts-tab) |
| **PDF Generation** | Auto-generated forms with signatures | [README.md - PDF Implementation](README.md#8-pdf-form-auto-fill-implementation) |
| **Email Automation** | Manager notifications with PDF | [README.md - Automated Email](README.md#automated-email-logic) |
| **Auto-Cleanup** | Remove old requests after 7 days | [SETUP_GUIDE.md - Auto-Cleanup](SETUP_GUIDE.md#auto-cleanup-of-old-requests) |

## 🗂️ Project Structure

```
shiftswap/
├── 📄 Documentation
│   ├── INDEX.md (this file)
│   ├── QUICKSTART.md
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   ├── PROJECT_SUMMARY.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── APP_STRUCTURE.md
│
├── 🗄️ Database
│   └── supabase-schema.sql
│
├── ⚙️ Configuration
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── 🌐 API
│   └── api/send-email.js
│
└── 💻 Source Code
    └── src/
        ├── components/
        ├── lib/
        ├── pages/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

See [PROJECT_SUMMARY.md - File Structure](PROJECT_SUMMARY.md#file-structure) for detailed breakdown.

## 🎓 Learning Paths

### For First-Time Users

1. Read [QUICKSTART.md](QUICKSTART.md) - Get basic understanding
2. Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup
3. Check [APP_STRUCTURE.md](APP_STRUCTURE.md) - Understand navigation
4. Read [README.md](README.md) - Learn all features

### For Developers

1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Understand architecture
2. Check [APP_STRUCTURE.md](APP_STRUCTURE.md) - See component hierarchy
3. Review source code in `src/` directory
4. Read [README.md - Tech Stack](README.md#5-technical-stack--data-schema)

### For System Administrators

1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md) - Understand setup process
2. Review [supabase-schema.sql](supabase-schema.sql) - Database structure
3. Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment process
4. Read [SETUP_GUIDE.md - Maintenance](SETUP_GUIDE.md#database-maintenance)

### For Deployers

1. Complete [QUICKSTART.md](QUICKSTART.md) - Test locally first
2. Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step by step
3. Check [README.md - Deployment](README.md#deployment)
4. Review [DEPLOYMENT_CHECKLIST.md - Post-Deployment](DEPLOYMENT_CHECKLIST.md#post-deployment)

## 🔍 Search by Topic

### Authentication & Users
- Sign up process: [README.md - Onboarding](README.md#phase-a-onboarding)
- Signature capture: [SETUP_GUIDE.md - Testing](SETUP_GUIDE.md#create-first-user)
- Profile management: [README.md - Settings](README.md#e-settings-tab)

### Shifts
- Creating shifts: [README.md - Create Shift](README.md#b-create-shift-center-button)
- Shift validation: [README.md - Validation](README.md#validation)
- Status management: [README.md - My Shifts](README.md#d-my-shifts-tab)

### Requests
- Swap requests: [README.md - Requests Tab](README.md#c-requests-tab-the-transaction-hub)
- Handshake logic: [README.md - Incoming](README.md#incoming)
- Auto-cleanup: [SETUP_GUIDE.md - Cleanup](SETUP_GUIDE.md#auto-cleanup-of-old-requests)

### Email & PDF
- PDF generation: [README.md - PDF Implementation](README.md#8-pdf-form-auto-fill-implementation)
- Email setup: [SETUP_GUIDE.md - Email Service](SETUP_GUIDE.md#5-email-service-setup)
- Email API: [api/send-email.js](api/send-email.js)

### Database
- Schema: [supabase-schema.sql](supabase-schema.sql)
- Setup: [SETUP_GUIDE.md - Database](SETUP_GUIDE.md#3-set-up-supabase-database)
- Maintenance: [SETUP_GUIDE.md - Maintenance](SETUP_GUIDE.md#database-maintenance)

### Deployment
- Vercel: [DEPLOYMENT_CHECKLIST.md - Vercel](DEPLOYMENT_CHECKLIST.md#option-1-deploy-to-vercel)
- Netlify: [DEPLOYMENT_CHECKLIST.md - Netlify](DEPLOYMENT_CHECKLIST.md#option-2-deploy-to-netlify)
- Environment: [.env.example](.env.example)

## 📞 Getting Help

### Self-Service Resources

1. **Troubleshooting**: [README.md - Troubleshooting](README.md#troubleshooting)
2. **Setup Issues**: [SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#troubleshooting)
3. **FAQ**: Check each documentation file for specific FAQs

### External Resources

- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Vite**: [vitejs.dev](https://vitejs.dev)
- **React**: [react.dev](https://react.dev)
- **Tailwind**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

## ✅ Checklists

### Setup Checklist
→ See [SETUP_GUIDE.md - Installation](SETUP_GUIDE.md#step-by-step-installation)

### Testing Checklist
→ See [DEPLOYMENT_CHECKLIST.md - Testing](DEPLOYMENT_CHECKLIST.md#4-testing-checklist-)

### Deployment Checklist
→ See [DEPLOYMENT_CHECKLIST.md - Deployment](DEPLOYMENT_CHECKLIST.md#deployment)

## 🎯 Next Steps

### If you're new here:
1. Start with [QUICKSTART.md](QUICKSTART.md)
2. Get the app running locally
3. Create a test account and try all features
4. Read [README.md](README.md) for complete understanding

### If you're ready to deploy:
1. Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Test thoroughly before going live
4. Set up monitoring and maintenance

### If you need to customize:
1. Review [APP_STRUCTURE.md](APP_STRUCTURE.md)
2. Check source code in `src/` directory
3. Understand database schema in [supabase-schema.sql](supabase-schema.sql)
4. Make changes and test thoroughly

---

## 📊 Documentation Stats

- **Total Documentation Files**: 7
- **Total Pages**: ~100 (estimated)
- **Code Files**: 20+
- **Database Tables**: 3
- **API Endpoints**: 1
- **Pages**: 6 (including auth)

## 🏆 Quick Wins

**Get running in 5 minutes**: [QUICKSTART.md](QUICKSTART.md)

**Deploy to production**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**Understand everything**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Built with Claude Code** 🤖

Version: 1.0.0 | Last Updated: 2026-01-06
