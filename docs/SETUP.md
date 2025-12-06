# Setup Guide

Complete setup instructions for local development and production deployment.

---

## Prerequisites

### Required Software

- **Node.js** 18+ or **Bun** 1.0+ (recommended)
- **PostgreSQL** 14+ (local or cloud)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### Accounts (for production)

- **GitHub** account (for code hosting)
- **Vercel** account (for hosting)
- **Shopify Partner** account (for development stores)
- **Database provider** (Vercel Postgres, Railway, or Supabase)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/shopify-pro.git
cd shopify-pro
```

### Step 2: Install Dependencies

**Using Bun (recommended):**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

### Step 3: Setup PostgreSQL Database

**Option A: Local PostgreSQL**

1. Install PostgreSQL:
```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from postgresql.org and run installer
```

2. Create database:
```bash
createdb shopify_analytics

# Or using psql
psql postgres
CREATE DATABASE shopify_analytics;
\q
```

3. Get connection string:
```bash
# Default local connection
DATABASE_URL="postgresql://localhost:5432/shopify_analytics"

# With username/password
DATABASE_URL="postgresql://username:password@localhost:5432/shopify_analytics"
```

**Option B: Docker PostgreSQL**

```bash
docker run --name shopify-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=shopify_analytics \
  -p 5432:5432 \
  -d postgres:14-alpine

# Connection string
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/shopify_analytics"
```

**Option C: Cloud Database (Development)**

Use Vercel Postgres, Railway, or Supabase (see DEPLOYMENT.md for details).

### Step 4: Configure Environment Variables

Create `.env` file in root directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://localhost:5432/shopify_analytics"

# Authentication
AUTH_SECRET="generate-this-below"
AUTH_URL="http://localhost:3000"

# Shopify API
SHOPIFY_API_VERSION="2024-01"

# Cron Secret (for scheduled sync)
CRON_SECRET="local-cron-secret-123"

# Optional: Node environment
NODE_ENV="development"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

Copy the output and paste into `.env` as `AUTH_SECRET`.

### Step 5: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

**What gets seeded:**
- 1 demo tenant (store)
- 1 admin user (`admin@example.com` / `password123`)
- 5 sample customers
- 4 sample products
- ~80 orders (last 30 days)
- 2 cart events

### Step 6: Start Development Server

**Using Bun:**
```bash
bun dev
```

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

Server starts at: **http://localhost:3000**

---

## Verify Setup

### Test Login

1. Open http://localhost:3000
2. Click "Login" or go to http://localhost:3000/login
3. Enter credentials:
   - **Email**: `admin@example.com`
   - **Password**: `password123`
4. Should redirect to dashboard with data

### Check Dashboard

- **Total Revenue**: Should show ~$30,000-40,000
- **Total Orders**: Should show ~80 orders
- **Total Customers**: Should show 5 customers
- **Charts**: Should display orders over time (last 30 days)
- **Top Customers**: Should show 5 customers ranked by spend

### Test API Endpoints

```bash
# Test summary endpoint (requires login first)
curl http://localhost:3000/api/dashboard/summary \
  -H "Cookie: next-auth.session-token=<your-token>"

# Test sync endpoint
curl http://localhost:3000/api/sync-shopify \
  -H "Authorization: Bearer local-cron-secret-123"
```

---

## Shopify Development Store Setup

### Step 1: Create Shopify Partner Account

1. Go to [shopify.com/partners](https://www.shopify.com/partners)
2. Sign up for free
3. Complete profile setup

### Step 2: Create Development Store

1. In Partner Dashboard, click "Stores"
2. Click "Add store" → "Development store"
3. Fill in details:
   - Store name: `shopify-pro-dev`
   - Store purpose: `Testing app or theme`
4. Click "Create development store"

### Step 3: Generate Admin API Access Token

1. Go to your dev store admin: `your-store.myshopify.com/admin`
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **"Develop apps"** (may need to enable first)
4. Click **"Create an app"**
5. App name: `ShopifyPro Analytics`
6. Click **"Create app"**
7. Go to **"Configuration"** tab
8. Under **"Admin API access scopes"**, select:
   - `read_products`
   - `write_products`
   - `read_customers`
   - `write_customers`
   - `read_orders`
   - `write_orders`
9. Click **"Save"**
10. Go to **"API credentials"** tab
11. Click **"Install app"**
12. Copy **Admin API access token**

### Step 4: Update Local Database

Connect your Shopify store to the seeded tenant:

```bash
# Open Prisma Studio
npx prisma studio
```

1. Go to **Tenant** model
2. Edit the demo store record:
   - `shopDomain`: Your store domain (e.g., `shopify-pro-dev.myshopify.com`)
   - `accessToken`: Your Admin API access token
   - `apiKey`: (optional) Your API key
3. Save changes

### Step 5: Test Shopify Integration

```bash
# Test sync with real Shopify data
curl http://localhost:3000/api/sync-shopify \
  -H "Authorization: Bearer local-cron-secret-123"
```

Check logs for successful product/order sync.

### Step 6: Setup Webhooks (Optional for local dev)

For local webhook testing, use [ngrok](https://ngrok.com):

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Then setup webhooks via API:

```bash
# Login first to get session cookie
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c cookies.txt

# Setup webhooks
curl -X POST http://localhost:3000/api/shopify/setup-webhooks \
  -b cookies.txt
```

Or manually in Shopify:
1. Go to **Settings** → **Notifications**
2. Scroll to **Webhooks**
3. Click **"Create webhook"**
4. Configure:
   - **Event**: `Order creation`
   - **Format**: `JSON`
   - **URL**: `https://your-ngrok-url.ngrok.io/api/shopify/webhook/orders`
5. Repeat for other events (products, customers)

---

## IDE Setup (VS Code)

### Recommended Extensions

```json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "unifiedjs.vscode-mdx"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Database Management

### Prisma Studio (Visual Database Editor)

```bash
npx prisma studio
```

Opens at http://localhost:5555 - GUI for viewing/editing database records.

### Common Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name description-of-changes

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed

# View database in browser
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

### Manual SQL Access

```bash
# Connect to local database
psql shopify_analytics

# List tables
\dt

# Describe table
\d "Tenant"

# Run query
SELECT * FROM "User" LIMIT 5;

# Exit
\q
```

---

## Troubleshooting Setup Issues

### Issue: `DATABASE_URL` not found

**Solution**: Ensure `.env` file exists in root directory and contains `DATABASE_URL`.

### Issue: Prisma Client not generated

**Solution**:
```bash
npx prisma generate
```

### Issue: Migration fails

**Solution**:
```bash
# Reset and start fresh
npx prisma migrate reset
npx prisma migrate dev
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue: Cannot connect to PostgreSQL

**Solution**:
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Test connection: `psql $DATABASE_URL`

### Issue: Seed fails with duplicate key error

**Solution**:
```bash
# Clear database first
npx prisma migrate reset
npx prisma db seed
```

---

## Project Scripts Reference

```json
{
  "dev": "next dev --turbopack",           // Start dev server
  "build": "prisma generate && next build", // Build for production
  "start": "next start",                    // Start production server
  "lint": "next lint",                      // Run ESLint
  "postinstall": "prisma generate"          // Auto-generate Prisma Client
}
```

**Custom scripts you can add:**

```json
{
  "db:studio": "prisma studio",
  "db:seed": "prisma db seed",
  "db:reset": "prisma migrate reset",
  "db:migrate": "prisma migrate dev",
  "type-check": "tsc --noEmit"
}
```

---

## Next Steps

After successful setup:

1. ✅ **Explore the codebase** - Read ARCHITECTURE.md
2. ✅ **Customize branding** - Edit landing page components
3. ✅ **Connect real Shopify store** - Follow Shopify setup section
4. ✅ **Add features** - See API.md for extending functionality
5. ✅ **Deploy to production** - Follow DEPLOYMENT.md

---

**Last Updated**: December 2024  
**Setup Version**: 1.0.0  
**Support**: See GitHub Issues
