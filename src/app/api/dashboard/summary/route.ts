import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Get all analytics in parallel
    const [
      totalCustomers,
      totalOrders,
      totalRevenue,
      topCustomers,
      recentOrders
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: { tenantId }
      }),

      // Total orders
      prisma.order.count({
        where: { tenantId }
      }),

      // Total revenue
      prisma.order.aggregate({
        where: {
          tenantId,
          financialStatus: 'paid'
        },
        _sum: {
          totalPrice: true
        }
      }),

      // Top 5 customers by spend
      prisma.customer.findMany({
        where: { tenantId },
        orderBy: { totalSpent: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          totalSpent: true,
          ordersCount: true,
        }
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        where: { tenantId },
        orderBy: { orderDate: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          totalPrice: true,
          orderDate: true,
          financialStatus: true,
          customerEmail: true,
        }
      })
    ])

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      topCustomers,
      recentOrders,
    })

  } catch (error: any) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}