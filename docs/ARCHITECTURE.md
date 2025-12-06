# Architecture Documentation

## System Architecture Overview

ShopifyPro is a **multi-tenant SaaS platform** built on a modern, scalable architecture designed to handle multiple Shopify stores with complete data isolation and real-time synchronization.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Login     │  │   Dashboard  │      │
│  │     Page     │  │   /Signup    │  │     Page     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           React Components + Framer Motion                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 15 App Router                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │ │
│  │  │   API Routes │  │  Middleware  │  │  SSR Pages │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   AUTHENTICATION         │  │   SHOPIFY API            │
│   NextAuth v5            │  │   REST API v2024-01      │
│   - JWT Sessions         │  │   - Products             │
│   - Bcrypt Hashing       │  │   - Orders               │
│   - Protected Routes     │  │   - Customers            │
└──────────────────────────┘  │   - Webhooks             │
                              └──────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           PostgreSQL with Prisma ORM                   │ │
│  │                                                         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐  │ │
│  │  │ Tenant  │ │   User   │ │ Product │ │ Customer │  │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘  │ │
│  │       │           │            │           │          │ │
│  │       └───────────┴────────────┴───────────┘          │ │
│  │              Multi-tenant Isolation                    │ │
│  │         (tenant_id on every table)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Model

### Shared Database, Logical Isolation

We use a **shared schema** approach where:
- Single PostgreSQL database
- Every table has a `tenant_id` column
- All queries filtered by `tenant_id`
- Indexes on `(tenant_id, *)` for performance

**Benefits:**
- Cost-effective (single database)
- Easy to manage and backup
- Simple migrations
- Efficient resource usage

**Security:**
- Row-Level Security (RLS) policies
- Middleware enforces tenant filtering
- Session validates tenant access
- No cross-tenant data leakage

---

## Data Flow Diagram

### 1. User Authentication Flow

```
User → Login Page → NextAuth → Prisma → PostgreSQL
                       │
                       ├─ Verify Password (bcrypt)
                       ├─ Create JWT Session
                       └─ Store tenant_id in session
                       
Session → Middleware → Protect Routes → Dashboard
```

### 2. Dashboard Data Flow

```
Dashboard Component
    │
    ├─ useEffect() on mount
    │
    ├─ fetch('/api/dashboard/summary')
    │     │
    │     └─ Verify Session
    │     └─ Get tenant_id from session
    │     └─ Query Prisma (filtered by tenant_id)
    │     └─ Return aggregated data
    │
    ├─ fetch('/api/dashboard/orders-over-time')
    │     │
    │     └─ Same auth & filtering
    │     └─ Return chart data
    │
    └─ Render Charts (Recharts)
```

### 3. Shopify Webhook Flow

```
Shopify Store
    │
    ├─ Order Created
    │     │
    │     └─ POST /api/shopify/webhook/orders
    │           │
    │           ├─ Extract shop domain from headers
    │           ├─ Find tenant by shop domain
    │           ├─ Upsert order in database
    │           └─ Update customer stats
    │
    ├─ Product Updated
    │     │
    │     └─ POST /api/shopify/webhook/products
    │           └─ Upsert product
    │
    └─ Customer Created
          │
          └─ POST /api/shopify/webhook/customers
                └─ Upsert customer
```

### 4. Scheduled Sync Flow (Vercel Cron)

```
Vercel Cron (every 6 hours)
    │
    └─ GET /api/sync-shopify
          │
          ├─ Verify CRON_SECRET
          │
          ├─ Get all active tenants
          │
          └─ For each tenant:
                │
                ├─ Create ShopifyClient
                │
                ├─ Fetch products (last 30 days)
                │   └─ Upsert to database
                │
                ├─ Fetch customers
                │   └─ Upsert to database
                │
                └─ Fetch orders (last 30 days)
                    └─ Upsert to database
                    └─ Update customer stats
```

---

## Technology Stack Details

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/UI + Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Serverless Functions on Vercel)
- **API**: Next.js API Routes
- **Authentication**: NextAuth v5
- **Database ORM**: Prisma 7
- **Password Hashing**: bcrypt
- **Validation**: Zod

### Database
- **Primary**: PostgreSQL 14+
- **Adapter**: @prisma/adapter-pg (for serverless)
- **Connection Pool**: pg (PostgreSQL driver)
- **Migrations**: Prisma Migrate

### Infrastructure
- **Hosting**: Vercel
- **Database**: Vercel Postgres / Railway / Supabase
- **Cron Jobs**: Vercel Cron
- **Edge Functions**: Vercel Edge Runtime

---

## Database Schema Architecture

### Entity Relationship Diagram

```
┌──────────────┐
│    Tenant    │
│──────────────│
│ id (PK)      │
│ name         │
│ shopDomain   │
│ apiKey       │
│ accessToken  │
└──────┬───────┘
       │ 1
       │
       │ N
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
┌──────▼───────┐ ┌───▼────────┐ ┌──▼─────────┐ ┌──▼────────┐ ┌──▼──────────┐
│     User     │ │   Product  │ │  Customer  │ │   Order   │ │  CartEvent  │
│──────────────│ │────────────│ │────────────│ │───────────│ │─────────────│
│ id (PK)      │ │ id (PK)    │ │ id (PK)    │ │ id (PK)   │ │ id (PK)     │
│ email        │ │ shopifyId  │ │ shopifyId  │ │ shopifyId │ │ type        │
│ password     │ │ title      │ │ email      │ │ orderNum  │ │ cartValue   │
│ tenantId(FK) │ │ price      │ │ totalSpent │ │ totalPrice│ │ tenantId(FK)│
└──────────────┘ │ tenantId(FK│ │ tenantId(FK│ │ tenantId  │ └─────────────┘
                 └────────────┘ └─────┬──────┘ │ (FK)      │
                                      │         └───────────┘
                                      │              │
                                      └──────────────┘
                                         1:N Relationship
```

### Indexes Strategy

**Performance Optimization:**
- `(tenant_id)` on all tables
- `(tenant_id, id)` composite indexes
- `(tenant_id, shopifyId)` unique constraints
- `(tenant_id, email)` for user lookups
- `(tenant_id, orderDate)` for time-series queries

---

## Security Architecture

### Authentication & Authorization

1. **Password Security**
   - Bcrypt hashing (12 rounds)
   - Salted passwords
   - No plaintext storage

2. **Session Management**
   - JWT-based sessions
   - Signed tokens (JWT_SECRET)
   - httpOnly cookies (CSRF protection)
   - 30-day expiration

3. **API Protection**
   - Middleware on all protected routes
   - Session validation on every request
   - Tenant ID extraction from session
   - Automatic tenant filtering

4. **Multi-Tenant Isolation**
   - Every query includes `where: { tenantId }`
   - Middleware validates session tenant matches request
   - No direct tenant ID from client
   - Database-level constraints

### Data Security

- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Protection**: React auto-escaping
- **CSRF Protection**: SameSite cookies
- **HTTPS Only**: Enforced on Vercel
- **Environment Variables**: Secrets in .env
- **Rate Limiting**: Vercel Edge Config (optional)

---

## Scalability Considerations

### Horizontal Scaling
- Serverless functions (auto-scale)
- Database connection pooling
- CDN for static assets
- Edge caching for dashboard data

### Performance Optimizations
- Database indexes on hot queries
- Webhook idempotency (prevent duplicates)
- Batch processing in sync jobs
- Lazy loading components
- React Suspense boundaries

### Monitoring & Observability
- Vercel Analytics (built-in)
- Prisma Query Insights
- Error tracking (Sentry integration ready)
- Performance monitoring (Web Vitals)

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────┐
│              Vercel Edge Network                 │
│  ┌──────────────────────────────────────────┐   │
│  │   CDN (Static Assets + Images)           │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │   Edge Middleware (Route Protection)     │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │   Serverless Functions (API Routes)      │   │
│  │   - Auto-scaling                          │   │
│  │   - Regional distribution                 │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│           PostgreSQL Database                    │
│   - Connection pooling (pg)                      │
│   - Automated backups                            │
│   - Read replicas (optional)                     │
└─────────────────────────────────────────────────┘
```

---

## Future Architecture Enhancements

1. **Redis Caching Layer**
   - Cache hot dashboard data
   - Session storage
   - Rate limiting

2. **Message Queue**
   - RabbitMQ / Redis for webhook processing
   - Async background jobs
   - Retry logic

3. **Read Replicas**
   - Separate read/write databases
   - Analytics on replica
   - Reduce primary load

4. **GraphQL API**
   - Alternative to REST
   - Better client flexibility
   - Reduced over-fetching

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained by**: ShopifyPro Team
