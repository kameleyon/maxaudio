import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { NotificationBadge } from '../notifications/NotificationBadge';
import { Sidebar } from './Sidebar';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0035]/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Toggle mobile menu"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              <Link to="/" className="text-2xl md:text-3xl font-bold font-montserrat text-white ml-8 md:ml-0">
                AUDIOMAX
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition">
                    <span className="text-sm text-white">{user.username}</span>
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center p-2 rounded-full hover:bg-white/10 transition ">
                    <NotificationBadge className="w-5 h-5"/>
                  </div>
                </>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      
    </>
  );
}
