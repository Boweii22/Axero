import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface AIAssistantProps {
  isListening: boolean;
  onToggleListening: () => void;
  onCommand: (command: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isListening, 
  onToggleListening, 
  onCommand 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 60;
      
      // Create pulsing orb effect
      const pulseIntensity = isListening ? 1 + Math.sin(time * 8) * 0.3 : 0.8;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * pulseIntensity);
      gradient.addColorStop(0, isListening ? 'rgba(0, 255, 255, 0.8)' : 'rgba(147, 51, 234, 0.6)');
      gradient.addColorStop(0.5, isListening ? 'rgba(0, 255, 255, 0.4)' : 'rgba(147, 51, 234, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Core orb
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6 * pulseIntensity, 0, Math.PI * 2);
      ctx.fillStyle = isListening ? 'rgba(0, 255, 255, 0.3)' : 'rgba(147, 51, 234, 0.3)';
      ctx.fill();
      
      // Particle effects
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time;
        const x = centerX + Math.cos(angle) * (radius * 0.8 * pulseIntensity);
        const y = centerY + Math.sin(angle) * (radius * 0.8 * pulseIntensity);
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isListening ? 'rgba(0, 255, 255, 0.8)' : 'rgba(147, 51, 234, 0.8)';
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isListening]);

  const handleVoiceCommand = () => {
    if (isListening) {
      // Simulate voice recognition
      const commands = [
        "Summarizing your 5 unread emails...",
        "Finding the latest marketing presentation...",
        "Activating Focus Mode...",
        "Good morning! How can I help you today?"
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setCurrentResponse(randomCommand);
      onCommand(randomCommand);
      
      setTimeout(() => {
        setCurrentResponse('');
        onToggleListening();
      }, 3000);
    } else {
      onToggleListening();
    }
  };

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mb-4">
        <canvas 
          ref={canvasRef}
          width={200}
          height={200}
          className="absolute inset-0"
        />
        <motion.button
          onClick={handleVoiceCommand}
          className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isListening ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 2, repeat: isListening ? Infinity : 0, ease: "linear" }}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-cyan-400" />
            ) : (
              <Mic className="w-8 h-8 text-purple-400" />
            )}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-cyan-500/30 max-w-xs text-center"
          >
            <p className="text-cyan-400 text-sm">{currentResponse}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-2">
        <p className="text-sm text-gray-400">Say "Hey Axero" to start</p>
        <p className="text-xs text-gray-500 mt-1">Workplace Guardian</p>
      </div>
    </motion.div>
  );
};