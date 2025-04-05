// src/components/blocks/Motion/GoToXYBlock.js

import React from 'react';
import { LocateFixed, Trash2 } from 'lucide-react'; // Icon for Go To XY
import { BLOCK_TYPES } from '../../../constants/blocks';

/**
 * GoToXYBlock Component - Styled with Tailwind CSS
 * Represents the "Go to x: [x] y: [y]" motion block.
 */
const GoToXYBlock = ({
  id, // Receive ID
  x = 0,
  y = 0,
  isPaletteBlock = false,
  onDragStart,
  onDeleteBlock, // Receive delete handler
}) => {

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, BLOCK_TYPES.MOTION_GOTO_XY);
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
        bg-[#1B354F] ${!isPaletteBlock ? '' : 'hover:bg-[#1B354F]'}
        text-white text-sm font-medium px-3 py-1.5 rounded mb-1.5
        select-none transition-colors duration-150 ease-in-out
        min-w-[150px]
        ${isPaletteBlock ? 'cursor-grab shadow-sm' : 'cursor-default'}
      `}
      draggable={isPaletteBlock}
      onDragStart={isPaletteBlock ? handleDragStart : undefined}
    >
      {/* Block Content */}
      <LocateFixed size={16} className="flex-shrink-0" color='#4DB4F7' />
      <span className='text-[#DDE0E1]'>Go to x:</span>
      <input type="number" className="w-10 h-5 text-black text-center text-xs font-medium rounded-sm border border-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-blue-100" defaultValue={x} onClick={(e) => e.stopPropagation()} readOnly={isPaletteBlock}/>
      <span className='text-[#DDE0E1]'>y:</span>
      <input type="number" className="w-10 h-5 text-black text-center text-xs font-medium rounded-sm border border-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-blue-100" defaultValue={y} onClick={(e) => e.stopPropagation()} readOnly={isPaletteBlock}/>

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

export default GoToXYBlock;