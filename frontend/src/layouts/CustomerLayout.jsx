import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AnnouncementBar } from '../components/AnnouncementBar'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { PageTransition } from '../components/PageTransition'

export function CustomerLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
