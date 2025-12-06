"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, TrendingUp, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardData {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  topCustomers: Array<{
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    totalSpent: number
    ordersCount: number
  }>
  recentOrders: Array<{
    id: number
    orderNumber: string
    totalPrice: number
    orderDate: string
    financialStatus: string
    customerEmail: string | null
  }>
}

interface ChartData {
  data: Array<{
    date: string
    orders: number
    revenue: number
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, chartRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/dashboard/orders-over-time?days=30')
      ])

      if (summaryRes.ok && chartRes.ok) {
        const summary = await summaryRes.json()
        const chart = await chartRes.json()
        setDashboardData(summary)
        setChartData(chart)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardNav />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  if (!session || !dashboardData) {
    return null
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${Number(dashboardData.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-5 h-5" />,
      change: '+12.5%',
      positive: true,
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      change: '+8.2%',
      positive: true,
    },
    {
      title: 'Total Customers',
      value: dashboardData.totalCustomers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      change: '+5.7%',
      positive: true,
    },
    {
      title: 'Avg. Order Value',
      value: dashboardData.totalOrders > 0 
        ? `$${(Number(dashboardData.totalRevenue) / dashboardData.totalOrders).toFixed(2)}`
        : '$0.00',
      icon: <TrendingUp className="w-5 h-5" />,
      change: '+3.1%',
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardNav />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session.user.firstName || session.user.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your store today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData && chartData.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#000000" 
                        strokeWidth={2}
                        dot={{ fill: '#000000', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No order data available
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>By total spent</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.topCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.topCustomers}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                      <XAxis 
                        dataKey="email" 
                        className="text-xs"
                        tickFormatter={(email) => email.split('@')[0].substring(0, 8)}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar 
                        dataKey="totalSpent" 
                        fill="#000000"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No customer data available
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your store</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Order</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {order.customerEmail || 'Guest'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.orderDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-right text-gray-900 dark:text-white">
                            ${Number(order.totalPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.financialStatus === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {order.financialStatus}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No recent orders
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, change, positive }: any) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <p className={`text-sm font-medium ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
