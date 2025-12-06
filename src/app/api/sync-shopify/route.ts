import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createShopifyClient } from '@/lib/shopify'

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

        console.log(`Syncing data for tenant: ${tenant.name}`)

        // Create Shopify client
        const shopifyClient = createShopifyClient(tenant)
        
        if (!shopifyClient) {
          results.push({
            tenantId: tenant.id,
            success: false,
            message: 'Failed to create Shopify client'
          })
          continue
        }

        let syncedProducts = 0
        let syncedCustomers = 0
        let syncedOrders = 0

        // ==================== SYNC PRODUCTS ====================
        try {
          const products = await shopifyClient.getProducts({ limit: 250, status: 'active' })
          
          for (const product of products) {
            await prisma.product.upsert({
              where: {
                tenantId_shopifyProductId: {
                  tenantId: tenant.id,
                  shopifyProductId: product.id.toString()
                }
              },
              update: {
                title: product.title,
                description: product.body_html,
                vendor: product.vendor,
                productType: product.product_type,
                price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
                compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
                inventory: product.variants?.[0]?.inventory_quantity || 0,
                sku: product.variants?.[0]?.sku,
                imageUrl: product.image?.src,
                status: product.status,
              },
              create: {
                tenantId: tenant.id,
                shopifyProductId: product.id.toString(),
                title: product.title,
                description: product.body_html,
                vendor: product.vendor,
                productType: product.product_type,
                price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
                compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
                inventory: product.variants?.[0]?.inventory_quantity || 0,
                sku: product.variants?.[0]?.sku,
                imageUrl: product.image?.src,
                status: product.status,
              }
            })
            syncedProducts++
          }
        } catch (error: any) {
          console.error(`Product sync error for tenant ${tenant.id}:`, error.message)
        }

        // ==================== SYNC CUSTOMERS ====================
        try {
          const customers = await shopifyClient.getCustomers({ limit: 250 })
          
          for (const customer of customers) {
            await prisma.customer.upsert({
              where: {
                tenantId_shopifyCustomerId: {
                  tenantId: tenant.id,
                  shopifyCustomerId: customer.id.toString()
                }
              },
              update: {
                email: customer.email,
                firstName: customer.first_name,
                lastName: customer.last_name,
                phone: customer.phone,
                city: customer.default_address?.city,
                country: customer.default_address?.country,
              },
              create: {
                tenantId: tenant.id,
                shopifyCustomerId: customer.id.toString(),
                email: customer.email,
                firstName: customer.first_name,
                lastName: customer.last_name,
                phone: customer.phone,
                city: customer.default_address?.city,
                country: customer.default_address?.country,
              }
            })
            syncedCustomers++
          }
        } catch (error: any) {
          console.error(`Customer sync error for tenant ${tenant.id}:`, error.message)
        }

        // ==================== SYNC ORDERS (Last 30 days) ====================
        try {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const orders = await shopifyClient.getOrders({ 
            limit: 250,
            status: 'any',
            created_at_min: thirtyDaysAgo.toISOString()
          })
          
          for (const order of orders) {
            // Find or create customer
            let customer = null
            if (order.customer) {
              customer = await prisma.customer.upsert({
                where: {
                  tenantId_shopifyCustomerId: {
                    tenantId: tenant.id,
                    shopifyCustomerId: order.customer.id.toString()
                  }
                },
                update: {
                  email: order.customer.email,
                  firstName: order.customer.first_name,
                  lastName: order.customer.last_name,
                  phone: order.customer.phone,
                },
                create: {
                  tenantId: tenant.id,
                  shopifyCustomerId: order.customer.id.toString(),
                  email: order.customer.email,
                  firstName: order.customer.first_name,
                  lastName: order.customer.last_name,
                  phone: order.customer.phone,
                }
              })
            }

            // Upsert order
            await prisma.order.upsert({
              where: {
                tenantId_shopifyOrderId: {
                  tenantId: tenant.id,
                  shopifyOrderId: order.id.toString()
                }
              },
              update: {
                orderNumber: order.order_number?.toString() || order.name,
                customerId: customer?.id,
                customerEmail: order.email,
                totalPrice: parseFloat(order.total_price),
                subtotalPrice: parseFloat(order.subtotal_price),
                totalTax: parseFloat(order.total_tax || 0),
                currency: order.currency,
                financialStatus: order.financial_status,
                fulfillmentStatus: order.fulfillment_status,
                lineItemsCount: order.line_items?.length || 0,
                orderDate: new Date(order.created_at),
              },
              create: {
                tenantId: tenant.id,
                shopifyOrderId: order.id.toString(),
                orderNumber: order.order_number?.toString() || order.name,
                customerId: customer?.id,
                customerEmail: order.email,
                totalPrice: parseFloat(order.total_price),
                subtotalPrice: parseFloat(order.subtotal_price),
                totalTax: parseFloat(order.total_tax || 0),
                currency: order.currency,
                financialStatus: order.financial_status,
                fulfillmentStatus: order.fulfillment_status,
                lineItemsCount: order.line_items?.length || 0,
                orderDate: new Date(order.created_at),
              }
            })
            syncedOrders++

            // Update customer stats
            if (customer) {
              const stats = await prisma.order.aggregate({
                where: {
                  tenantId: tenant.id,
                  customerId: customer.id,
                  financialStatus: 'paid'
                },
                _sum: { totalPrice: true },
                _count: true
              })

              await prisma.customer.update({
                where: { id: customer.id },
                data: {
                  totalSpent: stats._sum.totalPrice || 0,
                  ordersCount: stats._count
                }
              })
            }
          }
        } catch (error: any) {
          console.error(`Order sync error for tenant ${tenant.id}:`, error.message)
        }

        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          success: true,
          message: 'Sync completed successfully',
          stats: {
            products: syncedProducts,
            customers: syncedCustomers,
            orders: syncedOrders
          }
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