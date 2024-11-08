import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  Headphones,
  Shield,
  Menu
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const { user } = useUser()
  
  const isAdmin = user?.publicMetadata?.role === 'admin'

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
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 bottom-4 z-50 bg-primary p-3 rounded-full shadow-lg md:hidden hover:bg-primary/80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <div 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 bg-[#0f0035]/50 backdrop-blur-sm border-r border-white/10 transition-all duration-300 hidden md:block
          ${isExpanded ? 'w-52' : 'w-16'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="py-4 flex flex-col h-full">
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    title={item.label}
                  >
                    <item.icon className="w-6 h-6 min-w-[1.5rem]" />
                    {isExpanded && (
                      <span className="ml-4 whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-white/10 pt-4 space-y-2 mb-16">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 min-w-[1.5rem]" />
              ) : (
                <Moon className="w-6 h-6 min-w-[1.5rem]" />
              )}
              {isExpanded && (
                <span className="ml-4 whitespace-nowrap">Theme</span>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6 min-w-[1.5rem]" />
              {isExpanded && (
                <span className="ml-4 whitespace-nowrap">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 z-30 bg-[#0f0035]/50 backdrop-blur-sm border-r border-white/10 transition-all duration-300 md:hidden
          ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="py-4 flex flex-col h-full">
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center justify-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsExpanded(false)}
                    title={item.label}
                  >
                    <item.icon className="w-6 h-6" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-white/10 pt-4 space-y-2 mb-16">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}
