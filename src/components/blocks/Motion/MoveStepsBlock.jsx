// Example: src/components/blocks/Motion/MoveStepsBlock.js
import React from "react";
import { Move, Trash2 } from "lucide-react"; // Import Lucid icon
import { BLOCK_TYPES } from "../../../constants/blocks";

const MoveStepsBlock = ({
  id, // <-- Receive the block instance ID
  steps = 10,
  isPaletteBlock = false,
  onDragStart,
  onDeleteBlock, // <-- Receive the delete handler
}) => {
  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, BLOCK_TYPES.MOTION_MOVE_STEPS);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent triggering other actions on the block
    if (onDeleteBlock && id) {
      onDeleteBlock(id); // Call the handler passed from ScriptArea with this block's ID
    }
  };

  return (
    <div
      className={`
        group relative flex items-center space-x-1.5
        bg-[#1B354F] ${!isPaletteBlock ? "" : "hover:bg-[#1B354F]"}
        text-white text-sm font-medium px-3 py-1.5 rounded mb-1.5
        select-none transition-colors duration-150 ease-in-out
        min-w-[150px]
        ${isPaletteBlock ? "cursor-grab shadow-sm" : "cursor-default"}
      `}
      draggable={isPaletteBlock}
      onDragStart={isPaletteBlock ? handleDragStart : undefined}
    >
      {/* Block Content */}
      <Move size={16} className="flex-shrink-0" color="#4DB4F7" />
      <span className="text-[#DDE0E1]">Move</span>
      <input
        type="number"
        className="w-10 h-5 text-black text-center text-xs font-medium rounded-sm border border-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-blue-100"
        defaultValue={steps}
        onClick={(e) => e.stopPropagation()}
        readOnly={isPaletteBlock}
      />
      <span className="text-[#DDE0E1]">steps</span>

      {/* --- Delete Button (Only shown when NOT in palette) --- */}
      {!isPaletteBlock && onDeleteBlock && (
        <button
          onClick={handleDeleteClick}
          className={`
            absolute -top-1.5 -right-1.5 z-10 p-0.5 bg-red-500 text-white rounded-full
            opacity-0 group-hover:opacity-100 focus:opacity-100 // Show on hover/focus
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
            transition-opacity duration-150 ease-in-out
          `}
          title="Delete Block"
          aria-label="Delete Block"
        >
          <Trash2 size={12} />
        </button>
      )}
      {/* --- End Delete Button --- */}
    </div>
  );
};

export default MoveStepsBlock;
