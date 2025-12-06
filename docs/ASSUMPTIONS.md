# Assumptions & Design Decisions

This document outlines key assumptions, design decisions, and trade-offs made during the development of ShopifyPro.

---

## Business Assumptions

### 1. Multi-Tenant Model

**Assumption**: Each Shopify store operates as an independent tenant with complete data isolation.

**Rationale**:
- Allows multiple stores to use the platform
- Simplifies billing and management
- Reduces infrastructure costs vs. dedicated databases

**Implications**:
- All queries must filter by `tenant_id`
- Session management must enforce tenant boundaries
- Webhooks identify tenants via shop domain

### 2. Pricing Model (Future)

**Assumption**: SaaS subscription model with tiers based on:
- Number of orders processed
- Data retention period
- Advanced analytics features
- API rate limits

**Current State**: Free/MVP - no billing implemented

**Future Enhancement**:
- Stripe integration
- Usage-based metering
- Plan management dashboard

### 3. Target Users

**Assumption**: Primary users are:
- Shopify store owners (SMB to mid-market)
- E-commerce managers
- Marketing teams needing analytics

**User Personas**:
- **Store Owner**: Needs revenue insights, top customers
- **Marketing Manager**: Wants campaign performance, customer behavior
- **Operations**: Focuses on order fulfillment, inventory

---

## Technical Assumptions

### 1. Shopify API Version

**Assumption**: Using Shopify REST API v2024-01 (current stable version)

**Why REST over GraphQL**:
- Simpler for MVP
- Better webhook support
- Easier rate limit management
- More straightforward error handling

**Trade-offs**:
- GraphQL would be more efficient for complex queries
- REST requires multiple requests for related data
- Migration to GraphQL possible in future

### 2. Database: Shared Schema Multi-Tenancy

**Assumption**: Single PostgreSQL database with `tenant_id` on every table

**Alternatives Considered**:

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Shared Schema** ✅ | Cost-effective, simple migrations, easy backups | Requires strict query filtering, potential noisy neighbor | **Selected** - Best for MVP |
| Schema-per-tenant | Better isolation, easier tenant deletion | Complex migrations, more DB connections | Overkill for current scale |
| Database-per-tenant | Complete isolation, can scale to enterprise | Expensive, management overhead | Future enterprise tier |

**Security Measures**:
- Row-Level Security (RLS) policies
- Middleware enforces tenant filtering
- No client-side tenant ID (always from session)
- Composite indexes for performance

### 3. Authentication Strategy

**Assumption**: Session-based auth with NextAuth v5 is sufficient

**Why NextAuth over alternatives**:
- Built for Next.js (first-class support)
- JWT sessions (no database session storage needed)
- Extensible for OAuth (Google, GitHub, etc.)
- Active maintenance and community

**Trade-offs**:
- Not as full-featured as Auth0/Clerk
- Manual role management implementation
- No built-in 2FA (would need custom implementation)

### 4. Real-Time Data Sync Strategy

**Assumption**: Webhooks + scheduled sync provides acceptable freshness

**Architecture**:
```
Webhooks (real-time) + Cron Job (every 6 hours) = 99.9% data accuracy
```

**Why this approach**:
- Webhooks handle 95% of updates immediately
- Cron catches missed webhooks (network failures, etc.)
- Reduces API rate limit pressure
- Acceptable latency for analytics use case

**Alternatives Considered**:
- **Polling only**: Would hit API rate limits, expensive
- **Webhooks only**: Risk of missing events (network failures)
- **Event-driven queue**: Over-engineered for MVP

### 5. Hosting Platform

**Assumption**: Vercel is the optimal deployment target

**Why Vercel**:
- ✅ Built for Next.js (zero-config deployment)
- ✅ Edge network (fast globally)
- ✅ Automatic SSL, CDN, scaling
- ✅ Integrated Postgres and cron jobs
- ✅ Generous free tier

**Trade-offs**:
- Vendor lock-in (mitigation: Docker support for portability)
- Function execution limits (15s on free tier, 60s Pro)
- Cold start latency (acceptable for this use case)

---

## Data Model Assumptions

### 1. Customer Stats (totalSpent, ordersCount)

**Assumption**: Denormalized customer stats are acceptable vs. calculating on-the-fly

**Rationale**:
- Dashboard queries would be slow without this
- Updates happen rarely (only on order changes)
- Worth the storage cost for query speed

**Update Strategy**:
- Recalculated whenever order changes (webhook, sync)
- Aggregate query: `SUM(totalPrice) WHERE financialStatus = 'paid'`

### 2. Order Date vs. Created Date

**Assumption**: Using Shopify's `created_at` as `orderDate` for analytics

**Why**:
- Matches Shopify's order timeline
- Consistent with merchant expectations
- Handles backdated orders correctly

**Alternative**: Could use `processed_at` (payment date) but less intuitive

### 3. Currency Handling

**Assumption**: All amounts stored in store's base currency (from Shopify)

**Current Limitation**: No multi-currency conversion in analytics

**Future Enhancement**: 
- Store base currency in Tenant model
- Add currency conversion API
- Display amounts in USD or merchant's choice

### 4. Cart Events (Optional)

**Assumption**: Cart abandonment tracking is optional for MVP

**Current State**: Schema exists but not actively populated

**Rationale**:
- Requires additional Shopify webhooks
- Complex to track properly (guest checkouts, etc.)
- Can be added later without schema changes

---

## UI/UX Assumptions

### 1. Dashboard-First Design

**Assumption**: Dashboard is the primary interface (not detailed reports)

**Rationale**:
- 80% of users want quick insights
- Detailed reports can be added incrementally
- Mobile-responsive cards work for quick checks

**Future**: Add dedicated pages for:
- Customer profiles
- Product performance
- Order details
- Custom report builder

### 2. Dark Mode Support

**Assumption**: Users expect dark mode in modern apps

**Implementation**: Tailwind CSS with `.dark` class

**Default**: System preference (no toggle implemented yet)

### 3. Chart Library Choice (Recharts)

**Assumption**: Recharts is sufficient for MVP analytics

**Why Recharts**:
- React-native (no D3 wrestling)
- Responsive out-of-box
- Good documentation
- Smaller bundle than Chart.js + react-chartjs-2

**Limitations**:
- Not as feature-rich as D3 for complex visualizations
- Migration to D3 possible if needed

---

## Security Assumptions

### 1. Password Security

**Assumption**: Bcrypt with 12 rounds is sufficient

**Current Standard**: 10-12 rounds recommended (OWASP)

**Trade-off**: Higher rounds = slower login, but more secure

### 2. Session Duration

**Assumption**: 30-day session expiration is acceptable

**Rationale**:
- Balances security with UX (not too frequent re-login)
- Can be adjusted per security requirements
- Refresh token could be added for longer sessions

### 3. Webhook Authentication

**Assumption**: Verifying Shopify HMAC signature is sufficient

**Current State**: HMAC verification implemented in webhooks

**Additional Security** (future):
- IP whitelisting (Shopify IP ranges)
- Rate limiting on webhook endpoints
- Replay attack prevention (timestamp checks)

### 4. SQL Injection

**Assumption**: Prisma ORM prevents SQL injection

**Rationale**: Prisma uses parameterized queries, no raw SQL

**Exception**: Raw queries (if ever added) must use `Prisma.$queryRaw` with parameters

---

## Performance Assumptions

### 1. Database Connection Pooling

**Assumption**: Vercel's serverless functions require connection pooling

**Implementation**: Using `@prisma/adapter-pg` with `pg` pool

**Configuration**:
```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**Why**: Prevents connection exhaustion in serverless environment

### 2. Query Optimization

**Assumption**: Indexes on `(tenant_id, *)` provide sufficient performance

**Current Indexes**:
- `(tenant_id)` on all tables
- `(tenant_id, shopifyProductId)` unique constraints
- `(tenant_id, orderDate)` for time-series queries
- `(tenant_id, email)` for user lookups

**Monitoring**: Should add query performance tracking in production

### 3. Caching Strategy

**Assumption**: No caching layer needed for MVP

**Current State**: Database queries on every request

**Future Enhancement**:
- Redis for dashboard data (5-minute TTL)
- Edge caching for static content
- CDN for images

**Acceptable Because**: Low traffic in MVP, Postgres is fast enough

---

## Scalability Assumptions

### 1. Expected Load (MVP)

**Assumption**: 
- < 100 tenants
- < 10,000 orders/day total
- < 1,000 API requests/minute

**Why This Matters**: Architecture decisions optimized for this scale

**When to Re-architect**:
- > 1,000 tenants: Consider database sharding
- > 100K orders/day: Add message queue for webhooks
- > 10K requests/min: Add Redis caching layer

### 2. Data Retention

**Assumption**: Store all historical data indefinitely

**Current State**: No data pruning/archival

**Future Consideration**:
- Archive orders > 2 years old
- Compress old analytics data
- Add data export feature

### 3. Geographic Distribution

**Assumption**: Single-region deployment acceptable for now

**Current**: Vercel auto-deploys to all edge locations

**Future**: 
- Multi-region database replicas
- Read replicas for analytics queries
- CDN for static assets (already via Vercel)

---

## Integration Assumptions

### 1. Shopify API Stability

**Assumption**: Shopify API v2024-01 will be supported for 12+ months

**Shopify's Policy**: Each API version supported for minimum 12 months

**Migration Plan**: Update `SHOPIFY_API_VERSION` env var when new version releases

### 2. Webhook Reliability

**Assumption**: Shopify webhooks may fail/retry

**Handling**:
- Idempotency: Use `upsert` operations (not `create`)
- Retry logic: Shopify retries failed webhooks for 48 hours
- Scheduled sync: Catches missed webhooks every 6 hours

### 3. Rate Limits

**Assumption**: Shopify REST API rate limit (2 req/sec) is manageable

**Current Approach**: Batch operations in scheduled sync

**Future**: Implement exponential backoff and request queuing

---

## Deployment Assumptions

### 1. Vercel Cron Jobs

**Assumption**: Vercel Cron (40 jobs limit on free tier) is acceptable

**Current State**: 1 cron job configured (sync-shopify)

**If Limit Exceeded**: 
- Use external cron service (cron-job.org)
- Upgrade to Vercel Pro (100 cron jobs)

### 2. Database Backups

**Assumption**: Database provider handles backups

**Vercel Postgres**: 7-day retention, daily backups

**Production Recommendation**: 
- Enable point-in-time recovery
- Test restore procedures
- Export critical data regularly

### 3. Zero-Downtime Deployments

**Assumption**: Vercel's atomic deployments prevent downtime

**How It Works**: 
- New version deployed to temporary URL
- Health check passes
- Traffic switched atomically
- Old version kept for rollback

---

## Limitations & Known Issues

### 1. No Multi-Currency Support

**Current**: All amounts in store's base currency

**Workaround**: Merchants with multi-currency must analyze in base currency

**Future**: Add currency conversion API integration

### 2. Limited Historical Data

**Current**: Scheduled sync only fetches last 30 days

**Rationale**: API rate limits, initial sync performance

**Workaround**: Run manual sync for older data if needed

### 3. No Real-Time Analytics

**Current**: Dashboard data may be up to 6 hours stale (between syncs)

**Acceptable For**: Strategic analytics (not operational dashboards)

**Future**: Add Redis caching with webhook invalidation

### 4. Single User per Tenant

**Current**: MVP assumes one admin user per store

**Future**: Add team management with roles/permissions

---

## Future Enhancements (Out of Scope for MVP)

1. **Advanced Analytics**
   - Cohort analysis
   - Customer lifetime value (LTV)
   - Churn prediction
   - A/B test tracking

2. **Integrations**
   - Google Analytics
   - Facebook Ads
   - Email marketing platforms
   - Accounting software (QuickBooks, Xero)

3. **Alerting & Notifications**
   - Email alerts for low inventory
   - Slack notifications for large orders
   - Custom threshold alerts

4. **Custom Reports**
   - Report builder UI
   - Scheduled email reports
   - PDF export

5. **Mobile App**
   - React Native app
   - Push notifications
   - Offline mode

---

## Validation of Assumptions

### How to Validate

1. **Performance Testing**: Load test with 100 concurrent users
2. **User Interviews**: Validate dashboard metrics with real merchants
3. **Security Audit**: Third-party penetration testing
4. **Scalability Testing**: Simulate 1,000 tenants with realistic data

### Success Metrics

- Dashboard loads in < 2 seconds
- 99.9% uptime
- Zero data breaches
- Webhook processing < 500ms
- User satisfaction > 4.5/5

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Review Cycle**: Quarterly
