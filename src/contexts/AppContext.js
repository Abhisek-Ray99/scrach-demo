import React, { createContext, useReducer } from "react";
import { BLOCK_DEFINITIONS, BLOCK_TYPES } from '../constants/blocks';
import { getSpriteDefinition } from '../constants/sprites';

// --- Define Initial Scripts ---
const dogScript = [
  { id: 'dog_flag_1', type: BLOCK_TYPES.EVENT_FLAG_CLICKED, values: [] },
  {
    id: 'dog_repeat_1', type: BLOCK_TYPES.CONTROL_REPEAT, values: [10], children: [
      { id: 'dog_move_1', type: BLOCK_TYPES.MOTION_MOVE_STEPS, values: [10] } // Positive move
    ]
  }
];

const dinoScript = [
  { id: 'dino_flag_1', type: BLOCK_TYPES.EVENT_FLAG_CLICKED, values: [] },
  {
    id: 'dino_repeat_1', type: BLOCK_TYPES.CONTROL_REPEAT, values: [10], children: [
      { id: 'dino_move_1', type: BLOCK_TYPES.MOTION_MOVE_STEPS, values: [-10] } // Negative move
    ]
  }
];

// --- Get Default Dimensions (Optional but good practice) ---
// Fallback values if definitions are missing
const dogDef = getSpriteDefinition('dog') || { defaultWidth: 60, defaultHeight: 55 };
const dinoDef = getSpriteDefinition('dinosaur') || { defaultWidth: 70, defaultHeight: 65 };

// --- Initial State ---
const initialState = {
  sprites: [
    // Dog Sprite (Left Side)
    {
      id: 'dog-1', // Unique ID
      type: 'dog',
      x: -200, // Positioned left
      y: 0,    // Centered vertically
      direction: 90, // Facing right
      width: dogDef.defaultWidth,
      height: dogDef.defaultHeight,
      size: 100,
      sayMessage: null,
      script: dogScript, // Assign predefined script
    },
    // Dinosaur Sprite (Right Side)
    {
      id: 'dino-1', // Unique ID
      type: 'dinosaur',
      x: 200, // Positioned right
      y: 0,   // Centered vertically
      direction: 90, // Facing left (optional, -90 or 270)
      width: dinoDef.defaultWidth,
      height: dinoDef.defaultHeight,
      size: 100,
      sayMessage: null,
      script: dinoScript, // Assign predefined script
    }
  ],
  selectedSpriteId: 'dog-1', // Select the dog initially (or null)
  isRunning: false,
};

// --- Helper: Generate Unique Sprite ID ---
const generateSpriteId = (type, existingSprites) => {
  let count = 1;
  let newId = `${type}-${count}`;
  // Ensure ID is unique among current sprites
  while (existingSprites.some((sprite) => sprite.id === newId)) {
    count++;
    newId = `${type}-${count}`;
  }
  return newId;
};

const removeBlockRecursive = (blocks, blockIdToRemove) => {
  // Filter out the block at the current level if its ID matches
  const filteredBlocks = blocks.filter((block) => block.id !== blockIdToRemove);

  // Recursively process the children of the remaining blocks
  return filteredBlocks.map((block) => {
    // If the block has children, recursively call removeBlockRecursive on them
    if (block.children && block.children.length > 0) {
      const updatedChildren = removeBlockRecursive(
        block.children,
        blockIdToRemove
      );
      // Return a *new* block object with the updated children array
      // Only create new object if children actually changed to optimize slightly
      if (updatedChildren.length !== block.children.length) {
        return { ...block, children: updatedChildren };
      }
    }
    // If no children or children didn't change, return the block as is
    return block;
  });
};

const findAndAddInContainer = (blocks, containerId, blockToAdd) => {
  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i];

    // Check if the current block is the target container
    if (currentBlock.id === containerId) {
      // Ensure the container has a children array (it should if defined correctly)
      if (!currentBlock.children) {
        currentBlock.children = []; // Initialize if somehow missing
        console.warn(`Container block ${containerId} was missing a children array. Initialized.`);
      }
      // Add the new block to the container's children
      currentBlock.children.push(blockToAdd);
      return true; // Block added successfully
    }

    // If the current block has children, search recursively within them
    if (currentBlock.children && currentBlock.children.length > 0) {
      const addedInChildren = findAndAddInContainer(currentBlock.children, containerId, blockToAdd);
      // If added in a nested container, we're done
      if (addedInChildren) {
        return true;
      }
    }
  }
  // Container ID not found at this level or any deeper level
  return false;
};

const modifyFirstMoveBlockValue = (script, blockTypes) => { // <-- Added blockTypes parameter
  let modified = false;
  const newScript = [...script];

  // Define the inner function - it now has access to blockTypes via closure or parameter
  const findAndModify = (blocks) => {
    for (let i = 0; i < blocks.length; i++) {
      if (modified) return;

      const block = blocks[i];

      // --- Use the passed blockTypes constant ---
      if (block.type === blockTypes.MOTION_MOVE_STEPS) { // <-- Use parameter here
        const originalValue = block.values?.[0] || 0;
        const newValue = -originalValue;
        const newBlock = {
          ...block,
          values: [newValue, ...(block.values?.slice(1) || [])]
        };
        blocks[i] = newBlock;
        modified = true;
        // console.log(`    -> Modified Move block ${block.id}: value ${originalValue} -> ${newValue}`);
        return;
      }
      // --- End target block ---

      if (block.children && block.children.length > 0) {
        const newChildren = [...block.children];
        findAndModify(newChildren); // Recurse
        if (modified) {
            // Update parent block with modified children (simplified approach)
            blocks[i] = { ...block, children: newChildren };
            return; // Stop searching other branches
        }
      }
    }
  };

  findAndModify(newScript); // Start the recursive search

  return modified ? newScript : script;
};

// --- Reducer Function ---
const appReducer = (state, action) => {
  console.log("Action Dispatched:", action.type, action.payload);

  switch (action.type) {
    case "SELECT_SPRITE": {
      // Prevent selecting if the ID is the same (optional optimization)
      if (state.selectedSpriteId === action.payload.spriteId) return state;
      return { ...state, selectedSpriteId: action.payload.spriteId };
    }

    case "ADD_SPRITE": {
      const { spriteType } = action.payload;
      const definition = getSpriteDefinition(spriteType); // Get definition by type

      if (!definition) {
        console.error(
          `Cannot add sprite: Definition not found for type "${spriteType}"`
        );
        return state; // Return current state if definition is missing
      }

      const newId = generateSpriteId(spriteType, state.sprites);
      const newSprite = {
        id: newId,
        type: spriteType,
        x: 0, // Default position
        y: 0,
        direction: 90,
        width: definition.defaultWidth,
        height: definition.defaultHeight,
        size: 100,
        sayMessage: null,
        script: [], // Start with an empty script
      };

      return {
        ...state,
        sprites: [...state.sprites, newSprite], // Add the new sprite to the array
        selectedSpriteId: newId, // Automatically select the newly added sprite
      };
    }

    case 'UPDATE_SPRITE_STATE': {
      const { spriteId, updates } = action.payload;

      // Basic validation
      if (!spriteId || !updates) {
        console.error("UPDATE_SPRITE_STATE requires spriteId and updates in payload.");
        return state;
      }

      return {
        ...state, // Keep existing state properties (like isRunning, selectedSpriteId)
        // Create a new sprites array by mapping over the old one
        sprites: state.sprites.map(sprite => {
          // If this is the sprite we want to update...
          if (sprite.id === spriteId) {
            // Return a *new* sprite object
            return {
              ...sprite, // Copy all existing properties of the sprite
              ...updates, // Overwrite/add properties from the 'updates' payload (e.g., { x: newX, y: newY })
            };
          }
          // Otherwise, return the sprite unchanged
          return sprite;
        }),
      };
    }

    case "REMOVE_SPRITE": {
      const { spriteIdToRemove } = action.payload;
      const remainingSprites = state.sprites.filter(
        (sprite) => sprite.id !== spriteIdToRemove
      );

      let newSelectedId = state.selectedSpriteId;
      // If the removed sprite was the selected one, select another one (e.g., the first) or null
      if (state.selectedSpriteId === spriteIdToRemove) {
        newSelectedId =
          remainingSprites.length > 0 ? remainingSprites[0].id : null;
      }

      // If the list becomes empty, ensure selection is null
      if (remainingSprites.length === 0) {
        newSelectedId = null;
      }

      console.log(
        `Removing sprite: ${spriteIdToRemove}. New selection: ${newSelectedId}`
      );

      return {
        ...state,
        sprites: remainingSprites,
        selectedSpriteId: newSelectedId,
      };
    }

    case "ADD_BLOCK_TO_SPRITE": {
      const { spriteId, block } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((sprite) =>
          sprite.id === spriteId
            ? { ...sprite, script: [...sprite.script, block] }
            : sprite
        ),
      };
    }

    case 'ADD_BLOCK_TO_CONTAINER': {
      const { spriteId, containerBlockId, block: blockToAdd } = action.payload;

      // Basic validation
      if (!spriteId || !containerBlockId || !blockToAdd) {
        console.error("ADD_BLOCK_TO_CONTAINER requires spriteId, containerBlockId, and blockToAdd.");
        return state;
      }

      return {
        ...state, // Keep existing top-level state
        sprites: state.sprites.map(sprite => {
          // Find the target sprite
          if (sprite.id === spriteId) {
            // --- IMPORTANT: Deep clone the script to avoid mutation ---
            // JSON parse/stringify is simple but can have limitations (e.g., with functions, Dates, undefined)
            // For complex state, consider a dedicated deep cloning library (like lodash/cloneDeep)
            const clonedScript = JSON.parse(JSON.stringify(sprite.script));

            // Attempt to add the block using the recursive helper on the clone
            const blockWasAdded = findAndAddInContainer(clonedScript, containerBlockId, blockToAdd);

            if (blockWasAdded) {
              console.log(`Added block ${blockToAdd.id} into container ${containerBlockId} for sprite ${spriteId}`);
              // Return a *new* sprite object with the modified (cloned) script
              return { ...sprite, script: clonedScript };
            } else {
              // If the container wasn't found (shouldn't normally happen if DnD logic is correct)
              console.error(`Container block with ID ${containerBlockId} not found in sprite ${spriteId}. Block not added.`);
              // Return the original sprite unchanged in case of error
              return sprite;
            }
          }
          // Return other sprites unchanged
          return sprite;
        }),
      };
    }

    case 'HANDLE_COLLISION': {
      const { spriteId1, spriteId2 } = action.payload;

      if (!spriteId1 || !spriteId2) { /* ... error handling ... */ return state; }

      const sprite1Index = state.sprites.findIndex(s => s.id === spriteId1);
      const sprite2Index = state.sprites.findIndex(s => s.id === spriteId2);

      if (sprite1Index === -1 || sprite2Index === -1) { /* ... error handling ... */ return state; }

      // console.log(`Handling collision: Modifying move steps for ${spriteId1} and ${spriteId2}`);

      const sprite1 = state.sprites[sprite1Index];
      const sprite2 = state.sprites[sprite2Index];

      // --- Modify the scripts using the helper ---
      // *** Pass BLOCK_TYPES to the helper function ***
      const modifiedScript1 = modifyFirstMoveBlockValue(sprite1.script, BLOCK_TYPES); // <-- Pass it here
      const modifiedScript2 = modifyFirstMoveBlockValue(sprite2.script, BLOCK_TYPES); // <-- Pass it here

      if (modifiedScript1 === sprite1.script && modifiedScript2 === sprite2.script) {
        // console.log("  -> No MOVE blocks found or modified in colliding sprites.");
        return state; // No changes needed
      }

      const newSprites = [...state.sprites];
      if (modifiedScript1 !== sprite1.script) {
          newSprites[sprite1Index] = { ...sprite1, script: modifiedScript1 };
      }
      if (modifiedScript2 !== sprite2.script) {
          newSprites[sprite2Index] = { ...sprite2, script: modifiedScript2 };
      }

      return { ...state, sprites: newSprites };
    }

    case "START_ANIMATION": {
      // Prevent unnecessary state updates if already running
      if (state.isRunning) {
        console.log("Reducer: Animation already running, no state change.");
        return state;
      }
      // Log the state change
      console.log("Reducer: Setting isRunning to true");
      // Return the *new* state object with isRunning set to true
      return {
        ...state, // Copy all existing state properties
        isRunning: true, // Update the isRunning property
      };
    }

    case "STOP_ANIMATION": {
      // Prevent unnecessary state updates if already stopped
      if (!state.isRunning) {
        console.log("Reducer: Animation already stopped, no state change.");
        return state;
      }
      // Log the state change
      console.log("Reducer: Setting isRunning to false");
      // Return the *new* state object with isRunning set to false
      return {
        ...state, // Copy all existing state properties
        isRunning: false, // Update the isRunning property
      };
    }

    case "REMOVE_BLOCK": {
      const { spriteId, blockIdToRemove } = action.payload;

      // Prevent action if essential data is missing
      if (!spriteId || !blockIdToRemove) {
        console.error(
          "REMOVE_BLOCK action requires spriteId and blockIdToRemove."
        );
        return state;
      }

      return {
        ...state,
        sprites: state.sprites.map((sprite) => {
          // Find the target sprite
          if (sprite.id === spriteId) {
            console.log(
              `Removing block ${blockIdToRemove} from sprite ${spriteId}`
            );
            // Call the recursive helper to get the updated script
            const updatedScript = removeBlockRecursive(
              sprite.script,
              blockIdToRemove
            );
            // Return a *new* sprite object with the updated script
            return { ...sprite, script: updatedScript };
          }
          // Return other sprites unchanged
          return sprite;
        }),
      };
    }

    default:
      return state;
  }
};

// --- Context Creation & Provider (remain the same) ---
const AppContext = createContext({ state: initialState, dispatch: () => null });
// export const AppProvider = ({ children }) => { ... }; // Keep AppProvider

export { AppContext, appReducer, initialState };
