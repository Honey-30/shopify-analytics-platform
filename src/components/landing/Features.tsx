"use client"

import { motion } from 'framer-motion'
import { BarChart3, Shield, Zap, TrendingUp, Users, Database } from 'lucide-react'

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time Analytics",
    description: "Monitor your store's performance with live data updates and instant insights into sales, orders, and customer behavior."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Multi-tenancy",
    description: "Enterprise-grade security with complete data isolation. Each store's data is protected with row-level security."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast",
    description: "Optimized queries and smart caching deliver insights in milliseconds, not seconds. Built for performance at scale."
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Predictive Insights",
    description: "AI-powered forecasting helps you anticipate trends and make data-driven decisions before your competitors."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Customer Intelligence",
    description: "Deep customer analytics reveal purchasing patterns, lifetime value, and opportunities for personalization."
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Automated Sync",
    description: "Webhooks and scheduled syncs keep your data fresh. Never miss a sale or customer interaction."
  }
]

export function Features() {
  return (
    <section className="relative py-32 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for modern e-commerce teams who demand excellence.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group p-8 rounded-3xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:border-gray-300 dark:hover:border-gray-700"
    >
      <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-6 text-white dark:text-black group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
