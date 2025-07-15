import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';

interface CEOModeProps {
  isActive: boolean;
  onClose: () => void;
}

export const CEOMode: React.FC<CEOModeProps> = ({ isActive, onClose }) => {
  const [profit, setProfit] = useState(1245000);
  const [showPromotion, setShowPromotion] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setProfit(prev => prev + Math.floor(Math.random() * 1000));
      }, 100);

      setTimeout(() => {
        setShowPromotion(true);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  const metrics = [
    { label: 'Revenue', value: '$2.4M', change: '+12%', icon: DollarSign },
    { label: 'Employees', value: '247', change: '+8%', icon: Users },
    { label: 'Growth', value: '34%', change: '+5%', icon: TrendingUp },
    { label: 'Targets', value: '89%', change: '+15%', icon: Target }
  ];

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 bg-black/90 backdrop-blur-sm border border-gold-500/30 rounded-lg p-6 z-50 min-w-[400px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-400">CEO Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-500/30"
              >
                <div className="flex items-center justify-between">
                  <metric.icon className="w-5 h-5 text-yellow-400" />
                  <span className="text-green-400 text-sm">{metric.change}</span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className="text-xs text-gray-400">{metric.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-medium">Real-time Profit</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${profit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">+$847 per minute</div>
          </div>

          <AnimatePresence>
            {showPromotion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-sm rounded-lg flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                    Congratulations!
                  </h3>
                  <p className="text-white mb-4">You're promoted to CEO!</p>
                  <button
                    onClick={() => setShowPromotion(false)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-full font-medium hover:scale-105 transition-transform"
                  >
                    Accept Promotion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};