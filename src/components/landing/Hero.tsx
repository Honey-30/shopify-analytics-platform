"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm"
          >
            <span className="text-xs font-medium tracking-wide text-gray-700 dark:text-gray-300">
              Multi-tenant analytics platform
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Analytics for your
            <br />
            <span className="relative">
              Shopify store
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-3 bg-black/5 dark:bg-white/10 -z-10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
            Real-time insights, powerful visualizations, and data-driven decisions. 
            Built for modern e-commerce teams.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="group h-14 px-8 text-base font-medium rounded-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get started free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-medium rounded-full border-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                Sign in
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              value="2.5x"
              label="Revenue growth"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              value="10k+"
              label="Active stores"
            />
            <StatCard
              icon={<BarChart3 className="w-6 h-6" />}
              value="99.9%"
              label="Uptime"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 transition-all duration-300"
    >
      <div className="flex items-center justify-center mb-3 text-gray-700 dark:text-gray-300">
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </div>
    </motion.div>
  )
}
