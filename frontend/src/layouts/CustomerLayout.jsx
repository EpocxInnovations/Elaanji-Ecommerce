import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AnnouncementBar } from '../components/AnnouncementBar'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CustomerSidebarProvider, CustomerSidebar } from '../components/CustomerSidebar'
import { ChatWidget } from '../components/ChatWidget'

export function CustomerLayout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <CustomerSidebarProvider>
      <div className="min-h-screen flex flex-col bg-paper overflow-x-hidden relative">
        {/* Luxury Brand Glow Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(125% 125% at 50% 10%, #FAF9F6 40%, #6E2430 100%)`,
            backgroundSize: "100% 100%",
            backgroundAttachment: "fixed" // keeps the glow stationary when scrolling
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col flex-1">
          <AnnouncementBar />
          <Navbar />
          <CustomerSidebar />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 transform-gpu"
          >
            <Outlet />
          </motion.main>
          <Footer />
          <ChatWidget />
        </div>
      </div>
    </CustomerSidebarProvider>
  )
}

