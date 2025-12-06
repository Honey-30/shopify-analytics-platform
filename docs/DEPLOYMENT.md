# Deployment Guide

Complete guide to deploying ShopifyPro to production on Vercel and other platforms.

---

## Vercel Deployment (Recommended)

### Prerequisites

- GitHub/GitLab account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres, Railway, or Supabase)

### Step 1: Prepare Repository

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/shopify-pro.git
git push -u origin main
```

2. **Ensure files are ready**
- ✅ `package.json` has build script
- ✅ `.env.example` exists
- ✅ `vercel.json` configured (optional cron)

### Step 2: Create PostgreSQL Database

**Option A: Vercel Postgres** (easiest)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database → Postgres
3. Copy `DATABASE_URL` connection string

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project → PostgreSQL
3. Copy connection string from Variables tab

**Option C: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create project → Get connection pooler URL
3. Use `postgres://` format (not `postgresql://`)

### Step 3: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select framework: **Next.js**

2. **Configure Environment Variables**

Add these in Vercel dashboard (Settings → Environment Variables):

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://your-domain.vercel.app"

# Shopify API
SHOPIFY_API_VERSION="2024-01"

# Vercel Cron (if using scheduled sync)
CRON_SECRET="your-secure-random-string"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Step 4: Run Database Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations locally (connected to production DB)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed database
npx prisma db seed
```

**⚠️ Warning:** This modifies your production database. Always backup first!

### Step 5: Setup Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)
4. Update `AUTH_URL` environment variable to your custom domain

### Step 6: Enable Vercel Cron (Optional)

If you removed cron from `vercel.json` due to limits:

**Option 1: Upgrade Vercel Plan**
- Vercel Pro: 100 cron jobs
- Vercel Enterprise: Unlimited

**Option 2: External Cron Service**

Use [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

```
URL: https://your-domain.vercel.app/api/sync-shopify
Schedule: 0 */6 * * * (every 6 hours)
Headers: Authorization: Bearer YOUR_CRON_SECRET
```

---

## Railway Deployment

### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository

### Steps

1. **Create New Project**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add PostgreSQL**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

3. **Configure Environment Variables**

Add in Railway dashboard (Variables tab):

```env
AUTH_SECRET=your-secret-here
AUTH_URL=https://your-app.up.railway.app
SHOPIFY_API_VERSION=2024-01
CRON_SECRET=your-cron-secret
```

4. **Deploy**
   - Railway auto-deploys on git push
   - Get public URL from Settings → Networking → Generate Domain

5. **Run Migrations**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed (optional)
railway run npx prisma db seed
```

---

## Render Deployment

### Prerequisites
- Render account ([render.com](https://render.com))
- GitHub repository

### Steps

1. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Copy "Internal Database URL"

2. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Configure:
     - **Build Command**: `bun install && bunx prisma generate && bun run build`
     - **Start Command**: `bun start`
     - **Environment**: Node

3. **Add Environment Variables**

```env
DATABASE_URL=your-internal-database-url
AUTH_SECRET=your-secret
AUTH_URL=https://your-app.onrender.com
SHOPIFY_API_VERSION=2024-01
CRON_SECRET=your-cron-secret
```

4. **Deploy**
   - Render auto-deploys
   - First deploy: ~5-10 minutes

5. **Run Migrations**

Use Render Shell:
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Docker Deployment (Self-Hosted)

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: shopify
      POSTGRES_PASSWORD: secure-password
      POSTGRES_DB: shopify_analytics
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://shopify:secure-password@postgres:5432/shopify_analytics
      AUTH_SECRET: your-secret-here
      AUTH_URL: http://localhost:3000
      SHOPIFY_API_VERSION: 2024-01
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Commands

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth secret key | `openssl rand -base64 32` |
| `AUTH_URL` | Public URL of app | `https://your-domain.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SHOPIFY_API_VERSION` | Shopify API version | `2024-01` |
| `CRON_SECRET` | Secret for cron auth | `random-string` |
| `NODE_ENV` | Environment mode | `production` |

---

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Seed data loaded (for testing)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic on Vercel/Railway/Render)
- [ ] Environment variables set correctly
- [ ] Test login with seed user: `admin@example.com` / `password123`
- [ ] Dashboard loads without errors
- [ ] API endpoints respond correctly
- [ ] Shopify webhooks configured (use `/api/shopify/setup-webhooks`)
- [ ] Cron job scheduled (if using)
- [ ] Monitoring enabled (Vercel Analytics, Sentry, etc.)

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Error**: `ECONNREFUSED` to database

**Solution**: Check `DATABASE_URL` format and SSL requirements.

### Runtime Errors

**Error**: 500 on dashboard

**Solution**: Check Vercel logs:
```bash
vercel logs --follow
```

**Error**: Session not persisting

**Solution**: Verify `AUTH_SECRET` and `AUTH_URL` match deployment URL.

### Database Issues

**Error**: Prisma migrations pending

**Solution**:
```bash
npx prisma migrate deploy
```

**Error**: Connection pool exhausted

**Solution**: Use connection pooling:
```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

---

## Performance Optimization

### 1. Enable Caching

Add caching headers to API routes:

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

### 2. Database Indexing

Ensure indexes exist:
```bash
npx prisma migrate dev --name add-indexes
```

### 3. Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image src="/logo.png" width={200} height={50} alt="Logo" />
```

### 4. Code Splitting

Use dynamic imports:
```tsx
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false })
```

---

## Monitoring & Analytics

### Vercel Analytics (Built-in)

Automatically tracks:
- Page views
- Web Vitals (LCP, FID, CLS)
- Geographic data

### Custom Monitoring

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

---

## Backup Strategy

### Database Backups

**Vercel Postgres**: Automatic daily backups (7-day retention)

**Railway**: Enable backups in dashboard

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup-20241206.sql
```

---

## Security Hardening

1. **Enable CORS** (if needed for mobile apps)
2. **Rate limiting** (Vercel Edge Config)
3. **Webhook signature validation** (Shopify HMAC)
4. **SQL injection prevention** (Prisma handles this)
5. **XSS protection** (React auto-escaping)
6. **Environment secrets** (never commit .env)

---

**Last Updated**: December 2024  
**Deployment Version**: 1.0.0  
**Support**: See GitHub Issues
