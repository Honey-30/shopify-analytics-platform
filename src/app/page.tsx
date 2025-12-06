import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}