"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white dark:text-black" />
          </div>
          <span className="text-gray-900 dark:text-white">ShopifyPro</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
