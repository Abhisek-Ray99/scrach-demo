import { useEffect, useRef, useCallback } from "react";
import { BLOCK_TYPES } from "../constants/blocks";

/**
 * useSpriteAnimation (Corrected Stop Logic & Repeat)
 *
 * Handles sprite script execution per animation frame:
 * - Parallel event handling for EVENT_FLAG_CLICKED blocks.
 * - Sequential motion and control flow execution per sprite.
 * - Manages basic loop (CONTROL_REPEAT) behavior correctly.
 * - Stops global animation ONLY when a sprite finishes its *entire* script.
 * - Skips nested loops, conditionals, and collisions for now.
 *
 * @param {boolean} isRunning - Global flag to control animation lifecycle.
 * @param {Array} sprites - Array of sprite objects with script data.
 * @param {Function} dispatch - Reducer dispatcher to update sprite state.
 */
export const useSpriteAnimation = (isRunning, sprites, dispatch) => {
  const animationFrameId = useRef(null);
  const executionState = useRef({}); // Tracks per-sprite execution metadata

  // Effect 1: Initialize or merge sprite execution state
  useEffect(() => {
    const prevState = executionState.current;
    const newState = {};
    sprites.forEach((sprite) => {
      const spriteId = sprite.id;
      const existing = prevState[spriteId];
      const canRun =
        sprite.script?.[0]?.type === BLOCK_TYPES.EVENT_FLAG_CLICKED;
      newState[spriteId] = existing
        ? { ...existing, canRun } // Preserve pointer/loopState, update canRun
        : { scriptPointer: canRun ? 1 : 0, canRun, loopState: {} }; // Initialize new
    });
    executionState.current = newState;
  }, [sprites]);

  // Effect 2: Reset pointers and loop state on animation start
  useEffect(() => {
    if (isRunning) {
      Object.values(executionState.current).forEach((state) => {
        if (state) {
          // Ensure state exists
          state.scriptPointer = state.canRun ? 1 : 0;
          state.loopState = {}; // Clear loop state on START
        }
      });
    }
    // No reset needed when stopping via button
  }, [isRunning]);

  // --- Recursive Function to Execute a Block ---
  // Returns { updates: object | null, advancePointer: boolean }
  const executeBlock = useCallback((sprite, block, state) => {
    if (!block || !state) return { updates: null, advancePointer: true };

    let updates = null;
    let advancePointer = true;
    const loopState = state.loopState || (state.loopState = {}); // Ensure loopState exists

    switch (block.type) {
      case BLOCK_TYPES.MOTION_MOVE_STEPS: {
        const steps = block.values[0] || 0;
        const angle = (sprite.direction - 90) * (Math.PI / 180);
        updates = {
          x: sprite.x + steps * Math.cos(angle),
          y: sprite.y + steps * Math.sin(angle),
        };
        break;
      }
      case BLOCK_TYPES.MOTION_TURN_DEGREES: {
        const deg = block.values[0] || 0;
        const newDir = (((sprite.direction + deg) % 360) + 360) % 360;
        updates = { direction: newDir };
        break;
      }
      case BLOCK_TYPES.MOTION_TURN_DEGREES_ANTI_CLOCK: {
        const deg = block.values[0] || 0;
        const newDir = (((sprite.direction - deg) % 360) + 360) % 360;
        updates = { direction: newDir };
        break;
      }
      case BLOCK_TYPES.MOTION_GOTO_XY: {
        updates = { x: block.values[0] || 0, y: block.values[1] || 0 };
        break;
      }
      case BLOCK_TYPES.LOOKS_SAY: {
        const message = block.values[0] || ''; 
        updates = { sayMessage: message }; 
        break;
      }
      case BLOCK_TYPES.LOOKS_CHANGE_SIZE_BY: {
        const change = block.values[0] || 0;
        let newSize = (sprite.size || 100) + change;
        newSize = Math.max(10, Math.min(newSize, 500));
        updates = { size: newSize };
        break;
      }
      case BLOCK_TYPES.CONTROL_REPEAT: {
        const loopId = block.id;
        const total = block.values[0] || 0;
        const children = block.children || [];

        // Initialize loop state if first encounter
        if (!loopState[loopId]) {
          if (total > 0 && children.length) {
            loopState[loopId] = { remaining: total, childIndex: 0 };
          } else {
            advancePointer = true; // Skip empty/0-iteration loop
            break;
          }
        }

        const loop = loopState[loopId];

        // Check if loop finished or state is missing
        if (!loop || loop.remaining <= 0) {
          delete loopState[loopId]; // Clean up just in case
          advancePointer = true; // Ensure pointer advances if loop is done
          break;
        }

        // Execute child if available
        if (loop.childIndex < children.length) {
          const child = children[loop.childIndex];
          if (child) {
            // Safety check for child block
            const result = executeBlock(sprite, child, state); // Recursive call
            if (result.updates) updates = result.updates; // Capture updates from child
          }
          loop.childIndex++;
          advancePointer = false; // Stay on Repeat block to execute next child or loop
        }

        // Check if iteration finished
        if (loop.childIndex >= children.length) {
          loop.remaining--;
          loop.childIndex = 0; // Reset for next iteration

          // Check if loop is completely finished *after* decrementing
          if (loop.remaining <= 0) {
            delete loopState[loopId]; // Clean up state
            advancePointer = true; // Allow main pointer to advance *now*
          }
          // else: More iterations left, advancePointer remains false
        }
        // else: Still executing children, advancePointer remains false

        break; // Exit CONTROL_REPEAT case
      }
      default:
        // Ignore EVENT_FLAG_CLICKED and unknown types during execution
        break;
    }

    return { updates, advancePointer };
  }, []); // No external dependencies needed for logic

  // --- The Core Animation Loop Logic ---
  const animate = useCallback(
    (timestamp) => {
      if (!isRunning) {
        animationFrameId.current = null;
        return;
      }

      let shouldStopGlobal = false; // Flag to signal stopping after processing all sprites

      sprites.forEach((sprite) => {
        const state = executionState.current[sprite.id];
        // Basic checks to see if sprite should run
        if (!state?.canRun || !sprite.script || sprite.script.length <= 1)
          return;

        const pointer = state.scriptPointer;
        // Check if already past the end (e.g., from previous frame)
        if (pointer >= sprite.script.length) {
          // Script finished in a previous frame, do nothing for this sprite
          return;
        }

        const block = sprite.script[pointer];
        // console.log('Executing block:', block, 'at pointer:', pointer, 'for sprite:', sprite.id);
        if (!block) {
          console.error(
            `Block undefined at pointer ${pointer} for sprite ${sprite.id}`
          );
          state.scriptPointer++; // Try to recover by skipping
          return;
        }

        // Execute the current block
        const { updates, advancePointer } = executeBlock(sprite, block, state);

        // Dispatch state updates if the block caused any
        if (updates) {
          dispatch({
            type: "UPDATE_SPRITE_STATE",
            payload: { spriteId: sprite.id, updates },
          });
          // --- REMOVED incorrect STOP dispatch from here ---
        }

        // Advance the pointer if the block execution allows it
        if (advancePointer) {
          state.scriptPointer++;

          // --- Check if script finished AFTER advancing pointer ---
          if (state.scriptPointer >= sprite.script.length) {
            console.log(`Sprite ${sprite.id} finished script.`);
            // Reset pointer for next run (optional, good practice)
            state.scriptPointer = state.canRun ? 1 : 0;
            state.loopState = {}; // Clear loops too
            // Signal that the global animation should stop *after* this frame
            shouldStopGlobal = true;
          }
          // --- End script finished check ---
        }
      }); // End forEach sprite

      // --- Stop Global Animation ONLY if a script finished ---
      if (shouldStopGlobal) {
        console.log(
          "A sprite finished its script, dispatching STOP_ANIMATION."
        );
        dispatch({ type: "STOP_ANIMATION" });
        // No need to schedule next frame
        animationFrameId.current = null;
        return; // Exit animate function
      }
      // --- End Stop Global Animation ---

      // Schedule the next frame if still running
      if (isRunning) {
        // Check isRunning again before scheduling
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null; // Clear if stopped during this frame
      }
    },
    [isRunning, sprites, dispatch, executeBlock]
  ); // Dependencies

  // Effect 3: Animation loop lifecycle management
  useEffect(() => {
    if (isRunning) {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isRunning, animate]); // Dependencies
}; // End of hook
