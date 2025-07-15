import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Eye, Keyboard, Volume2 } from 'lucide-react';

interface AccessibilityControlsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isDyslexicFriendly: boolean;
  onToggleDyslexicFont: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isDarkMode,
  onToggleDarkMode,
  isDyslexicFriendly,
  onToggleDyslexicFont
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 flex items-center justify-center mb-2 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Eye className="w-6 h-6 text-purple-400" />
      </motion.button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-black/80 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 min-w-[200px] mb-2"
        >
          <h3 className="text-white font-medium mb-3">Accessibility</h3>
          
          <div className="space-y-3">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-gray-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              onClick={onToggleDyslexicFont}
              className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-lg">Aa</span>
              <span className="text-gray-300">
                {isDyslexicFriendly ? 'Normal Font' : 'Dyslexic Font'}
              </span>
            </button>

            <div className="flex items-center space-x-3 p-2">
              <Keyboard className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Tab Navigation</span>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-300 text-sm">Voice Control</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};