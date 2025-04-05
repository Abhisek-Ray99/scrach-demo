// src/components/blocks/Controls/RepeatBlock.js
import React from "react";
import { Repeat, Trash2 } from "lucide-react";
import { BLOCK_TYPES } from "../../../constants/blocks";

/**
 * RepeatBlock Component - Styled with Tailwind CSS
 * Represents the "Repeat [count] times" control block (container).
 * Receives already rendered children via props.
 */
const RepeatBlock = ({
  id, // Receive ID
  count = 10,
  renderedChildren,
  isPaletteBlock = false,
  onDragStart,
  onDropIntoBlock,
  onDeleteBlock, // Receive delete handler
}) => {
  const handleDragStart = (e) => {
    if (onDragStart && isPaletteBlock) {
      // Only allow drag from palette
      onDragStart(e, BLOCK_TYPES.CONTROL_REPEAT);
    }
  };

  // --- Drop Zone Logic (for the inner area) ---
  const handleDragOver = (e) => {
    if (!isPaletteBlock && onDropIntoBlock) {
      // Only act as drop target when in script area
      e.preventDefault();
      e.stopPropagation(); // Important: Prevent event from reaching ScriptArea's drop zone
      e.dataTransfer.dropEffect = "move";
      // Optional: Add visual feedback (e.g., change border style/color)
      e.currentTarget.classList.add("bg-orange-400/60"); // Example feedback
    }
  };

  const handleDragLeave = (e) => {
    // Optional: Remove visual feedback
    e.currentTarget.classList.remove("bg-orange-400/60");
  };

  const handleDrop = (e) => {
    if (!isPaletteBlock && onDropIntoBlock) {
      e.preventDefault();
      e.stopPropagation(); // Crucial: Stop propagation
      e.currentTarget.classList.remove("bg-orange-400/60"); // Remove feedback
      const blockType = e.dataTransfer.getData(
        "application/react-flow-block-type"
      );
      console.log(`Attempting drop of ${blockType} into Repeat block: ${id}`);
      if (blockType && id) {
        // Call the handler passed down from ScriptArea
        onDropIntoBlock(blockType, id);
      }
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
            group relative bg-[#4D2B25] ${
              !isPaletteBlock ? "" : "hover:bg-[#4D2B25]"
            }
            text-white text-sm font-medium p-1.5 rounded mb-1.5 select-none
            transition-colors duration-150 ease-in-out
            ${isPaletteBlock ? "cursor-grab shadow-sm" : "cursor-default"}
            min-w-[180px]
        `}
      draggable={isPaletteBlock}
      onDragStart={handleDragStart}
    >
      {/* Header part */}
      <div className="flex items-center space-x-1.5 mb-1 px-1.5">
        <Repeat size={16} className="flex-shrink-0" color="#F88AA2" />
        <span className="text-[#DDE0E1]">Repeat</span>
        <input
          type="number"
          className="w-10 h-5 text-black text-center text-xs font-medium rounded-sm border border-orange-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-orange-100"
          defaultValue={count}
          onClick={(e) => e.stopPropagation()}
          readOnly={isPaletteBlock}
        />
        <span className="text-[#DDE0E1]">times</span>
      </div>

      {/* Inner Drop Zone & Children Area */}
      {!isPaletteBlock && (
        <div
          className="inner-drop-zone ml-4 pl-2 py-1 border-l-2 border-orange-300 min-h-[30px] bg-orange-500/50 rounded-b space-y-1.5 transition-colors duration-100"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          {renderedChildren}
        </div>
      )}

      {/* Delete Button */}
      {!isPaletteBlock && onDeleteBlock && (
        <button
          onClick={handleDeleteClick}
          className={`absolute -top-1.5 -right-1.5 z-10 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-opacity duration-150 ease-in-out`}
          title="Delete Block"
          aria-label="Delete Block"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};

export default RepeatBlock;
