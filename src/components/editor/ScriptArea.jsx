// src/components/editor/ScriptArea.jsx

import React, { useContext, useCallback } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { BLOCK_DEFINITIONS, BLOCK_TYPES } from '../../constants/blocks';

// --- Imports for block components (ensure they are correct) ---
import MoveStepsBlock from '../blocks/Motion/MoveStepsBlock';
import TurnDegreesBlock from '../blocks/Motion/TurnDegreesBlock';
import TurnDegreesAntiClockBlock from '../blocks/Motion/TurnDegreeAntiClockBlock';
import GoToXYBlock from '../blocks/Motion/GoToXYBlock';
import RepeatBlock from '../blocks/Controls/RepeatBlock';
import FlagClickEventBlock from '../blocks/Events/FlagClickEventBlock';

import SayBlock from '../blocks/Looks/SayBlock'; 
import ChangeSizeBlock from '../blocks/Looks/ChangeSizeBlock'; 


// --- blockComponentMap (ensure it's correct) ---
const blockComponentMap = {
  [BLOCK_TYPES.MOTION_MOVE_STEPS]: MoveStepsBlock,
  [BLOCK_TYPES.MOTION_TURN_DEGREES]: TurnDegreesBlock,
  [BLOCK_TYPES.MOTION_TURN_DEGREES_ANTI_CLOCK]: TurnDegreesAntiClockBlock,
  [BLOCK_TYPES.MOTION_GOTO_XY]: GoToXYBlock,
  [BLOCK_TYPES.CONTROL_REPEAT]: RepeatBlock,
  [BLOCK_TYPES.EVENT_FLAG_CLICKED]: FlagClickEventBlock,
  [BLOCK_TYPES.LOOKS_SAY]: SayBlock, 
  [BLOCK_TYPES.LOOKS_CHANGE_SIZE_BY]: ChangeSizeBlock, 
};

const ScriptArea = () => {
  const { state, dispatch } = useContext(AppContext);
  const { sprites, selectedSpriteId } = state;
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const script = selectedSprite ? selectedSprite.script : [];

  // --- Drag Handlers ---
  const handleDragOver = useCallback((e) => {
    // Check if the drag is coming *from* the palette (or potentially reordering blocks later)
    // This check might be useful if you implement block reordering within the script area
    if (e.dataTransfer.types.includes('application/react-flow-block-type')) {
        e.preventDefault(); // Allow drop ONLY if it's a block type we recognize
        e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDeleteBlock = useCallback((blockId) => {
    if (!selectedSpriteId || !blockId) return; // Safety check
    console.log(`Requesting delete for block ${blockId} in sprite ${selectedSpriteId}`);
    dispatch({
      type: 'REMOVE_BLOCK',
      payload: {
        spriteId: selectedSpriteId,
        blockIdToRemove: blockId,
      }
    });
  }, [dispatch, selectedSpriteId]);

  // MODIFIED: Removed the e.target === e.currentTarget check
  const handleDropOnArea = useCallback((e) => {
    e.preventDefault();
    // Stop propagation HERE to prevent potential parent drop zones if this component is nested
    e.stopPropagation();

    const blockType = e.dataTransfer.getData('application/react-flow-block-type');
    console.log(`Drop on ScriptArea background detected for type: ${blockType}`);

    // We assume if the event reached here, it wasn't stopped by a child drop zone
    if (blockType && selectedSpriteId) {
      const blockDefinition = BLOCK_DEFINITIONS[blockType];
      if (blockDefinition && blockComponentMap[blockType]) {
        const newBlock = {
          id: `${blockType}_${Date.now()}`,
          type: blockType,
          values: [...(blockDefinition.defaultValues || [])],
          ...(blockDefinition.isContainer && { children: [] }),
        };
        dispatch({
          type: 'ADD_BLOCK_TO_SPRITE',
          payload: { spriteId: selectedSpriteId, block: newBlock },
        });
      } else { /* Error handling */ }
    } else {
        console.log("Drop on area ignored - missing blockType or selectedSpriteId");
    }
  }, [dispatch, selectedSpriteId]);

  const handleDropIntoBlock = useCallback((blockType, containerBlockId) => {
    // This logic remains the same - it's called by the child block's handler
    console.log(`Dispatching ADD_BLOCK_TO_CONTAINER for type ${blockType} into ${containerBlockId}`);
    if (blockType && selectedSpriteId && containerBlockId) {
      const blockDefinition = BLOCK_DEFINITIONS[blockType];
      if (blockDefinition && blockComponentMap[blockType]) {
        const newBlock = { /* ... create block ... */
            id: `${blockType}_${Date.now()}`,
            type: blockType,
            values: [...(blockDefinition.defaultValues || [])],
            ...(blockDefinition.isContainer && { children: [] }),
        };
        dispatch({
          type: 'ADD_BLOCK_TO_CONTAINER',
          payload: { spriteId: selectedSpriteId, containerBlockId, block: newBlock }
        });
      } else { /* Error handling */ }
    }
  }, [dispatch, selectedSpriteId]);

  // --- Recursive Block Rendering Function (renderBlock - keep as before) ---
  const renderBlock = useCallback((block) => {
    const BlockComponent = blockComponentMap[block.type];
    if (!BlockComponent) { /* ... error handling ... */ }

    let renderedChildren = null;
    if (Object.prototype.hasOwnProperty.call(block, 'children')) {
      if (block.children && block.children.length > 0) {
        // Pass handleDeleteBlock down recursively
        renderedChildren = block.children.map(childBlock => renderBlock(childBlock));
      } else { /* ... placeholder ... */ }
    }

    const blockProps = {
      key: block.id,
      id: block.id, // Pass ID for deletion
      isPaletteBlock: false,
      // --- Pass the delete handler down ---
      onDeleteBlock: handleDeleteBlock,
      // --- Other props ---
      ...(block.type === BLOCK_TYPES.MOTION_MOVE_STEPS && { steps: block.values[0] }),

      ...(block.type === BLOCK_TYPES.LOOKS_SAY && { message: block.values[0] }),
      ...(block.type === BLOCK_TYPES.LOOKS_CHANGE_SIZE_BY && { change: block.values[0] }),
      // ... other specific props ...
      ...(Object.prototype.hasOwnProperty.call(block, 'children') && { renderedChildren: renderedChildren }),
      ...(Object.prototype.hasOwnProperty.call(block, 'children') && { onDropIntoBlock: handleDropIntoBlock }),
    };

    return <BlockComponent {...blockProps} />;
    // Ensure handleDeleteBlock is included in dependencies
  }, [handleDropIntoBlock, handleDeleteBlock]);

  // --- JSX Structure (Keep as before) ---
  return (
    <div
      className="flex-1 flex-1 relative h-full overflow-y-auto"
      onDragOver={handleDragOver} // Attach drag over to the main area
      onDrop={handleDropOnArea}   // Attach drop handler to the main area
    >
      {/* Sticky Header */}
      <h2 className="text-lg font-semibold mb-4 text-white sticky top-0 backdrop-blur-sm py-2 z-10 px-5">
        Script Area {selectedSprite ? `for ${selectedSprite.id}` : '(No sprite selected)'}
      </h2>

      {/* Conditional Rendering */}
      {selectedSpriteId && script.length > 0 ? (
        <div className="h-[90%] space-y-1.5 pt-2 px-5 pb-5">
          {script.map(renderBlock)}
        </div>
      ) : (
        <div className="h-[90%] border-2 border-dashed border-[#292929] rounded-lg flex items-center justify-center text-gray-400 m-2">
          {selectedSpriteId ? 'Drop blocks here' : 'Select a sprite to add scripts'}
        </div>
      )}
    </div>
  );
};

export default ScriptArea;