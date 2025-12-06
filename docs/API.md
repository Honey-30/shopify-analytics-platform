# API Documentation

Complete API reference for all endpoints in the ShopifyPro platform.

---

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

---

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

### Headers

```
Cookie: next-auth.session-token=<token>
```

### Session Structure

```typescript
{
  user: {
    id: number
    email: string
    tenantId: number
    role: "admin" | "user"
    firstName: string | null
    lastName: string | null
    tenant: {
      id: number
      name: string
      shopDomain: string
    }
  }
}
```

---

## Endpoints

### Authentication

#### POST `/api/auth/signup`

Create a new tenant and admin user.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "storeName": "My Shopify Store",
  "shopDomain": "mystore.myshopify.com",
  "apiKey": "shpat_xxxxx",
  "accessToken": "shpat_xxxxx"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": 1,
  "tenantId": 1
}
```

**Errors:**
- `400`: Missing required fields
- `409`: Email or shop domain already exists
- `500`: Server error

---

#### POST `/api/auth/[...nextauth]`

NextAuth handlers for login, logout, session management.

**Login:**
```
POST /api/auth/callback/credentials

{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response:**
- Sets session cookie
- Returns user data

---

### Dashboard APIs

#### GET `/api/dashboard/summary`

Get dashboard overview statistics.

**Authentication**: Required

**Response (200):**
```json
{
  "totalCustomers": 152,
  "totalOrders": 487,
  "totalRevenue": "45678.90",
  "topCustomers": [
    {
      "id": 1,
      "email": "sarah.johnson@example.com",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "totalSpent": "3200.00",
      "ordersCount": 12
    }
  ],
  "recentOrders": [
    {
      "id": 1,
      "orderNumber": "1001",
      "totalPrice": "299.99",
      "orderDate": "2024-12-01T10:30:00Z",
      "financialStatus": "paid",
      "customerEmail": "customer@example.com"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized (no session)
- `500`: Server error

---

#### GET `/api/dashboard/orders-over-time`

Get orders count over time for chart visualization.

**Authentication**: Required

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Example:**
```
GET /api/dashboard/orders-over-time?days=30
```

**Response (200):**
```json
{
  "data": [
    {
      "date": "2024-11-01",
      "orders": 15,
      "revenue": "3450.75"
    },
    {
      "date": "2024-11-02",
      "orders": 18,
      "revenue": "4123.50"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized
- `500`: Server error

---

#### GET `/api/dashboard/advanced-analytics`

Get advanced analytics metrics.

**Authentication**: Required

**Response (200):**
```json
{
  "repeatCustomerRate": 34.56,
  "revenueGrowth": 12.5,
  "revenueByStatus": [
    {
      "status": "paid",
      "revenue": 45000.00,
      "orders": 450
    },
    {
      "status": "pending",
      "revenue": 2500.00,
      "orders": 25
    }
  ],
  "ordersByDayOfWeek": [
    { "day": "Monday", "orders": 45 },
    { "day": "Tuesday", "orders": 52 },
    { "day": "Wednesday", "orders": 48 }
  ],
  "customerGrowth": [
    { "month": "Jul 2024", "newCustomers": 15 },
    { "month": "Aug 2024", "newCustomers": 23 }
  ],
  "averageOrderValue": 93.84,
  "topProducts": [
    {
      "title": "Premium Wireless Headphones",
      "inventory": 45,
      "price": "299.99"
    }
  ]
}
```

**Metrics Explained:**
- `repeatCustomerRate`: % of customers with 2+ orders
- `revenueGrowth`: Month-over-month revenue growth %
- `revenueByStatus`: Revenue breakdown by financial status
- `ordersByDayOfWeek`: Order distribution across weekdays
- `customerGrowth`: New customers per month (last 6 months)
- `averageOrderValue`: Average revenue per order
- `topProducts`: Top 5 products by lowest inventory (best sellers)

---

### Shopify Integration

#### POST `/api/shopify/webhook/orders`

Handle Shopify order webhooks (create/update).

**Authentication**: Shopify HMAC signature (production)

**Headers:**
```
X-Shopify-Shop-Domain: mystore.myshopify.com
X-Shopify-Hmac-SHA256: <signature>
```

**Request Body:** [Shopify Order Object](https://shopify.dev/docs/api/admin-rest/2024-01/resources/order)

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400`: Missing shop domain
- `404`: Tenant not found
- `500`: Processing error

---

#### POST `/api/shopify/webhook/products`

Handle Shopify product webhooks (create/update).

**Authentication**: Shopify HMAC signature

**Headers:**
```
X-Shopify-Shop-Domain: mystore.myshopify.com
```

**Request Body:** [Shopify Product Object](https://shopify.dev/docs/api/admin-rest/2024-01/resources/product)

**Response (200):**
```json
{
  "success": true
}
```

---

#### POST `/api/shopify/webhook/customers`

Handle Shopify customer webhooks (create/update).

**Authentication**: Shopify HMAC signature

**Request Body:** [Shopify Customer Object](https://shopify.dev/docs/api/admin-rest/2024-01/resources/customer)

**Response (200):**
```json
{
  "success": true
}
```

---

#### POST `/api/shopify/setup-webhooks`

Setup all required webhooks for the authenticated tenant's store.

**Authentication**: Required (session)

**Response (200):**
```json
{
  "success": true,
  "message": "Webhooks configured successfully",
  "webhooks": [
    {
      "topic": "orders/create",
      "status": "created",
      "id": "12345"
    },
    {
      "topic": "products/update",
      "status": "exists",
      "id": "67890"
    }
  ],
  "callbackUrl": "https://your-domain.vercel.app/api/shopify/webhook"
}
```

**Webhook Topics Configured:**
- `orders/create`
- `orders/updated`
- `products/create`
- `products/update`
- `customers/create`
- `customers/update`

---

#### GET `/api/shopify/setup-webhooks`

Get existing webhooks for the authenticated tenant's store.

**Authentication**: Required

**Response (200):**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": "12345",
      "topic": "orders/create",
      "address": "https://your-domain.vercel.app/api/shopify/webhook/orders",
      "format": "json"
    }
  ]
}
```

---

### Scheduled Sync

#### GET `/api/sync-shopify`

Manually trigger or scheduled sync for all tenants.

**Authentication**: CRON_SECRET bearer token (production)

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response (200):**
```json
{
  "success": true,
  "timestamp": "2024-12-06T10:00:00Z",
  "results": [
    {
      "tenantId": 1,
      "tenantName": "Demo Store",
      "success": true,
      "message": "Sync completed successfully",
      "stats": {
        "products": 25,
        "customers": 50,
        "orders": 120
      }
    }
  ]
}
```

**What It Syncs:**
- Products (last 250, active status)
- Customers (last 250)
- Orders (last 30 days)
- Customer stats (totalSpent, ordersCount)

**Errors:**
- `401`: Unauthorized (invalid CRON_SECRET)
- `500`: Sync failed

---

## Error Response Format

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": "Optional stack trace (development only)"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid auth)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

---

## Rate Limiting

**Vercel Pro Plan:**
- 100 requests/10 seconds per IP
- Unlimited bandwidth
- No rate limiting on webhooks

**Shopify API Limits:**
- REST API: 2 requests/second
- GraphQL API: 50 points/second
- Webhook retries: 48 hours

---

## Data Types

### Tenant
```typescript
{
  id: number
  name: string
  shopDomain: string  // e.g., "mystore.myshopify.com"
  apiKey: string | null
  apiSecret: string | null
  accessToken: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### User
```typescript
{
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  password: string  // bcrypt hashed
  role: "admin" | "user"
  tenantId: number
  createdAt: Date
  updatedAt: Date
}
```

### Product
```typescript
{
  id: number
  shopifyProductId: string
  title: string
  description: string | null
  vendor: string | null
  productType: string | null
  price: Decimal
  compareAtPrice: Decimal | null
  inventory: number
  sku: string | null
  imageUrl: string | null
  status: "active" | "draft" | "archived"
  tenantId: number
  createdAt: Date
  updatedAt: Date
}
```

### Customer
```typescript
{
  id: number
  shopifyCustomerId: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  totalSpent: Decimal
  ordersCount: number
  city: string | null
  country: string | null
  tenantId: number
  createdAt: Date
  updatedAt: Date
}
```

### Order
```typescript
{
  id: number
  shopifyOrderId: string
  orderNumber: string
  customerId: number | null
  customerEmail: string | null
  totalPrice: Decimal
  subtotalPrice: Decimal
  totalTax: Decimal
  currency: string
  financialStatus: "pending" | "paid" | "refunded" | "voided"
  fulfillmentStatus: "fulfilled" | "partial" | "unfulfilled" | null
  lineItemsCount: number
  tenantId: number
  orderDate: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }' \
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

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Changelog**: See GitHub releases
