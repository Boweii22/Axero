import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Focus, Zap, Bell, Search, Settings, X } from 'lucide-react';
import { AIAssistant } from './components/AIAssistant';
import { OfficePulse } from './components/OfficePulse';
import { FocusMode } from './components/FocusMode';
import { WidgetGrid } from './components/WidgetGrid';
import { CEOMode } from './components/CEOMode';
import { AccessibilityControls } from './components/AccessibilityControls';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

function App() {
  const loaded = loadSettings();
  const [isListening, setIsListening] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [ceoModeActive, setCeoModeActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(loaded?.isDarkMode ?? true);
  const [isDyslexicFriendly, setIsDyslexicFriendly] = useState(loaded?.isDyslexicFriendly ?? false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Meeting at 2pm', description: 'Conference Room A', time: '5m ago', read: false },
    { id: 2, title: 'New message from Alex', description: '"Check the Q4 report"', time: '12m ago', read: false },
    { id: 3, title: 'System Update', description: 'Workspace will restart at 6pm', time: '1h ago', read: true },
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [colorAccent, setColorAccent] = useState(loaded?.colorAccent || 'cyan');
  const colorOptions = [
    { name: 'Cyan', value: 'cyan', class: 'bg-cyan-400' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-400' },
    { name: 'Green', value: 'green', class: 'bg-green-400' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-400' },
  ];

  // Pool of mock notification templates
  const notificationTemplates = [
    { title: 'New message from Sarah', description: '"Lunch at 1pm?"', time: 'just now' },
    { title: 'Reminder', description: 'Submit your timesheet', time: 'just now' },
    { title: 'Team Standup', description: 'Starts in 10 minutes', time: 'just now' },
    { title: 'File Uploaded', description: 'Alex added Q4_Plan.pdf', time: 'just now' },
    { title: 'System Alert', description: 'Maintenance scheduled for 8pm', time: 'just now' },
    { title: 'New Comment', description: 'Mike commented on your post', time: 'just now' },
    { title: 'Calendar Event', description: 'Design Review at 3pm', time: 'just now' },
  ];

  // Simulate random notifications arriving
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function addRandomNotification() {
      const random = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      setNotifications(prev => [
        {
          id: Date.now(),
          title: random.title,
          description: random.description,
          time: 'just now',
          read: false
        },
        ...prev
      ]);
      // Schedule next notification at a random interval (20-60s)
      const next = Math.random() * 40000 + 20000;
      timeout = setTimeout(addRandomNotification, next);
    }
    // Start the first notification after a short delay
    timeout = setTimeout(addRandomNotification, Math.random() * 40000 + 20000);
    return () => clearTimeout(timeout);
  }, []);

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

  // Close notifications dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.getElementById('notifications-dropdown');
      const bell = document.getElementById('notifications-bell');
      if (dropdown && !dropdown.contains(e.target as Node) && bell && !bell.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

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

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Function to get the current accent color
  const getAccentColor = () => {
    const colorMap = {
      cyan: '#06b6d4',
      purple: '#a78bfa',
      pink: '#ec4899',
      green: '#22c55e',
      orange: '#fb923c'
    };
    return colorMap[colorAccent as keyof typeof colorMap] || '#06b6d4';
  };

  // Profile state
  const [profile, setProfile] = useState(loaded?.profile || { name: 'John Doe', email: 'johndoe@gmail.com' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editProfileDraft, setEditProfileDraft] = useState(profile);
  const [defaultPage, setDefaultPage] = useState(loaded?.defaultPage || 'Dashboard');
  const [receiveNotifications, setReceiveNotifications] = useState(loaded?.receiveNotifications ?? true);
  const [playSoundOnNotification, setPlaySoundOnNotification] = useState(loaded?.playSoundOnNotification ?? false);

  // Save settings to localStorage on change
  useEffect(() => {
    saveSettings({
      profile,
      defaultPage,
      colorAccent,
      receiveNotifications,
      playSoundOnNotification,
      isDarkMode,
      isDyslexicFriendly
    });
  }, [profile, defaultPage, colorAccent, receiveNotifications, playSoundOnNotification, isDarkMode, isDyslexicFriendly]);

  // Request notification permission when enabling desktop notifications
  // This useEffect is no longer needed as desktop notifications are removed

  // Show browser notification for new notifications
  // This useEffect is no longer needed as desktop notifications are removed

  // Add a ref for the audio element
  const notificationAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // In the effect that detects new notifications, play the sound if enabled
  const prevNotificationsRef = React.useRef(notifications);
  useEffect(() => {
    if (!playSoundOnNotification) return;
    // Find new notifications (by id)
    const prev = prevNotificationsRef.current;
    const newOnes = notifications.filter((n: typeof notifications[0]) => !prev.some((p: typeof notifications[0]) => p.id === n.id));
    if (newOnes.length > 0 && notificationAudioRef.current) {
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play();
    }
    prevNotificationsRef.current = notifications;
  }, [notifications, playSoundOnNotification]);

  // Add state for modals at the top of App function
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+F: Toggle Focus Mode
      if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setFocusModeActive(v => !v);
      }
      // Ctrl+, : Open Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      // Esc: Close modals/panels
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        if (showNotifications) setShowNotifications(false);
        if (showUserGuide) setShowUserGuide(false);
        if (showShortcuts) setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, showNotifications, showUserGuide, showShortcuts]);

  return (
    <div
      className={`min-h-screen w-full transition-all duration-500 overflow-x-hidden ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-purple-50'
      } ${isDyslexicFriendly ? 'font-mono' : ''}`}
      style={{
        ...(colorAccent === 'cyan' && { '--accent-color': '#06b6d4' }),
        ...(colorAccent === 'purple' && { '--accent-color': '#a78bfa' }),
        ...(colorAccent === 'pink' && { '--accent-color': '#ec4899' }),
        ...(colorAccent === 'green' && { '--accent-color': '#22c55e' }),
        ...(colorAccent === 'orange' && { '--accent-color': '#fb923c' }),
      } as React.CSSProperties}
    >

      {/* Glass-morphism overlay */}
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-cyan-200/20 via-purple-200/20 to-pink-200/20'}`} />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative z-20 backdrop-blur-sm border-b ${isDarkMode ? 'bg-black/20 border-cyan-500/20' : 'bg-white/70 border-cyan-300/30 shadow-md'} w-full`}
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-4 py-1 sm:py-4 w-full">
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex flex-col items-center text-center space-y-1 w-full sm:flex-row sm:items-center sm:space-x-4 sm:text-left sm:w-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto sm:mx-0"
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

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:space-x-4 sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} absolute left-3 top-3`} />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  className={`pl-10 pr-4 py-2 rounded-lg backdrop-blur-sm border transition-all duration-300 focus:outline-none w-full sm:w-auto ${
                    isDarkMode
                      ? 'bg-black/20 border-gray-700/50 text-white placeholder-gray-400'
                      : 'bg-white/20 border-gray-300/50 text-gray-900 placeholder-gray-500'
                  }`}
                  style={{ borderColor: 'var(--accent-color)', boxShadow: 'none' }}
                  onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-color)'}
                  onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                />
              </div>

              <motion.button
                onClick={toggleFocusMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 w-full sm:w-auto ${
                  focusModeActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-500/50'
                    : isDarkMode
                    ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                    : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                }`}
                style={{ backgroundColor: focusModeActive ? 'var(--accent-color)' : undefined, borderColor: 'var(--accent-color)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Focus className="w-5 h-5" />
                <span>Focus Mode</span>
              </motion.button>

              <div className="flex flex-row items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                <motion.button
                  id="notifications-bell"
                  className={`relative p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    isDarkMode
                      ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                      : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Notifications"
                  aria-haspopup="true"
                  aria-expanded={showNotifications}
                  onClick={() => setShowNotifications(v => !v)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: 'var(--accent-color)' }} />
                  )}
                </motion.button>
                <motion.button
                  className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-black/20 border-gray-700/50 text-gray-300 hover:bg-black/30'
                      : 'bg-white/20 border-gray-300/50 text-gray-700 hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Settings"
                  aria-haspopup="true"
                  aria-expanded={showSettings}
                  onClick={() => setShowSettings(v => !v)}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-1 sm:px-4 py-2 sm:py-8 w-full">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 md:gap-4 lg:gap-8">

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 md:mb-4"
          >
            <div className={`rounded-xl backdrop-blur-sm border p-4 md:p-3 lg:p-6 ${
              isDarkMode
                ? 'bg-black/20 border-gray-700/50'
                : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-gray-200/70 shadow-lg'
            }`}>
              <AIAssistant
                isListening={isListening}
                onToggleListening={() => setIsListening(!isListening)}
                onCommand={handleAICommand}
                accentColor={getAccentColor()}
              />
            </div>
          </motion.div>

          {/* Office Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 md:mb-4"
          >
            <div className={`rounded-xl backdrop-blur-sm border p-4 md:p-3 lg:p-6 ${
              isDarkMode
                ? 'bg-black/20 border-gray-700/50'
                : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-gray-200/70 shadow-lg'
            }`}>
              <OfficePulse isDarkMode={isDarkMode} accentColor={getAccentColor()} />
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
            <WidgetGrid isDarkMode={isDarkMode} accentColor={getAccentColor()} />
          </motion.div>
        </div>
      </main>

      {/* Focus Mode */}
      <FocusMode isActive={focusModeActive} onToggle={toggleFocusMode} accentColor={getAccentColor()} />

      {/* CEO Mode */}
      <CEOMode isActive={ceoModeActive} onClose={() => setCeoModeActive(false)} />

      {/* Accessibility Controls */}
      <AccessibilityControls
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isDyslexicFriendly={isDyslexicFriendly}
        onToggleDyslexicFont={toggleDyslexicFont}
      />

      {/* Audio element for notification sounds */}
      <audio ref={notificationAudioRef} src="/Sound/notification.mp3" preload="auto" />

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

      {/* Notifications Side Panel and Backdrop at root level */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications panel"
            tabIndex={-1}
          />
          {/* Side Panel */}
          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-[350px] max-w-full bg-white dark:bg-gray-900 shadow-2xl border-l border-cyan-400/20 flex flex-col animate-slide-in"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-400/10 bg-gradient-to-r from-cyan-50/80 to-purple-50/80 dark:from-gray-900/80 dark:to-black/80">
              <span className="font-semibold text-cyan-600 dark:text-cyan-300 text-lg">Notifications</span>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/40 focus:outline-none"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-cyan-100 dark:divide-gray-800">
                {notifications.length === 0 ? (
                  <li className="px-6 py-12 text-center text-gray-400">No notifications</li>
                ) : (
                  notifications.map((n: Notification) => (
                    <li
                      key={n.id}
                      className={`px-6 py-4 flex items-start space-x-3 transition-colors duration-200 ${n.read ? 'bg-transparent' : 'bg-cyan-50 dark:bg-cyan-900/30'}`}
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-cyan-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${n.read ? 'text-gray-500 dark:text-gray-400' : 'text-cyan-700 dark:text-cyan-300'}`}>{n.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{n.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{n.description}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="px-6 py-3 border-t border-cyan-400/10 bg-gradient-to-r from-cyan-50/80 to-purple-50/80 dark:from-gray-900/80 dark:to-black/80 flex items-center justify-between">
              <button
                onClick={markAllAsRead}
                className="text-xs text-cyan-500 hover:underline focus:outline-none"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-gray-400 hover:text-cyan-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </motion.aside>
        </>
      )}
      {/* Settings Side Panel and Backdrop at root level */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            aria-label="Close settings panel"
            tabIndex={-1}
          />
          {/* Side Panel */}
          <motion.aside
            className={`fixed top-0 right-0 z-50 h-full min-h-screen w-full max-w-full shadow-2xl border-l flex flex-col animate-slide-in transition-colors duration-300 overflow-y-auto
              ${isDarkMode
                ? 'bg-gray-900 border-cyan-400/20 text-white'
                : 'bg-white border-gray-200 text-gray-900'}`}
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-cyan-400/10 bg-gray-900/80' : 'border-gray-200 bg-gradient-to-r from-cyan-50/80 to-purple-50/80'}`}>
              <span className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{ color: 'var(--accent-color)' }}>
                Settings
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/40 focus:outline-none"
                aria-label="Close settings"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
              {/* Profile Section */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">{profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</div>
                  <div>
                    {editingProfile ? (
                      <>
                        <input
                          type="text"
                          value={editProfileDraft.name}
                          onChange={e => setEditProfileDraft((d: typeof editProfileDraft) => ({ ...d, name: e.target.value }))}
                          className="block w-full mb-1 rounded border px-2 py-1 text-sm bg-white dark:bg-gray-800 border-cyan-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <input
                          type="email"
                          value={editProfileDraft.email}
                          onChange={e => setEditProfileDraft((d: typeof editProfileDraft) => ({ ...d, email: e.target.value }))}
                          className="block w-full rounded border px-2 py-1 text-xs bg-white dark:bg-gray-800 border-cyan-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </>
                    ) : (
                      <>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{profile.name}</div>
                        <div className="text-xs text-gray-500">{profile.email}</div>
                      </>
                    )}
                  </div>
                </div>
                {editingProfile ? (
                  <div className="space-x-2 mt-1">
                    <button
                      className="text-xs text-cyan-500 hover:underline"
                      onClick={() => {
                        setProfile(editProfileDraft);
                        setEditingProfile(false);
                      }}
                    >Save</button>
                    <button
                      className="text-xs text-gray-400 hover:underline"
                      onClick={() => {
                        setEditProfileDraft(profile);
                        setEditingProfile(false);
                      }}
                    >Cancel</button>
                  </div>
                ) : (
                  <button className="text-xs hover:underline" style={{ color: 'var(--accent-color)' }} onClick={() => setEditingProfile(true)}>Edit Profile</button>
                )}
              </div>
              {/* Notification Preferences */}
              <div>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Receive notifications</div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Enable notifications</span>
                  <button
                    className="w-10 h-6 rounded-full flex items-center transition-colors duration-200"
                    style={{ backgroundColor: receiveNotifications ? 'var(--accent-color)' : '#6b7280' }}
                    aria-pressed={receiveNotifications}
                    onClick={() => setReceiveNotifications((v: boolean) => !v)}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${receiveNotifications ? 'translate-x-4' : ''}`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Play sound for new notifications</span>
                  <button
                    className="w-10 h-6 rounded-full flex items-center transition-colors duration-200"
                    style={{ backgroundColor: playSoundOnNotification ? 'var(--accent-color)' : '#6b7280' }}
                    aria-pressed={playSoundOnNotification}
                    onClick={() => setPlaySoundOnNotification((v: boolean) => !v)}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${playSoundOnNotification ? 'translate-x-4' : ''}`}></span>
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Color accent</label>
                <div className="flex space-x-2">
                  {colorOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setColorAccent(opt.value)}
                      className={`w-7 h-7 rounded-full border-2 ${opt.class} ${colorAccent === opt.value ? 'border-cyan-500' : 'border-transparent'} focus:outline-none`}
                      aria-label={`Set accent color to ${opt.name}`}
                    />
                  ))}
                </div>
              </div>

              {/* Workspace Preferences */}
              <div>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Workspace Preferences</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Dark mode</span>
                    <button
                      className="w-10 h-6 rounded-full flex items-center transition-colors duration-200"
                      style={{ backgroundColor: isDarkMode ? 'var(--accent-color)' : '#6b7280' }}
                      aria-pressed={isDarkMode}
                      onClick={toggleDarkMode}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : ''}`}></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Dyslexic-friendly font</span>
                    <button
                      className="w-10 h-6 rounded-full flex items-center transition-colors duration-200"
                      style={{ backgroundColor: isDyslexicFriendly ? 'var(--accent-color)' : '#6b7280' }}
                      aria-pressed={isDyslexicFriendly}
                      onClick={toggleDyslexicFont}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${isDyslexicFriendly ? 'translate-x-4' : ''}`}></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Support & Help */}
              <div>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>Support & Help</div>
                <div className="flex flex-col space-y-2">
                  <button
                    className={`text-sm hover:underline text-left font-medium ${isDarkMode ? 'text-gray-200' : 'text-black'}`}
                    onClick={() => window.open('mailto:tombribowei01@gmail.com', '_blank')}
                  >
                    Contact Support
                  </button>
                  <button
                    className={`text-sm hover:underline text-left font-medium ${isDarkMode ? 'text-gray-200' : 'text-black'}`}
                    onClick={() => setShowUserGuide(true)}
                  >
                    User Guide
                  </button>
                  <button
                    className={`text-sm hover:underline text-left font-medium ${isDarkMode ? 'text-gray-200' : 'text-black'}`}
                    onClick={() => setShowShortcuts(true)}
                  >
                    Keyboard Shortcuts
                  </button>
                </div>
              </div>

              {/* About */}
              <div>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>About</div>
                <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  <div>Axero Workspace v1.0.0</div>
                  <div>Built with React, TypeScript & Tailwind</div>
                  <div>Designed by Tombri Bowei</div>
                  <div>© 2025 Axero Technologies</div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
      {showUserGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-1 sm:px-2">
          <div className={`rounded-xl shadow-2xl p-2 sm:p-8 max-w-xs sm:max-w-lg w-full relative border transition-colors duration-300
            ${isDarkMode ? 'bg-gray-900 border-cyan-400/20' : 'bg-white border-gray-200'}`}
          >
            <button
              className={`absolute top-4 right-4 text-2xl font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}
              onClick={() => setShowUserGuide(false)}
              style={{ cursor: 'pointer' }}
            >&times;</button>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`} style={{ color: 'var(--accent-color)' }}>User Guide</h2>
            <div className={`space-y-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <p>Welcome to Axero Workspace! Here’s how to get started:</p>
              <ul className="list-disc pl-6">
                <li>Use the search bar to quickly find anything in your workspace.</li>
                <li>Customize your dashboard with widgets and preferences.</li>
                <li>Try Focus Mode for deep work sessions.</li>
                <li>Check notifications and manage your profile in the settings panel.</li>
              </ul>
              <p className="mt-2">For more help, visit <a href="https://github.com/Boweii22/Axero" target="_blank" rel="noopener noreferrer" className="underline text-cyan-500">our full documentation</a>.</p>
            </div>
          </div>
        </div>
      )}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-1 sm:px-2">
          <div className={`rounded-xl shadow-2xl p-2 sm:p-8 max-w-md w-full relative border transition-colors duration-300
            ${isDarkMode ? 'bg-gray-900 border-cyan-400/20' : 'bg-white border-gray-200'}`}
          >
            <button
              className={`absolute top-4 right-4 text-2xl font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}
              onClick={() => setShowShortcuts(false)}
              style={{ cursor: 'pointer' }}
            >&times;</button>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`} style={{ color: 'var(--accent-color)' }}>Keyboard Shortcuts</h2>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <li><b>Ctrl+Shift+F</b>: Toggle Focus Mode</li>
              <li><b>Ctrl+,</b>: Open Settings</li>
              <li><b>Ctrl+Alt+Win</b>: Activate CEO Mode</li>
              <li><b>Esc</b>: Close modals/panels</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Utility for localStorage
function loadSettings() {
  try {
    const data = localStorage.getItem('axero-settings');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: any) {
  try {
    localStorage.setItem('axero-settings', JSON.stringify(settings));
  } catch {}
}