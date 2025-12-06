# Quick Reference Guide

Essential commands and quick solutions for common tasks.

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone <repo-url>
cd shopify-pro
bun install

# Database setup
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start dev server
bun dev
```

**Default Login**: `admin@example.com` / `password123`

---

## 📋 Common Commands

### Development

```bash
# Start dev server
bun dev                     # or npm run dev

# Build for production
bun run build              # or npm run build

# Start production server
bun start                  # or npm start

# Run linter
bun run lint               # or npm run lint
```

### Database

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Format schema file
npx prisma format
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull .env.local

# View logs
vercel logs --follow
```

---

## 🔑 Environment Variables

### Required

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
```

### Optional

```env
SHOPIFY_API_VERSION="2024-01"
CRON_SECRET="random-string"
NODE_ENV="development"
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 🐛 Quick Troubleshooting

### Build Errors

**Error**: `Cannot find module '@prisma/client'`

```bash
npx prisma generate
```

**Error**: `DATABASE_URL not found`

```bash
# Check .env file exists
cat .env

# Copy from example
cp .env.example .env
```

### Runtime Errors

**Error**: 500 on dashboard

```bash
# Check server logs
bun dev
# Look for error messages in terminal
```

**Error**: Session not working

```bash
# Verify AUTH_SECRET and AUTH_URL
echo $AUTH_SECRET
echo $AUTH_URL
```

### Database Issues

**Error**: Connection refused

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

**Error**: Migrations pending

```bash
npx prisma migrate deploy
```

### Port Issues

**Error**: Port 3000 in use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 bun dev
```

---

## 📡 API Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c cookies.txt
```

**Get Dashboard:**
```bash
curl http://localhost:3000/api/dashboard/summary \
  -b cookies.txt
```

**Trigger Sync:**
```bash
curl http://localhost:3000/api/sync-shopify \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🗄️ Database Quick Access

### PostgreSQL Commands

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d "Tenant"

# Run query
SELECT * FROM "User";

# Count records
SELECT COUNT(*) FROM "Order";

# Exit
\q
```

### Prisma Studio

```bash
# Open visual editor
npx prisma studio
# Opens at http://localhost:5555
```

---

## 📦 Package Management

### Install Packages

```bash
# Using Bun (recommended)
bun add <package>
bun add -d <package>  # dev dependency

# Using npm
npm install <package>
npm install -D <package>
```

### Update Dependencies

```bash
# Check outdated
bun outdated
npm outdated

# Update all
bun update
npm update
```

---

## 🔄 Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Description"

# Push to remote
git push origin main

# Create branch
git checkout -b feature-name

# Merge branch
git checkout main
git merge feature-name
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run `bun run build` locally (test build)
- [ ] Check environment variables
- [ ] Test migrations: `npx prisma migrate deploy`
- [ ] Update README with deployment URL
- [ ] Commit and push changes

### Vercel Deployment

1. **Import project** at vercel.com/new
2. **Add environment variables**:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `CRON_SECRET`
3. **Deploy** (auto-builds)
4. **Run migrations**:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```
5. **Test** at your-project.vercel.app

### Post-Deployment

- [ ] Test login
- [ ] Check dashboard loads
- [ ] Verify API endpoints work
- [ ] Setup custom domain (optional)
- [ ] Enable monitoring

---

## 🔧 Common Tasks

### Add New Feature

```bash
# 1. Create branch
git checkout -b feature-name

# 2. Make changes
# ... edit files ...

# 3. Test locally
bun dev

# 4. Commit and push
git add .
git commit -m "Add feature"
git push origin feature-name

# 5. Create PR on GitHub
```

### Update Database Schema

```bash
# 1. Edit prisma/schema.prisma
# ... make changes ...

# 2. Create migration
npx prisma migrate dev --name add-field

# 3. Regenerate client
npx prisma generate

# 4. Restart dev server
# (auto-restarts with --turbopack)
```

### Setup Shopify Webhooks

```bash
# 1. Login to app
# 2. Call setup endpoint
curl -X POST http://localhost:3000/api/shopify/setup-webhooks \
  -b cookies.txt

# Or use the dashboard (future feature)
```

---

## 📊 Performance Tips

### Optimize Build

```bash
# Analyze bundle size
npm run build
# Check .next/analyze/

# Remove unused dependencies
npm prune
```

### Database Performance

```bash
# Check slow queries in Prisma Studio
# Add indexes as needed in schema.prisma
```

### Caching

```typescript
// Add cache headers to API routes
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60'
  }
})
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Start dev server
bun dev

# 2. Open in browser
open http://localhost:3000

# 3. Test user flows:
# - Login
# - View dashboard
# - Check charts load
# - Test responsive design
```

### API Testing

```bash
# Use Postman or Insomnia
# Import endpoints from docs/API.md
```

---

## 📱 Mobile Testing

```bash
# Get local IP
ifconfig | grep "inet "

# Start dev server
bun dev

# Access from mobile
# http://<your-ip>:3000
```

---

## 🔐 Security Quick Checks

```bash
# Check for exposed secrets
grep -r "password\|secret\|key" .env

# Ensure .env is in .gitignore
cat .gitignore | grep .env

# Verify bcrypt rounds (should be 10-12)
grep "bcrypt" src/lib/auth.ts
```

---

## 📞 Support Resources

### Documentation
- **Main README**: `/README.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **API Docs**: `/docs/API.md`
- **Setup Guide**: `/docs/SETUP.md`

### External Links
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Shopify API](https://shopify.dev/docs/api)
- [Vercel Docs](https://vercel.com/docs)

### Get Help
- **GitHub Issues**: Report bugs
- **Stack Overflow**: Tag `shopify-pro`
- **Discord**: Community support (coming soon)

---

## 💡 Pro Tips

1. **Use Prisma Studio** for quick database edits (safer than SQL)
2. **Enable Vercel Analytics** for free performance insights
3. **Use `--turbopack`** flag for faster dev server
4. **Commit `.env.example`** but never `.env`
5. **Test in production mode** before deploying: `bun run build && bun start`
6. **Use ngrok** for local webhook testing
7. **Keep dependencies updated** with `bun update`
8. **Monitor logs** in production: `vercel logs`

---

## 🎯 Quick Wins

### Performance
- ✅ Enable edge caching
- ✅ Optimize images (use Next.js Image)
- ✅ Lazy load components
- ✅ Add database indexes

### UX
- ✅ Add loading skeletons
- ✅ Show error messages
- ✅ Add tooltips
- ✅ Improve mobile layout

### Security
- ✅ Enable 2FA (future)
- ✅ Add rate limiting
- ✅ Validate all inputs
- ✅ Use HTTPS only

---

**Last Updated**: December 2024  
**Quick Reference Version**: 1.0.0  
**For detailed info, see full documentation**
