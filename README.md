# ShopifyPro - Multi-tenant Analytics Platform

A world-class, production-ready multi-tenant Shopify analytics platform built with Next.js 15, featuring Apple/Nike-inspired design, real-time data synchronization, and enterprise-grade security.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748)

## ✨ Features

### 🏢 Multi-tenancy
- **Complete data isolation** with tenant_id-based row-level security
- Each Shopify store operates as an isolated tenant
- Secure authentication with NextAuth v5
- Admin and user role management

### 📊 Real-time Analytics
- Live dashboard with key metrics (revenue, orders, customers)
- Beautiful data visualizations using Recharts
- Orders over time trends (line charts)
- Top customers by spend (bar charts)
- Recent orders table with status indicators

### 🔄 Shopify Integration
- **Webhook handlers** for real-time updates:
  - Orders (create, update)
  - Products (create, update)
  - Customers (create, update)
- **Scheduled sync** via Vercel Cron (every 6 hours)
- Automatic data reconciliation to prevent missed events

### 🎨 Premium UI/UX
- Apple/Nike-inspired minimalist design
- Smooth Framer Motion animations
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Generous whitespace and clean typography
- Subtle hover effects and transitions

### 🔒 Security
- Password hashing with bcrypt
- Session-based authentication
- Protected API routes with middleware
- Tenant isolation at database level
- Environment variable management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Shopify development store (optional for testing)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd shopify-analytics
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_analytics"

# NextAuth
AUTH_SECRET="generate-a-secret-key-here"  # Run: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Shopify (optional for development)
SHOPIFY_API_VERSION="2024-01"

# Vercel Cron (production only)
CRON_SECRET="your-cron-secret"
```

4. **Initialize the database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

5. **Start the development server**

```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma        # Database schema with multi-tenant models
│   └── seed.ts              # Sample data for testing
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── dashboard/   # Dashboard data APIs
│   │   │   ├── shopify/     # Webhook handlers
│   │   │   └── sync-shopify/ # Cron sync endpoint
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup/onboarding page
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   ├── landing/         # Landing page components
│   │   └── ui/              # Shadcn/UI components
│   └── lib/
│       ├── prisma.ts        # Prisma client
│       └── auth.ts          # Auth utilities
├── auth.ts                  # NextAuth configuration
├── middleware.ts            # Route protection
└── vercel.json             # Vercel cron configuration
```

## 🧪 Testing

### Sample Data

Use Prisma seed to create test data:

```bash
npx prisma db seed
```

This creates:
- Sample tenant (store)
- Admin user
- Products, customers, and orders

### Test Credentials (after seeding)
- **Email**: `admin@example.com`
- **Password**: `password123`

## 🚢 Deployment on Vercel

1. **Push to GitHub**
2. **Import project to Vercel**
3. **Set environment variables**:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `CRON_SECRET`
4. **Deploy**

The `vercel.json` configuration enables automatic cron jobs for Shopify sync.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new tenant and user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Dashboard
- `GET /api/dashboard/summary` - Overview statistics
- `GET /api/dashboard/orders-over-time?days=30` - Chart data

### Webhooks (Shopify)
- `POST /api/shopify/webhook/orders` - Order events
- `POST /api/shopify/webhook/products` - Product events
- `POST /api/shopify/webhook/customers` - Customer events

### Cron
- `GET /api/sync-shopify` - Scheduled sync (Vercel Cron)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **UI Components**: Shadcn/UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Hosting**: Vercel

## 📊 Database Schema

All models include `tenantId` for multi-tenant isolation:

- **Tenant**: Shopify store configuration
- **User**: Admin/users with role-based access
- **Product**: Synced product catalog
- **Customer**: Customer profiles and stats
- **Order**: Transaction history
- **CartEvent**: Abandoned cart tracking

## 🔐 Security Features

✅ Bcrypt password hashing  
✅ Session-based authentication  
✅ Protected API routes  
✅ Tenant data isolation  
✅ Environment variables  
✅ HTTPS (automatic on Vercel)  
✅ SQL injection prevention (Prisma)  

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

**Built with ❤️ as a demonstration of world-class full-stack engineering**