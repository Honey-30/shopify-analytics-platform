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
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get orders grouped by date
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        orderDate: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        orderDate: true,
        totalPrice: true,
      },
      orderBy: {
        orderDate: 'asc'
      }
    })

    // Group by date
    const groupedData = orders.reduce((acc: any, order) => {
      const date = order.orderDate.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          orders: 0,
          revenue: 0,
        }
      }
      acc[date].orders += 1
      acc[date].revenue += Number(order.totalPrice)
      return acc
    }, {})

    const chartData = Object.values(groupedData)

    return NextResponse.json({ data: chartData })

  } catch (error: any) {
    console.error('Orders over time error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}