// src/hooks/useCollisionDetection.js
import { useState, useEffect, useCallback } from 'react';

// Helper function for AABB collision check
// Assumes sprites have x, y (top-left), width, height
const checkCollision = (spriteA, spriteB) => {
  if (!spriteA || !spriteB || spriteA.id === spriteB.id) {
    return false;
  }
  return (
    spriteA.x < spriteB.x + spriteB.width &&
    spriteA.x + spriteA.width > spriteB.x &&
    spriteA.y < spriteB.y + spriteB.height &&
    spriteA.y + spriteA.height > spriteB.y
  );
};

/**
 * Custom Hook: useCollisionDetection
 *
 * Detects collisions between sprites based on their bounding boxes.
 *
 * @param {Array} sprites - Array of sprite objects, each needing id, x, y, width, height.
 * @returns {Array} - An array of pairs of IDs for colliding sprites, e.g., [[id1, id2], [id3, id4]].
 */
export const useCollisionDetection = (sprites) => {
  const [collidingPairs, setCollidingPairs] = useState([]);

  const detectCollisions = useCallback(() => {
    const pairs = [];
    if (!sprites || sprites.length < 2) {
        setCollidingPairs([]);
        return;
    }

    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const spriteA = sprites[i];
        const spriteB = sprites[j];

        // Ensure sprites have necessary properties
        if (spriteA.width && spriteA.height && spriteB.width && spriteB.height) {
            if (checkCollision(spriteA, spriteB)) {
              // Sort IDs to ensure consistent pair representation (e.g., [sprite1, sprite2] not [sprite2, sprite1])
              const pair = [spriteA.id, spriteB.id].sort();
              // Avoid adding duplicate pairs if multiple checks run close together
              if (!pairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
                  pairs.push(pair);
              }
            }
        } else {
            console.warn(`Sprite ${spriteA.id} or ${spriteB.id} missing dimensions for collision check.`);
        }
      }
    }
    // Only update state if the pairs have actually changed
    setCollidingPairs(currentPairs => {
        if (JSON.stringify(currentPairs) !== JSON.stringify(pairs)) {
            return pairs;
        }
        return currentPairs;
    });
  }, [sprites]); // Dependency: re-run only if the sprites array reference changes

  // Run detection whenever the sprites array changes
  useEffect(() => {
    detectCollisions();
  }, [detectCollisions]); // detectCollisions includes sprites in its dependency array

  return collidingPairs;
};

// Export the helper if needed elsewhere
export { checkCollision };