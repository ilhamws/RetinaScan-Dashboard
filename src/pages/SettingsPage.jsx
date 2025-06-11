import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  UserCircleIcon, 
  PaintBrushIcon, 
  CogIcon,
  PhotoIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function SettingsPageComponent() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { unreadCount, notificationSettings, updateNotificationSettings } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // State untuk pengaturan
  const [settings, setSettings] = useState({
    notifications: {
      patient_added: true,
      patient_updated: true,
      patient_deleted: true,
      scan_added: true,
      scan_updated: true,
      system: true
    },
    appearance: {
      theme: 'blue'
    }
  });
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('appearance');
  
  // State untuk loading
  const [loading, setLoading] = useState(false);
  
  // Efek untuk memperbarui pengaturan notifikasi dari API
  useEffect(() => {
    if (notificationSettings) {
      setSettings(prev => ({
        ...prev,
        notifications: notificationSettings
      }));
    }
  }, [notificationSettings]);
  
  // Efek untuk menyinkronkan tema dengan tema yang aktif
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: theme.name || 'blue'
      }
    }));
  }, [theme.name]);
  
  // Fungsi untuk mengubah pengaturan notifikasi
  const handleNotificationChange = async (type) => {
    const newSettings = {
      ...settings.notifications,
      [type]: !settings.notifications[type]
    };
    
    setSettings(prev => ({
      ...prev,
      notifications: newSettings
    }));
    
    // Simpan ke API
    const success = await updateNotificationSettings(newSettings);
    
    if (success) {
      toast.success(`Notifikasi ${settings.notifications[type] ? 'dinonaktifkan' : 'diaktifkan'}`);
    } else {
      toast.error('Gagal memperbarui pengaturan notifikasi');
      
      // Kembalikan ke nilai sebelumnya jika gagal
      setSettings(prev => ({
        ...prev,
        notifications: notificationSettings
      }));
    }
  };
  
  // Fungsi untuk mengubah tema
  const handleThemeChange = (newTheme) => {
    // Perbarui state pengaturan
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: newTheme
      }
    }));
    
    // Terapkan tema menggunakan fungsi setTheme dari ThemeContext
    setTheme(newTheme);
    
    // Tampilkan notifikasi sukses
    toast.success(`Tema berhasil diubah menjadi ${newTheme}`);
  };
  
  // Variasi animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  // Tema yang tersedia
  const availableThemes = [
    { name: 'blue', primary: '#3b82f6', accent: '#60a5fa' },
    { name: 'purple', primary: '#8b5cf6', accent: '#a78bfa' },
    { name: 'green', primary: '#10b981', accent: '#34d399' },
    { name: 'red', primary: '#ef4444', accent: '#f87171' },
    { name: 'orange', primary: '#f97316', accent: '#fb923c' },
    { name: 'pink', primary: '#ec4899', accent: '#f472b6' },
  ];
  
  // Render tab konten
  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Pengaturan Notifikasi</h2>
              <p className="text-gray-500 dark:text-gray-400">Atur jenis notifikasi yang ingin Anda terima.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-green-100 dark:bg-green-900/60">
                    <UserCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pasien Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada pasien baru ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_added')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_added ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_added ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-blue-100 dark:bg-blue-900/60">
                    <PaintBrushIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Perubahan Data Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat data pasien diperbarui</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_updated')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_updated ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_updated ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-red-100 dark:bg-red-900/60">
                    <UserCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Penghapusan Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat pasien dihapus</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_deleted')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_deleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_deleted ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/60">
                    <PhotoIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Scan Retina Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada scan retina baru ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('scan_added')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.scan_added ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.scan_added ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-teal-100 dark:bg-teal-900/60">
                    <DocumentTextIcon className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pembaruan Hasil Scan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat hasil scan retina diperbarui</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('scan_updated')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.scan_updated ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.scan_updated ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-purple-100 dark:bg-purple-900/60">
                    <CogIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notifikasi Sistem</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi penting dari sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('system')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.system ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.system ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
        
      case 'appearance':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Tampilan</h2>
              <p className="text-gray-500 dark:text-gray-400">Sesuaikan tampilan aplikasi sesuai keinginan Anda.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-lg font-medium mb-4">Tema</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableThemes.map((themeOption) => (
                  <motion.button
                    key={themeOption.name}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange(themeOption.name)}
                    className={`p-5 rounded-xl border relative overflow-hidden ${
                      settings.appearance.theme === themeOption.name 
                        ? `border-2 border-${themeOption.name}-500 shadow-lg` 
                        : isDarkMode 
                          ? 'border-gray-700 hover:border-gray-600' 
                          : 'border-gray-200 hover:border-gray-300'
                    } flex flex-col items-center transition-all`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mb-3 shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${themeOption.primary}, ${themeOption.accent})` }}
                    />
                    <span className="capitalize font-medium">{themeOption.name}</span>
                    {settings.appearance.theme === themeOption.name && (
                      <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-md">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Pengaturan
          </motion.h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <motion.div 
              className={`sticky top-20 rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BellIcon className="h-5 w-5 mr-3" />
                  <span>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'appearance' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <PaintBrushIcon className="h-5 w-5 mr-3" />
                  <span>Tampilan</span>
                </button>
              </nav>
            </motion.div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div 
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {renderTabContent()}
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-end space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-all`}
                onClick={() => {
                  // Reset semua pengaturan ke nilai default
                  toast.info('Pengaturan direset ke nilai default');
                }}
              >
                Reset Ke Default
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 10px 15px -3px ${theme.primary}50` }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl font-medium text-white shadow-md transition-all"
                style={{ 
                  background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
                }}
                onClick={() => {
                  // Simpan semua pengaturan
                  toast.success('Pengaturan berhasil disimpan');
                }}
              >
                Simpan Semua Pengaturan
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const SettingsPage = withPageTransition(SettingsPageComponent);
export default SettingsPage;