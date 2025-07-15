import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { FileText, Activity, Gamepad2, Calendar, MessageCircle, TrendingUp } from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  type: 'document' | 'wellness' | 'game' | 'calendar' | 'chat' | 'metrics';
  content: React.ReactNode;
}

// Mock data for the widgets
const mockWidgets: Widget[] = [
  {
    id: '1',
    title: 'Live Collaboration',
    type: 'document',
    content: (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-black font-bold">AK</span>
          </div>
          <span className="text-sm text-gray-300">Alex is editing "Q4 Report"</span>
        </div>
        <div className="bg-gray-800 rounded p-2 text-xs">
          <p className="text-gray-400">Last updated: 2 minutes ago</p>
          <p className="text-cyan-400">3 collaborators active</p>
        </div>
      </div>
    )
  },
  {
    id: '2',
    title: 'Team Wellness',
    type: 'wellness',
    content: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Daily Steps</span>
          <span className="text-cyan-400 font-bold">8,247</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Water Intake</span>
          <span className="text-blue-400 font-bold">6/8 glasses</span>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full">
          <div className="bg-white h-2 rounded-full w-3/4"></div>
        </div>
      </div>
    )
  },
  {
    id: '3',
    title: 'Easter Egg Hunt',
    type: 'game',
    content: (
      <div className="text-center space-y-2">
        <Gamepad2 className="w-8 h-8 text-purple-400 mx-auto" />
        <p className="text-sm text-gray-300">Type "axero" to unlock</p>
        <p className="text-xs text-gray-500">Hidden mini-game</p>
      </div>
    )
  },
  {
    id: '4',
    title: 'Meeting Rooms',
    type: 'calendar',
    content: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Conference A</span>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Conference B</span>
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Huddle Room</span>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  },
  {
    id: '5',
    title: 'Team Chat',
    type: 'chat',
    content: (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
          <span className="text-xs text-gray-300">Sarah: Great presentation!</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-400 rounded-full"></div>
          <span className="text-xs text-gray-300">Mike: Thanks team 🎉</span>
        </div>
        <div className="text-xs text-gray-500">3 new messages</div>
      </div>
    )
  },
  {
    id: '6',
    title: 'Performance',
    type: 'metrics',
    content: (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-300">Productivity</span>
          <span className="text-green-400">+15%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-300">Efficiency</span>
          <span className="text-cyan-400">94%</span>
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
    )
  }
];

export const WidgetGrid: React.FC = () => {
  const [widgets, setWidgets] = useState(mockWidgets);
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
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
          setTimeout(() => setEasterEggUnlocked(false), 3000);
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <div className="relative">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`select-none bg-gradient-to-br ${getWidgetColor(widget.type)} backdrop-blur-sm rounded-lg border p-4 cursor-move transition-all duration-300 hover:scale-105 ${
                        snapshot.isDragging ? 'scale-105 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getWidgetIcon(widget.type)}
                          <h3 className="text-white font-medium text-sm">{widget.title}</h3>
                        </div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                      </div>
                      <div className="text-gray-300">
                        {widget.content}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Easter Egg Effect */}
      {easterEggUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
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
            <p className="text-white">You discovered the hidden mini-game!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};