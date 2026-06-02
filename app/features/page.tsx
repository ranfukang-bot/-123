import Navbar from '@/components/Landing/Navbar'
import Features from '@/components/Landing/Features'
import Footer from '@/components/Landing/Footer'

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080b12] pt-16">
        <Features />
      </main>
      <Footer />
    </>
  )
}
