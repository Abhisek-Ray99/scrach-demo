// src/components/blocks/Looks/SayBlock.jsx
import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { BLOCK_TYPES } from '../../../constants/blocks';

const SayBlock = ({
    id,
    message = 'Hello!', // Default message prop
    isPaletteBlock = false,
    onDragStart,
    onDeleteBlock,
}) => {

  const handleDragStart = (e) => {
    if (onDragStart && isPaletteBlock) {
      onDragStart(e, BLOCK_TYPES.LOOKS_SAY);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDeleteBlock && id) {
        onDeleteBlock(id);
    }
  };

  return (
    <div
      className={`
        group relative flex items-center space-x-1.5
        bg-[#8a089b] ${!isPaletteBlock ? '' : 'hover:bg-[#8a089b'} /* Looks color */
        text-white text-sm font-medium px-3 py-1.5 rounded mb-1.5
        select-none transition-colors duration-150 ease-in-out
        min-w-[150px]
        ${isPaletteBlock ? 'cursor-grab shadow-sm' : 'cursor-default'}
      `}
      draggable={isPaletteBlock}
      onDragStart={isPaletteBlock ? handleDragStart : undefined}
    >
      {/* Block Content */}
      <MessageSquare size={16} className="flex-shrink-0" />
      <span>Say</span>
      <input
        type="text" // Text input for the message
        className="flex-1 h-5 text-black text-left px-1 text-xs font-medium rounded-sm border border-purple-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-purple-100"
        defaultValue={message}
        onClick={(e) => e.stopPropagation()}
        readOnly={isPaletteBlock}
        // Consider adding onChange to update state if editing in script area is needed
      />

      {/* Delete Button */}
      {!isPaletteBlock && onDeleteBlock && (
        <button onClick={handleDeleteClick} /* ... delete button styling ... */ >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};

export default SayBlock;