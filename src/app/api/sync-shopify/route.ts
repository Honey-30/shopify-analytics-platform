import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel Cron request (in production)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active tenants
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true }
    })

    const results = []

    for (const tenant of tenants) {
      try {
        // Only sync if tenant has API credentials
        if (!tenant.apiKey || !tenant.accessToken) {
          results.push({
            tenantId: tenant.id,
            success: false,
            message: 'Missing API credentials'
          })
          continue
        }

        // Here you would implement actual Shopify API calls
        // For now, we'll just log the sync attempt
        console.log(`Syncing data for tenant: ${tenant.name}`)

        // Example: Fetch recent orders from Shopify API
        // const shopifyOrders = await fetchShopifyOrders(tenant)
        // const shopifyProducts = await fetchShopifyProducts(tenant)
        // const shopifyCustomers = await fetchShopifyCustomers(tenant)

        // Process and upsert data...

        results.push({
          tenantId: tenant.id,
          success: true,
          message: 'Sync completed successfully'
        })

      } catch (error: any) {
        console.error(`Sync failed for tenant ${tenant.id}:`, error)
        results.push({
          tenantId: tenant.id,
          success: false,
          message: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('Sync cron error:', error)
    return NextResponse.json(
      { error: 'Sync failed', message: error.message },
      { status: 500 }
    )
  }
}

// Helper function to fetch orders from Shopify (example)
async function fetchShopifyOrders(tenant: any) {
  const url = `https://${tenant.shopDomain}/admin/api/2024-01/orders.json?status=any&limit=250`
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': tenant.accessToken,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.orders
}
