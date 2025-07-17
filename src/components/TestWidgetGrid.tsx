import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const initialWidgets = [
  { id: '1', title: 'Widget 1' },
  { id: '2', title: 'Widget 2' },
  { id: '3', title: 'Widget 3' },
];

export default function TestWidgetGrid() {
  const [widgetOrder, setWidgetOrder] = useState(initialWidgets.map(w => w.id));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(widgetOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setWidgetOrder(newOrder);
    console.log('New order:', newOrder);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Minimal DnD Test</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {widgetOrder.map((id, index) => {
                const widget = initialWidgets.find(w => w.id === id);
                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          border: '1px solid #ccc',
                          padding: 16,
                          marginBottom: 8,
                          background: '#fff',
                          ...provided.draggableProps.style,
                        }}
                      >
                        {widget.title}
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
  );
} 