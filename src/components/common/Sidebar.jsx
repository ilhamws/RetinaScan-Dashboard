import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { safeLogout, handleLogoutEvent } from '../../utils/logoutHelper';
import {
  HomeIcon,
  UserIcon,
  EyeIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftCircleIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

// Environment variables
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Data Pasien', path: '/patient-data', icon: UserIcon },
  { name: 'Scan Retina', path: '/scan-retina', icon: EyeIcon },
  { name: 'History', path: '/history', icon: ClockIcon },
  { 
    name: 'Kembali ke Beranda', 
    path: FRONTEND_URL,
    icon: ArrowLeftCircleIcon,
    external: true
  },
];

function Sidebar({ toggleMobileMenu, isMobileMenuOpen }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  
  // Set active index based on current location
  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index >= 0 ? index : null);
  }, [location.pathname]);

  const handleLogout = async () => {
    console.log('Logging out from dashboard');
    
    try {
      // Gunakan helper function untuk logout yang lebih aman
      await safeLogout(FRONTEND_URL);
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback jika terjadi error
      alert('Terjadi kesalahan saat logout. Mencoba metode alternatif...');
      window.location.href = `${FRONTEND_URL}/#/?logout=true&from=dashboard&error=true`;
    }
  };

  // Enhanced animation variants
  const sidebarVariants = {
    open: { 
      width: '280px', 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    closed: { 
      width: '80px', 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    mobileOpen: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
    mobileClosed: { 
      x: '-100%', 
      opacity: 0, 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3
      } 
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: i * 0.05, 
        duration: 0.2
      },
    }),
  };

  // Modern background with subtle glassmorphism effect
  const activeItemBg = `${theme.primary}20`;
  const hoverItemBg = `${theme.primary}10`;
  
  // Glassmorphism style based on theme
  const glassEffect = {
    background: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: isDarkMode 
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    borderRight: isDarkMode 
      ? '1px solid rgba(255, 255, 255, 0.05)'
      : '1px solid rgba(0, 0, 0, 0.05)',
  };

  // Text color based on theme
  const textColor = {
    primary: theme.primary,
    secondary: isDarkMode ? '#D1D5DB' : '#4B5563', // gray-300 : gray-600
    muted: isDarkMode ? '#9CA3AF' : '#6B7280', // gray-400 : gray-500
  };

  return (
    <>
      {/* Overlay for Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleMobileMenu}
            style={{ willChange: 'opacity' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={isMobileMenuOpen ? 'mobileOpen' : 'mobileClosed'}
        className="lg:hidden fixed top-0 left-0 h-screen w-[280px] z-50 overflow-hidden"
        style={{ 
          ...glassEffect,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header: Logo and Close Button */}
          <motion.div 
            className="p-5 flex items-center justify-between"
            style={{ backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.5)' : `${theme.primary}10` }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
          >
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3, type: 'spring' }}
              className="flex flex-col"
            >
              <h1 
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: isDarkMode 
                    ? `linear-gradient(90deg, ${theme.primary}, ${theme.accent})` 
                    : `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: isDarkMode ? '0px 0px 2px rgba(255, 255, 255, 0.2)' : 'none',
                }}
              >
                RetinaScan
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                className="h-1 bg-gray-200 rounded-full mt-1"
                style={{ willChange: 'width' }}
              />
            </motion.div>
            <motion.button
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: `${theme.accent}20`,
                backdropFilter: 'blur(4px)',
                color: textColor.primary,
                willChange: 'transform'
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scroll-smooth">
            <AnimatePresence mode="wait">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={index}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ willChange: 'transform, opacity' }}
                  className="mb-2"
                >
                  {item.external ? (
                    <motion.a
                      href={item.path}
                      onClick={toggleMobileMenu}
                      className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
                        location.pathname === item.path ? 'shadow-inner' : ''
                      }`}
                      style={{ 
                        backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                        boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' : 'none',
                        color: textColor.secondary,
                        willChange: 'transform, background-color'
                      }}
                      whileHover={{ 
                        backgroundColor: hoverItemBg, 
                        scale: 1.02,
                        x: 4,
                        transition: { duration: 0.2, type: 'spring' }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="h-6 w-6 mr-3" style={{ color: textColor.primary }} />
                      <span className="text-base font-medium">{item.name}</span>
                    </motion.a>
                  ) : (
                    <motion.div
                      whileHover={{ 
                        scale: 1.02,
                        x: 4,
                        transition: { duration: 0.2, type: 'spring' }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
                          location.pathname === item.path ? 'shadow-inner' : ''
                        }`}
                        style={{ 
                          backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                          boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' : 'none',
                          color: textColor.secondary
                        }}
                      >
                        <item.icon className="h-6 w-6 mr-3" style={{ color: textColor.primary }} />
                        <span className="text-base font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>
          
          {/* Logout Button */}
          <motion.div 
            className="p-4 border-t border-gray-100 dark:border-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, type: 'spring' }}
          >
            <motion.button
              onClick={(e) => handleLogoutEvent(e, toggleMobileMenu, FRONTEND_URL)}
              className="flex items-center p-4 w-full rounded-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444cc, #f87171cc)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                willChange: 'transform, background-color'
              }}
              whileHover={{ scale: 1.03, backgroundColor: '#dc2626' }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
              <span className="text-base font-medium">Logout</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Desktop/Tablet Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="hidden lg:flex flex-col h-screen sticky top-0 z-40"
        style={{ 
          ...glassEffect,
          willChange: 'width',
          transform: 'translateZ(0)'
        }}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div 
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className="flex flex-col"
              >
                <h1 
                  className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: isDarkMode 
                      ? `linear-gradient(90deg, ${theme.primary}, ${theme.accent})` 
                      : `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: isDarkMode ? '0px 0px 2px rgba(255, 255, 255, 0.2)' : 'none',
                  }}
                >
                  RetinaScan
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
                  className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1"
                />
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="text-xl font-extrabold text-white">R</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ willChange: 'transform', color: textColor.primary }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-5 pb-20">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              style={{ willChange: 'transform, opacity' }}
              className="mb-2"
            >
              {item.external ? (
                <motion.a
                  href={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path ? 'shadow-inner' : ''
                  }`}
                  style={{ 
                    backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                    boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' : 'none',
                    color: textColor.secondary
                  }}
                  whileHover={{ 
                    backgroundColor: hoverItemBg, 
                    scale: 1.02,
                    x: 4,
                    transition: { duration: 0.2, type: 'spring' }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="h-5 w-5 min-w-[1.25rem]" style={{ color: textColor.primary }} />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                      style={{ willChange: 'width, opacity', color: textColor.secondary }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.a>
              ) : (
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    x: 4,
                    backgroundColor: hoverItemBg,
                    transition: { duration: 0.2, type: 'spring' }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path ? 'shadow-inner' : ''
                  }`}
                  style={{ 
                    backgroundColor: location.pathname === item.path ? activeItemBg : 'transparent',
                    boxShadow: location.pathname === item.path ? 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)' : 'none',
                    willChange: 'transform, background-color',
                    color: textColor.secondary
                  }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center w-full"
                  >
                    <item.icon className="h-5 w-5 min-w-[1.25rem]" style={{ color: textColor.primary }} />
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                        style={{ color: textColor.secondary }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>
        
        {/* Logout Button for Desktop */}
        <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${isOpen ? 'block' : 'hidden'}`}>
          <motion.button
            onClick={(e) => handleLogoutEvent(e, null, FRONTEND_URL)}
            className="flex items-center p-3 w-full rounded-xl transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444cc, #f87171cc)',
              backdropFilter: 'blur(4px)',
              color: 'white'
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 min-w-[1.25rem]" />
            {isOpen && (
              <motion.span 
                className="ml-3 text-sm font-medium whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
        
        {/* Logout icon only for collapsed sidebar */}
        {!isOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <motion.button
              onClick={(e) => handleLogoutEvent(e, null, FRONTEND_URL)}
              className="flex items-center justify-center p-3 w-full rounded-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444cc, #f87171cc)',
                backdropFilter: 'blur(4px)',
                color: 'white'
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </motion.button>
          </div>
        )}
      </motion.aside>
    </>
  );
}

export default Sidebar;