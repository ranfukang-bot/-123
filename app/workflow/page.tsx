import Navbar from '@/components/Landing/Navbar'
import HowItWorks from '@/components/Landing/HowItWorks'
import Footer from '@/components/Landing/Footer'

export default function WorkflowPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080b12] pt-16">
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
