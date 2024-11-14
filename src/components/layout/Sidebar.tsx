import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  ChevronLeft,
  Menu
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export function Sidebar({ isMobileMenuOpen, toggleMobileMenu }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      toggleMobileMenu()
    }
  }, [location, isMobile, toggleMobileMenu, isMobileMenuOpen])

  const handleSignOut = async () => {
    navigate('/')
  }

  const menuItems = [
    { icon: Wand2, label: 'Studio', path: '/studio' },
    { icon: FolderOpen, label: 'My Files', path: '/files' },
    { icon: Mic, label: 'My Voices', path: '/voice-cloning' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Support', path: '/help' },
    { icon: Bell, label: 'Updates', path: '/notifications' },
    { icon: Info, label: 'About Us', path: '/about' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 top-32"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 mt-4 top-12 h-[calc(100vh-4rem)] z-40 bg-[#0f0035]/90 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ${
          isMobileMenuOpen || (!isMobile && isExpanded) ? 'w-52' : isMobile ? 'w-0' : 'w-16'
        }`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {!isMobile && (
          <button
            className="absolute -right-3 top-6 bg-[#63248d] rounded-full p-1.5 text-white transition-all duration-300"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        )}

        <div className={`py-4 flex flex-col h-full ${!isMobileMenuOpen && isMobile ? 'hidden' : ''}`}>
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-[#9de9c7] hover:text-white hover:bg-white/10 transition-colors ${
                      location.pathname === item.path ? 'bg-white/10 text-white' : ''
                    }`}
                    onClick={() => isMobile && toggleMobileMenu()}
                  >
                    <item.icon className="w-6 h-6" />
                    {(isMobileMenuOpen || (!isMobile && isExpanded)) && (
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
              {(isMobileMenuOpen || (!isMobile && isExpanded)) && (
                <span className="ml-4">Theme</span>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-[#9de9c7] hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-6 h-6" />
              {(isMobileMenuOpen || (!isMobile && isExpanded)) && (
                <span className="ml-4">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
