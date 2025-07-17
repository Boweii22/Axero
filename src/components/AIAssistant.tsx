import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface AIAssistantProps {
  isListening: boolean;
  onToggleListening: () => void;
  onCommand: (command: string) => void;
  accentColor?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isListening, 
  onToggleListening, 
  onCommand,
  accentColor = '#06b6d4'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock AI responses
  const mockResponses: Record<string, string> = {
    schedule: "Here's your schedule: 10am Standup, 1pm Design Review, 3pm 1:1 with Alex.",
    online: "Alex, Sarah, and Mike are currently online.",
    focus: "Activating Focus Mode... Stay productive!",
    hello: "Good morning! How can I help you today?",
    unread: "You have 5 unread emails. Would you like a summary?",
    marketing: "The latest marketing presentation is in your shared drive.",
    thanks: "You're welcome! Let me know if you need anything else.",
    weather: "Today's weather is sunny, 72°F. Perfect for a walk!",
    lunch: "Lunch is scheduled for 12:30pm. Today's menu: pasta and salad.",
    coffee: "The coffee machine is working and freshly stocked!",
    meeting: "Your next meeting is at 2pm with the product team.",
    joke: "Why did the developer go broke? Because he used up all his cache!",
    time: `It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}."`,
    date: `Today is ${new Date().toLocaleDateString()}."`,
    help: "You can ask about your schedule, who's online, the weather, or say 'tell me a joke'."
  };
  function getMockResponse(query: string) {
    const lower = query.toLowerCase();
    if (lower.includes('schedule')) return mockResponses.schedule;
    if (lower.includes('online')) return mockResponses.online;
    if (lower.includes('focus')) return mockResponses.focus;
    if (lower.includes('hello') || lower.includes('hi')) return mockResponses.hello;
    if (lower.includes('unread')) return mockResponses.unread;
    if (lower.includes('marketing')) return mockResponses.marketing;
    if (lower.includes('thank')) return mockResponses.thanks;
    if (lower.includes('weather')) return mockResponses.weather;
    if (lower.includes('lunch')) return mockResponses.lunch;
    if (lower.includes('coffee')) return mockResponses.coffee;
    if (lower.includes('meeting')) return mockResponses.meeting;
    if (lower.includes('joke')) return mockResponses.joke;
    if (lower.includes('time')) return mockResponses.time;
    if (lower.includes('date')) return mockResponses.date;
    if (lower.includes('help')) return mockResponses.help;
    return "I'm here to help! Try asking about your schedule, the weather, or say 'tell me a joke'.";
  }

  useEffect(() => {
    if (!isListening) return;
    // Setup Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCurrentResponse('Sorry, your browser does not support voice recognition.');
      setTimeout(() => setCurrentResponse(''), 3000);
      onToggleListening();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      const response = getMockResponse(result);
      setCurrentResponse(response);
      onCommand(result);
      // Speak the response aloud
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(response));
      setTimeout(() => {
        setCurrentResponse('');
        setTranscript('');
        onToggleListening();
      }, 3500);
    };
    recognition.onerror = (event: any) => {
      setCurrentResponse('Sorry, I did not catch that. Please try again.');
      setTimeout(() => setCurrentResponse(''), 2000);
      setTranscript('');
      onToggleListening();
    };
    recognitionRef.current = recognition;
    recognition.start();
    return () => {
      recognition.stop();
    };
  }, [isListening]);

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
      
      // Convert hex to rgba for the accent color
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * pulseIntensity);
      gradient.addColorStop(0, isListening ? hexToRgba(accentColor, 0.8) : hexToRgba(accentColor, 0.6));
      gradient.addColorStop(0.5, isListening ? hexToRgba(accentColor, 0.4) : hexToRgba(accentColor, 0.3));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Core orb
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6 * pulseIntensity, 0, Math.PI * 2);
      ctx.fillStyle = isListening ? hexToRgba(accentColor, 0.3) : hexToRgba(accentColor, 0.3);
      ctx.fill();
      
      // Particle effects
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time;
        const x = centerX + Math.cos(angle) * (radius * 0.8 * pulseIntensity);
        const y = centerY + Math.sin(angle) * (radius * 0.8 * pulseIntensity);
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isListening ? hexToRgba(accentColor, 0.8) : hexToRgba(accentColor, 0.8);
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
  }, [isListening, accentColor]);

  const handleVoiceCommand = () => {
    if (!isListening) {
        onToggleListening();
    } else {
      // If already listening, stop
      if (recognitionRef.current) recognitionRef.current.stop();
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
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          className="relative z-10 w-24 h-24 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            borderColor: `${accentColor}30`,
            boxShadow: `0 0 20px ${accentColor}20`
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isListening ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 2, repeat: isListening ? Infinity : 0, ease: "linear" }}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" style={{ color: accentColor }} />
            ) : (
              <Mic className="w-8 h-8" style={{ color: accentColor }} />
            )}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border max-w-xs text-center mb-2"
            style={{ borderColor: `${accentColor}30` }}
          >
            <p className="text-sm" style={{ color: accentColor }}>{transcript}</p>
          </motion.div>
        )}
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border max-w-xs text-center"
            style={{ borderColor: `${accentColor}30` }}
          >
            <p className="text-sm" style={{ color: accentColor }}>{currentResponse}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-2">
        <p className="text-sm text-gray-400">Click the mic and speak to ask Axero anything</p>
        <p className="text-xs text-gray-500 mt-1">Workplace Guardian</p>
      </div>
    </motion.div>
  );
};