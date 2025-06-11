import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { globalTheme, animations as sharedAnimations } from '../utils/theme';

// Theme Context
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    return localStorage.getItem('themeName') || 'blue';
  });
  const [theme, setTheme] = useState(() => {
    // Menggunakan tema default dengan modifikasi sesuai tema yang dipilih dari localStorage
    const savedThemeName = localStorage.getItem('themeName') || 'blue';
    
    // Warna tema sesuai dengan yang tersedia di SettingsPage
    const themeColors = {
      blue: { primary: '#3b82f6', accent: '#60a5fa' },
      purple: { primary: '#8b5cf6', accent: '#a78bfa' },
      green: { primary: '#10b981', accent: '#34d399' },
      red: { primary: '#ef4444', accent: '#f87171' },
      orange: { primary: '#f97316', accent: '#fb923c' },
      pink: { primary: '#ec4899', accent: '#f472b6' },
    };
    
    // Gabungkan tema global dengan warna tema yang dipilih
    return {
      ...globalTheme,
      primary: themeColors[savedThemeName].primary,
      secondary: themeColors[savedThemeName].accent,
      primaryGradient: `linear-gradient(135deg, ${themeColors[savedThemeName].primary}, ${themeColors[savedThemeName].accent})`,
    };
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek preferensi tema dari localStorage atau preferensi sistem
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Deteksi perangkat mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Efek untuk menerapkan tema ke dokumen
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle tema gelap/terang
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Fungsi untuk mengubah tema warna
  const setThemeColor = (themeName) => {
    // Warna tema sesuai dengan yang tersedia di SettingsPage
    const themeColors = {
      blue: { primary: '#3b82f6', accent: '#60a5fa' },
      purple: { primary: '#8b5cf6', accent: '#a78bfa' },
      green: { primary: '#10b981', accent: '#34d399' },
      red: { primary: '#ef4444', accent: '#f87171' },
      orange: { primary: '#f97316', accent: '#fb923c' },
      pink: { primary: '#ec4899', accent: '#f472b6' },
    };
    
    // Simpan tema yang dipilih ke localStorage
    localStorage.setItem('themeName', themeName);
    setCurrentThemeName(themeName);
    
    // Update tema dengan warna yang dipilih
    setTheme(prevTheme => ({
      ...prevTheme,
      primary: themeColors[themeName].primary,
      secondary: themeColors[themeName].accent,
      primaryGradient: `linear-gradient(135deg, ${themeColors[themeName].primary}, ${themeColors[themeName].accent})`,
    }));
  };

  // Tema yang diperluas dengan mode gelap/terang
  const extendedTheme = {
    ...theme,
    isDarkMode,
    current: {
      background: isDarkMode ? '#111827' : '#F9FAFB',
      text: isDarkMode ? '#F9FAFB' : '#111827',
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
    },
    name: currentThemeName,
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: extendedTheme, 
      setTheme: setThemeColor, 
      isMobile, 
      isDarkMode, 
      toggleDarkMode,
      currentThemeName
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook untuk menggunakan theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// HOC untuk mendukung animasi page transition
export const withPageTransition = (Component) => {
  return (props) => {
    const { isDarkMode } = useTheme();
    
    return (
      <motion.div
        key={isDarkMode ? 'dark' : 'light'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut" 
        }}
        style={{ 
          willChange: 'opacity',
          transform: 'translateZ(0)'
        }}
        className={`w-full h-full ${isDarkMode ? 'dark' : ''}`}
      >
        <Component {...props} />
      </motion.div>
    );
  };
};

// Export animations dari tema bersama
export const animations = sharedAnimations; 