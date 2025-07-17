import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { FileText, Activity, Gamepad2, Calendar, MessageCircle, TrendingUp } from 'lucide-react';
import Confetti from 'react-confetti';

interface Widget {
  id: string;
  title: string;
  type: 'document' | 'wellness' | 'game' | 'calendar' | 'chat' | 'metrics';
  content: React.ReactNode;
}

// Memory Match Mini-Game Component
const memoryIcons = ['💻','☕','📅','🖨️','📎','📝','📞','📊','🖥️','🪑','📁','🔒'];
function shuffle(array: any[]) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const MemoryMatchGame: React.FC<{ onClose: () => void; accentColor?: string }> = ({ onClose, accentColor = '#06b6d4' }) => {
  const [cards, setCards] = useState(() => {
    const selected = shuffle(memoryIcons).slice(0, 6);
    const icons = shuffle([...selected, ...selected]);
    return icons.map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  React.useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [i1, i2] = flipped;
      if (cards[i1].icon === cards[i2].icon) {
        setTimeout(() => {
          setCards(prev => prev.map((c, idx) =>
            idx === i1 || idx === i2
              ? { ...c, matched: true, flipped: false }
              : c
          ));
          setFlipped([]);
          setMatchedCount(count => {
            if (count + 2 === cards.length) setWon(true);
            return count + 2;
          });
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, idx) =>
            idx === i1 || idx === i2
              ? { ...c, flipped: false }
              : c
          ));
          setFlipped([]);
        }, 900);
      }
    }
  }, [flipped, cards]);

  const handleFlip = (idx: number) => {
    if (flipped.length < 2 && !cards[idx].flipped && !cards[idx].matched) {
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c));
      setFlipped(prev => [...prev, idx]);
    }
  };
  const handlePlayAgain = () => {
    const selected = shuffle(memoryIcons).slice(0, 6);
    const icons = shuffle([...selected, ...selected]);
    setCards(icons.map((icon, i) => ({ id: i, icon, flipped: false, matched: false })));
    setFlipped([]);
    setMatchedCount(0);
    setMoves(0);
    setWon(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
      {won && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />}
      <div className="bg-gradient-to-br from-white/90 to-blue-100/90 dark:from-gray-900/90 dark:to-black/90 rounded-2xl p-6 shadow-2xl min-w-[340px] max-w-[95vw]"
        style={{ border: `2px solid ${accentColor}` }}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold" style={{ color: accentColor }}>Memory Match</h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl font-bold transition-colors"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
            onMouseLeave={e => (e.currentTarget.style.color = '')}
          >
            ×
          </button>
          </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold shadow-md border transition-all duration-200 ${card.flipped || card.matched ? 'bg-cyan-100 dark:bg-cyan-900/60 border-cyan-400/40' : 'bg-cyan-50 dark:bg-gray-800/60 border-cyan-200/20'} ${card.matched ? 'opacity-60' : 'hover:scale-105'}`}
              onClick={() => handleFlip(idx)}
              disabled={card.flipped || card.matched || flipped.length === 2}
              style={{ cursor: card.flipped || card.matched ? 'default' : 'pointer' }}
            >
              {card.flipped || card.matched ? card.icon : '❓'}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Moves: {moves}</span>
          <span>Matched: {matchedCount / 2} / 6</span>
        </div>
        {won && (
          <div className="text-center mt-2">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-bold text-cyan-600 dark:text-cyan-300 mb-2">You Win!</div>
            <button onClick={handlePlayAgain} className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition">Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Move this to the top of the file, outside the component
const widgetMeta = [
  { id: '1', title: 'Live Collaboration', type: 'document' },
  { id: '2', title: 'Team Wellness', type: 'wellness' },
  { id: '3', title: 'Easter Egg Hunt', type: 'game' },
  { id: '4', title: 'Meeting Rooms', type: 'calendar' },
  { id: '5', title: 'Team Chat', type: 'chat' },
  { id: '6', title: 'Performance', type: 'metrics' },
];

export const WidgetGrid: React.FC<{ isDarkMode: boolean; accentColor?: string }> = ({ isDarkMode, accentColor = '#06b6d4' }) => {
  // Load widget order from localStorage if available
  const getInitialOrder = () => {
    const saved = localStorage.getItem('widgetOrder');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.every(id => typeof id === 'string')) {
          return arr;
        }
      } catch {}
    }
    return widgetMeta.map(w => w.id);
  };
  const [widgetOrder, setWidgetOrder] = useState(getInitialOrder);

  // Persist widget order to localStorage on change
  useEffect(() => {
    localStorage.setItem('widgetOrder', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  // Add missing state for overlays
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  const [showEasterEggOverlay, setShowEasterEggOverlay] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);

  const getWidgetById = (id: string) => widgetMeta.find(w => w.id === id);

  const renderWidgetContent = (widget: { id: string; title: string; type: string }) => {
    switch (widget.id) {
      case '1':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-xs text-black font-bold">AK</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Alex is editing "Q4 Report"</span>
            </div>
            <div className={`rounded p-2 text-xs ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white border border-gray-200 text-gray-900'}`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-900'}>Last updated: 2 minutes ago</p>
              <p style={{ color: accentColor, fontWeight: 500, cursor: 'pointer' }}>3 collaborators active</p>
            </div>
          </div>
        );
      case '2':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Daily Steps</span>
              <span className={`font-bold ${isDarkMode ? 'text-cyan-400' : 'text-black'}`}>8,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Water Intake</span>
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-black'}`}>6/8 glasses</span>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full">
              <div className="bg-white h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        );
      case '3':
        return (
          <div className="text-center space-y-2">
            <Gamepad2 className="w-8 h-8 text-purple-400 mx-auto" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Type "axero" to unlock</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-900'}`}>Hidden mini-game</p>
          </div>
        );
      case '4':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Conference A</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Conference B</span>
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Huddle Room</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        );
      case '5':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Sarah: Great presentation!</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-400 rounded-full"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Mike: Thanks team 🎉</span>
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-900'}`}>3 new messages</div>
          </div>
        );
      case '6':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Productivity</span>
              <span className={isDarkMode ? 'text-green-400' : 'text-black'}>+15%</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Efficiency</span>
              <span className={isDarkMode ? 'text-cyan-400' : 'text-black'}>94%</span>
            </div>
            <div className="h-12 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded flex items-end space-x-1 p-1">
              {[40, 60, 80, 45, 90, 70, 85].map((height, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-purple-500 to-cyan-500 rounded-sm flex-1"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const newOrder = Array.from(widgetOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setWidgetOrder(newOrder);
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'wellness': return <Activity className="w-5 h-5" />;
      case 'game': return <Gamepad2 className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'chat': return <MessageCircle className="w-5 h-5" />;
      case 'metrics': return <TrendingUp className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getWidgetColor = (type: string) => {
    switch (type) {
      case 'document': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'wellness': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'game': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'calendar': return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'chat': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'metrics': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  // Easter egg effect
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
        if (e.target.value.toLowerCase() === 'axero') {
          setEasterEggUnlocked(true);
          setShowEasterEggOverlay(true);
          setShowMemoryGame(false);
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="contents"
              >
                {widgetOrder.map((id, index) => {
                  const widget = getWidgetById(id);
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`select-none ${isDarkMode
                            ? `bg-gradient-to-br ${getWidgetColor(widget?.type || '')} backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-cyan-400/40`
                            : 'bg-white/30 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-cyan-400/40'} cursor-move hover:scale-105 md:min-h-56`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getWidgetIcon(widget?.type || '')}
                              <h3 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{widget?.title}</h3>
                            </div>
                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          </div>
                          <div className={isDarkMode ? 'text-gray-300' : 'text-black'}>
                            {widget && renderWidgetContent(widget)}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Easter Egg Effect */}
      {easterEggUnlocked && showEasterEggOverlay && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              🎮
            </motion.div>
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">Easter Egg Found!</h2>
            <p className="text-white mb-4">You discovered the hidden mini-game!</p>
            <button
              className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onClick={() => {
                setShowEasterEggOverlay(false);
                setShowMemoryGame(true);
              }}
            >
              Start
            </button>
          </div>
        </motion.div>
      )}
      {easterEggUnlocked && showMemoryGame && (
        <MemoryMatchGame
          onClose={() => {
            setEasterEggUnlocked(false);
            setShowMemoryGame(false);
          }}
          accentColor={accentColor}
        />
      )}
    </div>
  );
};