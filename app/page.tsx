import Navbar from '@/components/Landing/Navbar'
import Hero from '@/components/Landing/Hero'
import Features from '@/components/Landing/Features'
import HowItWorks from '@/components/Landing/HowItWorks'
import Pricing from '@/components/Landing/Pricing'
import Footer from '@/components/Landing/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
