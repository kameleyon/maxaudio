import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  Wand2,
  FolderOpen,
  Mic,
  Settings,
  Sun,
  Moon,
  HelpCircle,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Shield
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const { user } = useUser()
  const location = useLocation()
  
  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false)
    }
  }, [location, isMobile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const menuItems = [
    { icon: Wand2, label: 'Studio', path: '/studio' },
    { icon: FolderOpen, label: 'My Files', path: '/files' },
    { icon: Mic, label: 'My Voices', path: '/voice-cloning' },
    { icon: Headphones, label: 'TTS Test', path: '/tts-test' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Support', path: '/help' },
    { icon: Bell, label: 'Updates', path: '/notifications' },
    { icon: Info, label: 'About Us', path: '/about' },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin', path: '/admin' }] : [])
  ]

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-20 bg-[#0f0035]/50 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ${
        isExpanded ? 'w-52' : 'w-0 md:w-16'
      }`}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      <button
        className={`absolute ${isMobile ? 'top-0 -right-10' : '-right-3 top-6'} bg-primary rounded-full p-1.5 text-white transition-all duration-300 ${
          isMobile && !isExpanded ? 'opacity-100' : isMobile ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      <div className={`py-4 flex flex-col h-full ${!isExpanded && isMobile ? 'hidden' : ''}`}>
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-[#9de9c7] hover:text-white hover:bg-white/10 transition-colors ${
                    location.pathname === item.path ? 'bg-white/10 text-white' : ''
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {isExpanded && (
                    <span className="ml-4">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-3 text-[#9de9c7] hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
            {isExpanded && (
              <span className="ml-4">Theme</span>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-[#9de9c7] hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            {isExpanded && (
              <span className="ml-4">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
