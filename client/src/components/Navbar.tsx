import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { UserMenu } from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-150/80 dark:border-slate-800/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-5">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4.5 py-2 text-sm font-semibold text-slate-600 hover:text-cyan-500 
                             dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r 
                             from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 
                             rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all duration-250"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-150/80 dark:border-slate-800/40 shadow-lg px-4 py-4 space-y-4 animate-fadeIn">
          {isAuthenticated ? (
            <div className="flex justify-center">
              <UserMenu />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/signin"
                className="block text-center py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block text-white text-center py-2.5 rounded-xl bg-gradient-to-r 
                           from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold text-sm shadow-md transition"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
