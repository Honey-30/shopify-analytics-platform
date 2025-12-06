import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // ==================== REPEAT CUSTOMER RATE ====================
    const totalCustomers = await prisma.customer.count({
      where: { tenantId }
    })

    const repeatCustomers = await prisma.customer.count({
      where: {
        tenantId,
        ordersCount: { gte: 2 }
      }
    })

    const repeatCustomerRate = totalCustomers > 0 
      ? (repeatCustomers / totalCustomers) * 100 
      : 0

    // ==================== REVENUE GROWTH (MoM) ====================
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const currentMonthRevenue = await prisma.order.aggregate({
      where: {
        tenantId,
        financialStatus: 'paid',
        orderDate: { gte: currentMonthStart }
      },
      _sum: { totalPrice: true }
    })

    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        tenantId,
        financialStatus: 'paid',
        orderDate: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      _sum: { totalPrice: true }
    })

    const currentRev = Number(currentMonthRevenue._sum.totalPrice || 0)
    const lastRev = Number(lastMonthRevenue._sum.totalPrice || 0)
    
    const revenueGrowth = lastRev > 0 
      ? ((currentRev - lastRev) / lastRev) * 100 
      : 0

    // ==================== REVENUE BY FINANCIAL STATUS ====================
    const revenueByStatus = await prisma.order.groupBy({
      by: ['financialStatus'],
      where: { tenantId },
      _sum: { totalPrice: true },
      _count: true
    })

    const statusBreakdown = revenueByStatus.map(item => ({
      status: item.financialStatus,
      revenue: Number(item._sum.totalPrice || 0),
      orders: item._count
    }))

    // ==================== ORDERS BY DAY OF WEEK ====================
    const orders = await prisma.order.findMany({
      where: { tenantId },
      select: { orderDate: true }
    })

    const dayOfWeekMap: Record<string, number> = {
      'Sunday': 0,
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    orders.forEach(order => {
      const dayIndex = new Date(order.orderDate).getDay()
      const dayName = dayNames[dayIndex]
      dayOfWeekMap[dayName]++
    })

    const ordersByDayOfWeek = Object.entries(dayOfWeekMap).map(([day, count]) => ({
      day,
      orders: count
    }))

    // ==================== CUSTOMER GROWTH TRENDS (Last 6 Months) ====================
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const customerGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

      const newCustomers = await prisma.customer.count({
        where: {
          tenantId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      customerGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newCustomers
      })
    }

    // ==================== AVERAGE ORDER VALUE ====================
    const avgOrderValue = await prisma.order.aggregate({
      where: { tenantId },
      _avg: { totalPrice: true }
    })

    // ==================== TOP SELLING PRODUCTS (if available) ====================
    const topProducts = await prisma.product.findMany({
      where: { 
        tenantId,
        status: 'active'
      },
      orderBy: { inventory: 'asc' },
      take: 5,
      select: {
        title: true,
        inventory: true,
        price: true
      }
    })

    return NextResponse.json({
      repeatCustomerRate: Number(repeatCustomerRate.toFixed(2)),
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      revenueByStatus: statusBreakdown,
      ordersByDayOfWeek,
      customerGrowth,
      averageOrderValue: Number(avgOrderValue._avg.totalPrice || 0),
      topProducts
    })

  } catch (error: any) {
    console.error('Advanced analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    )
  }
}
