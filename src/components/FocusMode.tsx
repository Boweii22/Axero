import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, Play, Pause, RotateCcw } from 'lucide-react';

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
  accentColor?: string;
}

export const FocusMode: React.FC<FocusModeProps> = ({ isActive, onToggle, accentColor = '#06b6d4' }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      // Generate particles for transition
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);
    }
  }, [isActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Pomodoro complete notification
      new Notification('Pomodoro Complete!', {
        body: 'Time for a break! 🎉',
        icon: '/vite.svg'
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTimeLeft(25 * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          {/* Animated particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, delay: particle.delay, repeat: Infinity }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: accentColor
              }}
            />
          ))}

          <div className="text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Focus className="w-16 h-16 mx-auto mb-4" style={{ color: accentColor }} />
              <h2 className="text-4xl font-bold text-white mb-2">Focus Mode</h2>
              <p className="text-gray-400">Deep work session activated</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="w-64 h-64 rounded-full border-4 flex items-center justify-center relative" style={{ borderColor: accentColor + '4D' }}>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="4"
                    strokeDasharray={`${((25 * 60 - timeLeft) / (25 * 60)) * 754} 754`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-5xl font-mono text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isRunning ? 'FOCUS' : 'PAUSED'}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center space-x-4 mb-8"
            >
              <button
                onClick={toggleTimer}
                className="flex items-center space-x-2 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #8b5cf6 100%)` }}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Exit Focus Mode
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};