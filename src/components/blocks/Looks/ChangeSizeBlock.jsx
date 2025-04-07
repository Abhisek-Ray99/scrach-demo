// src/components/blocks/Looks/ChangeSizeBlock.jsx
import React from 'react';
import { ZoomIn, Trash2 } from 'lucide-react';
import { BLOCK_TYPES } from '../../../constants/blocks';

const ChangeSizeBlock = ({
    id,
    change = 10, // Default change value prop
    isPaletteBlock = false,
    onDragStart,
    onDeleteBlock,
}) => {

  const handleDragStart = (e) => {
    if (onDragStart && isPaletteBlock) {
      onDragStart(e, BLOCK_TYPES.LOOKS_CHANGE_SIZE_BY);
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
        bg-[#8a089b] ${!isPaletteBlock ? '' : 'hover:bg-[#8a089b]'} /* Looks color */
        text-white text-sm font-medium px-3 py-1.5 rounded mb-1.5
        select-none transition-colors duration-150 ease-in-out
        min-w-[150px]
        ${isPaletteBlock ? 'cursor-grab shadow-sm' : 'cursor-default'}
      `}
      draggable={isPaletteBlock}
      onDragStart={isPaletteBlock ? handleDragStart : undefined}
    >
      {/* Block Content */}
      <ZoomIn size={16} className="flex-shrink-0" />
      <span>Change size by</span>
      <input
        type="number" // Number input for size change
        className="w-10 h-5 text-black text-center text-xs font-medium rounded-sm border border-purple-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-purple-100"
        defaultValue={change}
        onClick={(e) => e.stopPropagation()}
        readOnly={isPaletteBlock}
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

export default ChangeSizeBlock;