import { useEffect, useRef, useCallback } from 'react';
import { BLOCK_TYPES } from '../constants/blocks'; // Import block types

/**
 * Custom Hook: useSpriteAnimation (Handles Events, Motion, Basic Repeat)
 *
 * - Runs animation loop ONLY when isRunning is true.
 * - Executes scripts PARALLELY for sprites starting with EVENT_FLAG_CLICKED.
 * - Executes Motion blocks sequentially per sprite, dispatching updates immediately.
 * - Handles simple (non-nested) CONTROL_REPEAT blocks.
 * - Resets a sprite's script pointer when it reaches the end of its script for the current run.
 * - Skips collision detection.
 *
 * @param {boolean} isRunning - Global animation running state from context.
 * @param {Array} sprites - Current array of sprite objects from context.
 * @param {function} dispatch - Dispatch function from context's useReducer.
 */
export const useSpriteAnimation = (isRunning, sprites, dispatch) => {
  const animationFrameId = useRef(null); // Stores requestAnimationFrame ID

  // Stores execution state per sprite:
  // { spriteId: { scriptPointer: number, canRun: boolean, loopState: { blockId: { remaining: number, childIndex: number } } }, ... }
  const executionState = useRef({});

  // --- Effect 1: Initialize/Reset Execution State based on Sprites ---
  useEffect(() => {
    const newState = {};
    sprites.forEach(sprite => {
      const canSpriteRun =
        sprite.script &&
        sprite.script.length > 0 &&
        sprite.script[0].type === BLOCK_TYPES.EVENT_FLAG_CLICKED;
      newState[sprite.id] = {
        scriptPointer: canSpriteRun ? 1 : 0,
        canRun: canSpriteRun,
        loopState: {}, // Initialize loop state
      };
    });
    executionState.current = newState;
    // console.log("Execution state initialized/reset based on sprites:", executionState.current);
  }, [sprites]); // Re-run if the sprites array reference changes

  // --- Effect 2: Reset Pointers & Loop State when Animation Starts ---
  useEffect(() => {
    if (isRunning) {
      Object.keys(executionState.current).forEach(spriteId => {
        const state = executionState.current[spriteId];
        if (state) {
            if (state.canRun) {
                state.scriptPointer = 1; // Reset pointer
            } else {
                state.scriptPointer = 0;
            }
            state.loopState = {}; // Clear loop state on start
        }
      });
      // console.log("Animation started, pointers & loop state reset:", executionState.current);
    }
    // No action needed when stopping via button
  }, [isRunning]); // Re-run only when isRunning changes


  // --- Recursive Function to Execute a Block (Handles Nesting Conceptually) ---
  // NOTE: This simplified version only handles one level of Repeat nesting directly.
  const executeBlock = useCallback((sprite, block, spriteExecState) => {
    let updates = null;
    let advancePointer = true; // Should the main script pointer advance after this?

    // Safety checks
    if (!spriteExecState || !block) {
        console.error(`executeBlock called with invalid state or block for sprite ${sprite?.id}`);
        return { updates: null, advancePointer: true };
    }
    if (!spriteExecState.loopState) {
        spriteExecState.loopState = {}; // Ensure loopState exists
    }

    // console.log(`  Executing: ${block.type} (ID: ${block.id})`);

    switch (block.type) {
      // --- Motion Blocks ---
      case BLOCK_TYPES.MOTION_MOVE_STEPS: {
        const steps = block.values[0] || 0;
        const angleRad = (sprite.direction - 90) * (Math.PI / 180);
        const newX = sprite.x + steps * Math.cos(angleRad);
        const newY = sprite.y + steps * Math.sin(angleRad);
        updates = { x: newX, y: newY };
        break;
      }
      case BLOCK_TYPES.MOTION_TURN_DEGREES: {
        const degrees = block.values[0] || 0;
        let newDirection = (sprite.direction + degrees);
        newDirection = ((newDirection % 360) + 360) % 360;
        updates = { direction: newDirection };
        break;
      }
      case BLOCK_TYPES.MOTION_GOTO_XY: {
        const newX = block.values[0] || 0;
        const newY = block.values[1] || 0;
        updates = { x: newX, y: newY };
        break;
      }

      // --- Control Repeat Block ---
      case BLOCK_TYPES.CONTROL_REPEAT: {
        const loopId = block.id;
        const totalIterations = block.values[0] || 0;
        const children = block.children || [];

        // Initialize loop state if first encounter
        if (!spriteExecState.loopState[loopId]) {
          if (totalIterations > 0 && children.length > 0) {
            // console.log(`    -> Starting Loop ${loopId}: ${totalIterations} iterations.`);
            spriteExecState.loopState[loopId] = { remaining: totalIterations, childIndex: 0 };
          } else {
            // console.log(`    -> Skipping Loop ${loopId}: No iterations or children.`);
            advancePointer = true; // Move past the repeat block
            break;
          }
        }

        const currentLoopState = spriteExecState.loopState[loopId];

        

        // Check if loop finished all iterations
        if (!currentLoopState || currentLoopState.remaining <= 0) {
          // console.log(`    -> Finishing Loop ${loopId}.`);
          delete spriteExecState.loopState[loopId]; // Clean up state
          advancePointer = true; // Move past the repeat block
          break;
        }

        // Execute the child block at the current childIndex
        if (currentLoopState.childIndex < children.length) {
          console.log(currentLoopState,"---- stat v3e ----", children.length)
          const childBlock = children[currentLoopState.childIndex];
          // --- Recursive Call (Simplified) ---
          // Execute child, but its state changes are handled by its own dispatch
          const childResult = executeBlock(sprite, childBlock, spriteExecState);
          // If child caused updates, dispatch them
          if (childResult.updates) {
             dispatch({
                type: 'UPDATE_SPRITE_STATE',
                payload: { spriteId: sprite.id, updates: childResult.updates }
             });
          }
          // --- End Recursive Call ---
          currentLoopState.childIndex += 1; // Advance child pointer
        }

        // Check if we finished one full iteration of children
        if (currentLoopState.childIndex >= children.length) {
          currentLoopState.remaining--; // Decrement remaining iterations
          currentLoopState.childIndex = 0; // Reset child pointer for next iteration

          // Check again if loop finished *after* decrementing
          if (currentLoopState.remaining <= 0) {
             // console.log(`    -> Finishing Loop ${loopId} (Last iteration).`);
             delete spriteExecState.loopState[loopId]; // Clean up state
             advancePointer = true; // Advance main pointer *after* last iteration finishes
          } else {
             // console.log(`    -> Loop ${loopId}: Iteration done. Remaining: ${currentLoopState.remaining}`);
             advancePointer = false; // Stay on the Repeat block to continue looping
          }
        } else {
          // Still executing children within the current iteration
          advancePointer = false; // Stay on the Repeat block
        }
        break;
      } // End CONTROL_REPEAT

      // --- Other Blocks ---
      case BLOCK_TYPES.EVENT_FLAG_CLICKED:
        console.warn("Executing event block? Pointer logic might be off.");
        break; // Should not execute
      default:
        // console.log(`  -> Skipping block type: ${block?.type}`);
        break; // Ignore unknown blocks
    }

    return { updates, advancePointer };

  }, [dispatch]); // Added dispatch as dependency because child execution now dispatches


  // --- The Core Animation Loop Logic ---
  const animate = useCallback((timestamp) => {
    if (!isRunning) {
      animationFrameId.current = null;
      return;
    }

    const currentSprites = sprites; // Use state from closure for this frame

    // --- Process Each Sprite ---
    currentSprites.forEach((sprite) => {
      const spriteExecState = executionState.current[sprite.id];
      if (!spriteExecState) return; // Skip if state not ready

      if (!spriteExecState.canRun || !sprite.script || sprite.script.length <= 1) {
        return; // Skip if not runnable etc.
      }

      const pointer = spriteExecState.scriptPointer;

      if (pointer >= sprite.script.length) {
         // End of script reached for this run
         if (Object.keys(spriteExecState.loopState || {}).length === 0) {
             spriteExecState.scriptPointer = 1; // Reset pointer only if not in a loop
         } else { /* Need better handling for ending script while in loop */ }
        return; // Stop processing this sprite for this frame
      }

      const block = sprite.script[pointer];

      // --- Execute the block ---
      const { updates, advancePointer } = executeBlock(sprite, block, spriteExecState);
      // --- ---

      // --- Dispatch Update for Motion Blocks (if not handled by child execution) ---
      // This handles updates for top-level motion blocks directly
      if (updates && block?.type !== BLOCK_TYPES.CONTROL_REPEAT) { // Don't dispatch for Repeat itself
         dispatch({
            type: 'UPDATE_SPRITE_STATE',
            payload: { spriteId: sprite.id, updates: updates }
         });
         dispatch({ type: 'STOP_ANIMATION' });
      }
      // --- End Dispatch ---

      // Advance the main script pointer if the executed block allows it
      if (advancePointer) {
        spriteExecState.scriptPointer += 1;
      }
    }); // End processing each sprite

    // --- Skip Collision Detection ---

    // --- Schedule Next Frame ---
    if (isRunning) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      animationFrameId.current = null;
    }
  }, [isRunning, sprites, dispatch, executeBlock]); // Add executeBlock dependency

  // --- Effect 3: Manage the Animation Loop (requestAnimationFrame) ---
  useEffect(() => {
    if (isRunning) {
      // console.log("useSpriteAnimation Effect: Starting animation loop...");
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        // console.log("useSpriteAnimation Effect: Stopping animation loop...");
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        // console.log("useSpriteAnimation Effect: Animation loop cleaned up.");
      }
    };
  }, [isRunning, animate]); // Depends on isRunning and the animate callback

}; // End of useSpriteAnimation hook