# Keyrai — Ethiopia Property Management Platform

A full-stack property management platform built for Ethiopian landlords and property managers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + Storage)
- **UI**: Custom shadcn-style components with Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **i18n**: English + Amharic (custom dictionary)

## Features

- 🏠 **Property & Unit Management** — Track all properties and units
- 👥 **Tenant Management** — With Ethiopia-specific trust scoring (A–F)
- 💳 **Payments** — Telebirr, CBE Birr, bank transfers with QR receipts
- 🔧 **Maintenance** — Request tracking + vendor assignment
- 📄 **Applications** — Public marketplace with rental applications
- 📊 **Reports** — Revenue and occupancy analytics
- 🌙 **Dark Mode** — Full light/dark theme support
- 🇪🇹 **Bilingual** — English and Amharic

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the database migrations in Supabase SQL editor:
# 1. supabase/migrations/0001_schema.sql
# 2. supabase/migrations/0002_rls.sql
# 3. supabase/seed.sql (optional - for test data)

# Start development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
keyrai/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard pages
│   ├── listings/           # Public listing marketplace
│   ├── apply/[id]/         # Public rental application form
│   ├── verify/[id]/        # Public receipt verification
│   ├── login/ & signup/    # Auth pages
│   └── actions/            # Server actions
├── components/
│   ├── ui/                 # Base UI components
│   ├── app/                # App shell (sidebar, topbar)
│   ├── qr-receipt.tsx      # QR receipt generator
│   └── trust-meter.tsx     # Trust score display
├── lib/
│   ├── supabase/           # Supabase clients (client/server/middleware)
│   ├── i18n/               # English + Amharic dictionaries
│   ├── rbac.ts             # Role-based access control
│   └── trust-score.ts      # Trust score calculator
└── supabase/
    └── migrations/         # SQL schema + RLS policies
```

## Deployment

1. Push to GitHub (this repo)
2. Import to [Vercel](https://vercel.com) 
3. Add environment variables in Vercel dashboard
4. Update Supabase auth redirect URLs to your Vercel URL

## License

Private — Keyrai © 2025
