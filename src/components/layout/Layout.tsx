import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { useAuth } from '../../hooks/useAuth'

export function Layout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0035] to-[#40b4c7] dark:from-[#0f0035] dark:to-[#0e7584] text-white">
      <Navbar />
      {!!user && <Sidebar />}
      <main className={`flex-grow container mx-auto px-4 py-8 mt-16 transition-all duration-300`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
