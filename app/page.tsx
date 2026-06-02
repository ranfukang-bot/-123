import Navbar from '@/components/Landing/Navbar'
import Hero from '@/components/Landing/Hero'
import Showcase from '@/components/Landing/Showcase'
import Footer from '@/components/Landing/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#080b12]">
        <Hero />
        <Showcase />
      </main>
      <Footer />
    </>
  )
}
