// src/components/blocks/Events/FlagClickEventBlock.jsx
import React from 'react';
import { Flag, Trash2 } from 'lucide-react';
import { BLOCK_TYPES } from '../../../constants/blocks';

/**
 * FlagClickEventBlock Component - Styled with Tailwind CSS
 * Represents the "When Green Flag clicked" event block (hat block).
 */
const FlagClickEventBlock = ({
  id, // Receive ID
  isPaletteBlock = false,
  onDragStart,
  onDeleteBlock, // Receive delete handler
}) => {

  const handleDragStart = (e) => {
    if (onDragStart && isPaletteBlock) {
      onDragStart(e, BLOCK_TYPES.EVENT_FLAG_CLICKED);
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
        bg-[#2B4336] ${!isPaletteBlock ? '' : 'hover:bg-[#2B4336]'}
        text-black text-sm font-medium px-3 py-1.5 mb-1.5
        select-none transition-colors duration-150 ease-in-out
        min-w-[180px]
        ${isPaletteBlock ? 'cursor-grab shadow-sm rounded-md' : 'cursor-default rounded-t-xl rounded-b-md'}
      `}
      draggable={isPaletteBlock}
      onDragStart={isPaletteBlock ? handleDragStart : undefined}
    >
      {/* Block Content */}
      <Flag size={16} className="flex-shrink-0" color='#5BDE95' />
      <span className='text-[#DDE0E1]'>When Green Flag clicked</span>

      {/* Delete Button */}
      {!isPaletteBlock && onDeleteBlock && (
        <button
          onClick={handleDeleteClick}
          className={`absolute -top-1.5 -right-1.5 z-10 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-opacity duration-150 ease-in-out`}
          title="Delete Block" aria-label="Delete Block"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};

export default FlagClickEventBlock;