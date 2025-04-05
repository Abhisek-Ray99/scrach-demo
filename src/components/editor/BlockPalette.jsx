// src/components/editor/BlockPalette.js
import React from 'react';
// --- Import block components ---
import MoveStepsBlock from '../blocks/Motion/MoveStepsBlock';
import TurnDegreesBlock from '../blocks/Motion/TurnDegreesBlock';
import GoToXYBlock from '../blocks/Motion/GoToXYBlock';
import RepeatBlock from '../blocks/Controls/RepeatBlock';
import FlagClickEventBlock from '../blocks/Events/FlagClickEventBlock';
// ... other imports
import { BLOCK_TYPES } from '../../constants/blocks';

const BlockPalette = () => {
  // Drag start handler - sets data for the drop target
  const handleDragStart = (e, blockType) => {
    // Ensure data is being set correctly
    e.dataTransfer.setData('application/react-flow-block-type', blockType);
    e.dataTransfer.effectAllowed = 'move';
    console.log(`Dragging block type from palette: ${blockType}`); // Add log
  };

  return (
    <div className="space-y-5">
      {/* Motion Category */}
      <div class="border-b border-[#292929]">
        <h1 class="title">Scratch
          <div class="aurora">
            <div class="aurora__item"></div>
            <div class="aurora__item"></div>
            <div class="aurora__item"></div>
            <div class="aurora__item"></div>
          </div>
        </h1>
      </div>
      <div className="p-4">
        <h3 className="text-xs font-bold uppercase text-[#7F7F7F] mb-2 tracking-wide">Motion</h3>
        <div className="space-y-1.5">
          {/* Ensure isPaletteBlock={true} and onDragStart are passed */}
          <MoveStepsBlock isPaletteBlock={true} onDragStart={handleDragStart} />
          <TurnDegreesBlock isPaletteBlock={true} onDragStart={handleDragStart} />
          <GoToXYBlock isPaletteBlock={true} onDragStart={handleDragStart} />
        </div>
      </div>

      {/* Controls Category */}
      <div className="p-4">
        <h3 className="text-xs font-bold uppercase text-[#7F7F7F] mb-2 tracking-wide">Controls</h3>
        <div className="space-y-1.5">
          <RepeatBlock isPaletteBlock={true} onDragStart={handleDragStart} />
          {/* Add other control blocks */}
        </div>
      </div>
      {/* Add other categories */}

      <div className="p-4">
        <h3 className="text-xs font-bold uppercase text-[#7F7F7F] mb-2 tracking-wide">Events</h3>
        <div className="space-y-1.5">
          <FlagClickEventBlock isPaletteBlock={true} onDragStart={handleDragStart} />
          {/* Add other event blocks here */}
        </div>
      </div>
    </div>
  );
};

export default BlockPalette;