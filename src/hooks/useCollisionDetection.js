import { useEffect, useRef, useCallback } from 'react';

// --- Helper Function for Collision Detection (AABB) ---
// (Keep the checkCollision function as defined previously)
const checkCollision = (spriteA, spriteB) => {
  if (!spriteA || !spriteB || !spriteA.width || !spriteA.height || !spriteB.width || !spriteB.height) return false;
  const stageWidth = 480; const stageHeight = 360;
  const aLeft = (stageWidth / 2) + spriteA.x - (spriteA.width / 2);
  const aTop = (stageHeight / 2) - spriteA.y - (spriteA.height / 2);
  const aRight = aLeft + spriteA.width; const aBottom = aTop + spriteA.height;
  const bLeft = (stageWidth / 2) + spriteB.x - (spriteB.width / 2);
  const bTop = (stageHeight / 2) - spriteB.y - (spriteB.height / 2);
  const bRight = bLeft + spriteB.width; const bBottom = bTop + spriteB.height;
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
};


/**
 * Custom Hook: useCollisionDetection (Handles Detection & Dispatch)
 *
 * Takes sprites array and dispatch function.
 * Detects collisions and dispatches 'HANDLE_COLLISION' for *new* collisions.
 *
 * @param {Array} sprites - Array of sprite objects (id, x, y, width, height).
 * @param {Function} dispatch - The dispatch function from AppContext's useReducer.
 * @param {boolean} isRunning - Flag indicating if animation is active (to avoid dispatching when stopped).
 */
export const useCollisionDetection = (sprites, dispatch, isRunning) => {
  // Ref to store the set of actively colliding pairs from the *previous* check
  const previouslyCollidingPairsRef = useRef(new Set());

  // Effect runs whenever the sprites array reference changes (positions updated)
  // or when the animation starts/stops
  useEffect(() => {
    // --- Don't detect or dispatch if animation isn't running ---
    if (!isRunning) {
        previouslyCollidingPairsRef.current.clear(); // Clear memory when stopped
        return;
    }

    // Need at least two sprites to check for collisions
    if (!sprites || sprites.length < 2) {
      previouslyCollidingPairsRef.current.clear(); // Clear if not enough sprites
      return;
    }

    const currentCollisionsSet = new Set(); // Store colliding pair keys for *this* check

    // Iterate through all unique pairs of sprites
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const spriteA = sprites[i];
        const spriteB = sprites[j];

        // Check for collision using the helper function
        if (checkCollision(spriteA, spriteB)) {
          // Create a consistent pair key by sorting IDs
          const pairKey = [spriteA.id, spriteB.id].sort().join('-');
          currentCollisionsSet.add(pairKey); // Mark as colliding this frame

          // --- Dispatch only if it's a NEW collision ---
          if (!previouslyCollidingPairsRef.current.has(pairKey)) {
            console.log(`useCollisionDetection: New collision detected (${pairKey}). Dispatching HANDLE_COLLISION.`);
            dispatch({
              type: 'HANDLE_COLLISION',
              payload: { spriteId1: spriteA.id, spriteId2: spriteB.id }
            });
            // No need to add to previouslyCollidingPairsRef here, happens at the end
          }
        }
      }
    }

    // Update the ref for the next check AFTER processing all pairs
    previouslyCollidingPairsRef.current = currentCollisionsSet;

    // This hook doesn't need to return anything if its sole purpose is dispatching
    // If you needed the list elsewhere, you could use useState and return it.

  }, [sprites, dispatch, isRunning]); // Dependencies: Re-run when sprites, dispatch, or isRunning change
};