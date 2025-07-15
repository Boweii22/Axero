import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Focus, Zap, Bell, Search, Settings } from 'lucide-react';
import { AIAssistant } from './components/AIAssistant';
import { OfficePulse } from './components/OfficePulse';
import { FocusMode } from './components/FocusMode';
import { WidgetGrid } from './components/WidgetGrid';
import { CEOMode } from './components/CEOMode';
import { AccessibilityControls } from './components/AccessibilityControls';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [ceoModeActive, setCeoModeActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDyslexicFriendly, setIsDyslexicFriendly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'Meta') {
        setCeoModeActive(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAICommand = (command: string) => {
    if (command.includes('Focus Mode')) {
      setFocusModeActive(true);
    }
  };

  const toggleFocusMode = () => {
    setFocusModeActive(!focusModeActive);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleDyslexicFont = () => {
    setIsDyslexicFriendly(!isDyslexicFriendly);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' 
        : 'bg-gradient-to-br from-white via-blue-50 to-purple-50'
    } ${isDyslexicFriendly ? 'font-mono' : ''}`}>
      
      {/* Glass-morphism overlay */}
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-cyan-200/20 via-purple-200/20 to-pink-200/20'}`} />
      
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative z-20 backdrop-blur-sm border-b ${isDarkMode ? 'bg-black/20 border-cyan-500/20' : 'bg-white/70 border-cyan-300/30 shadow-md'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Axero Workspace
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTime.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} absolute left-3 top-3`} />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  className={`pl-10 pr-4 py-2 rounded-lg backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    isDarkMode 
                      ? 'bg-black/20 border-gray-700/50 text-white placeholder-gray-400' 
                      : 'bg-white/20 border-gray-300/50 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <motion.button
                onClick={toggleFocusMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  focusModeActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-500/50'
                    : isDarkMode
                    ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                    : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Focus className="w-5 h-5" />
                <span>Focus Mode</span>
              </motion.button>

              <div className="flex items-center space-x-2">
                <motion.button
                  className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                      : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.button>
                <motion.button
                  className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                      : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className={`rounded-xl backdrop-blur-sm border p-6 ${
              isDarkMode
                ? 'bg-black/20 border-gray-700/50'
                : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-gray-200/70 shadow-lg'
            }`}>
              <AIAssistant
                isListening={isListening}
                onToggleListening={() => setIsListening(!isListening)}
                onCommand={handleAICommand}
              />
            </div>
          </motion.div>

          {/* Office Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className={`rounded-xl backdrop-blur-sm border p-6 ${
              isDarkMode
                ? 'bg-black/20 border-gray-700/50'
                : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-gray-200/70 shadow-lg'
            }`}>
              <OfficePulse />
            </div>
          </motion.div>

          {/* Widget Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Workspace Dashboard
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Drag and drop widgets to customize your workspace
              </p>
            </div>
            <WidgetGrid isDarkMode={isDarkMode} />
          </motion.div>
        </div>
      </main>

      {/* Focus Mode */}
      <FocusMode isActive={focusModeActive} onToggle={toggleFocusMode} />

      {/* CEO Mode */}
      <CEOMode isActive={ceoModeActive} onClose={() => setCeoModeActive(false)} />

      {/* Accessibility Controls */}
      <AccessibilityControls
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isDyslexicFriendly={isDyslexicFriendly}
        onToggleDyslexicFont={toggleDyslexicFont}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;