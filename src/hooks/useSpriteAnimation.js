// src/hooks/useSpriteAnimation.js

import { useEffect, useRef, useCallback } from 'react';
import { BLOCK_TYPES } from '../constants/blocks';

/**
 * useSpriteAnimation
 * 
 * Handles sprite script execution per animation frame:
 * - Parallel event handling for EVENT_FLAG_CLICKED blocks.
 * - Sequential motion and control flow execution per sprite.
 * - Manages basic loop (CONTROL_REPEAT) behavior with state isolation.
 * - Skips nested loops, conditionals, and collisions for now.
 *
 * @param {boolean} isRunning - Global flag to control animation lifecycle.
 * @param {Array} sprites - Array of sprite objects with script data.
 * @param {Function} dispatch - Reducer dispatcher to update sprite state.
 */
export const useSpriteAnimation = (isRunning, sprites, dispatch) => {
  const animationFrameId = useRef(null);
  const executionState = useRef({}); // Tracks per-sprite execution metadata

  // Initialize or merge sprite execution state
  useEffect(() => {
    const prevState = executionState.current;
    const newState = {};

    sprites.forEach(sprite => {
      const spriteId = sprite.id;
      const existing = prevState[spriteId];

      const canRun = sprite.script?.[0]?.type === BLOCK_TYPES.EVENT_FLAG_CLICKED;

      newState[spriteId] = existing
        ? { ...existing, canRun }
        : { scriptPointer: canRun ? 1 : 0, canRun, loopState: {} };
    });

    executionState.current = newState;
  }, [sprites]);

  // Reset pointers and loop state on animation start
  useEffect(() => {
    if (isRunning) {
      Object.values(executionState.current).forEach(state => {
        state.scriptPointer = state.canRun ? 1 : 0;
        state.loopState = {};
      });
    }
  }, [isRunning]);

  const executeBlock = useCallback((sprite, block, state) => {
    if (!block || !state) return { updates: null, advancePointer: true };

    let updates = null;
    let advancePointer = true;

    const loopState = state.loopState || (state.loopState = {});

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
        const newDir = ((sprite.direction + deg) % 360 + 360) % 360;
        updates = { direction: newDir };
        break;
      }

      case BLOCK_TYPES.MOTION_GOTO_XY: {
        updates = {
          x: block.values[0] || 0,
          y: block.values[1] || 0,
        };
        break;
      }

      case BLOCK_TYPES.CONTROL_REPEAT: {
        const loopId = block.id;
        const total = block.values[0] || 0;
        const children = block.children || [];

        if (!loopState[loopId]) {
          if (total > 0 && children.length) {
            loopState[loopId] = { remaining: total, childIndex: 0 };
          } else {
            break; // Skip empty/no-iteration loop
          }
        }

        const loop = loopState[loopId];

        if (!loop || loop.remaining <= 0) {
          delete loopState[loopId];
          break;
        }

        const child = children[loop.childIndex];

        if (child) {
          const result = executeBlock(sprite, child, state);
          if (result.updates) updates = result.updates;

          loop.childIndex++;
          advancePointer = false;
        }

        if (loop.childIndex >= children.length) {
          loop.remaining--;
          loop.childIndex = 0;

          if (loop.remaining <= 0) {
            delete loopState[loopId];
            advancePointer = true;
          }
        }

        break;
      }

      default:
        break;
    }

    return { updates, advancePointer };
  }, []);

  const animate = useCallback((timestamp) => {
    if (!isRunning) {
      animationFrameId.current = null;
      return;
    }

    sprites.forEach(sprite => {
      const state = executionState.current[sprite.id];
      if (!state?.canRun || !sprite.script || sprite.script.length <= 1) return;

      const pointer = state.scriptPointer;
      if (pointer >= sprite.script.length) {
        if (Object.keys(state.loopState || {}).length === 0) {
          state.scriptPointer = 1;
        } else {
          state.scriptPointer = 1;
          state.loopState = {};
        }
        return;
      }

      const block = sprite.script[pointer];
      if (!block) {
        state.scriptPointer++;
        return;
      }

      const { updates, advancePointer } = executeBlock(sprite, block, state);

      if (updates) {
        dispatch({
          type: 'UPDATE_SPRITE_STATE',
          payload: { spriteId: sprite.id, updates }
        });

        dispatch({ type: 'STOP_ANIMATION' }); // Dev hook: Remove if needed
      }

      if (advancePointer) state.scriptPointer++;
    });

    if (isRunning) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [isRunning, sprites, dispatch, executeBlock]);

  // Animation loop lifecycle
  useEffect(() => {
    if (isRunning) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isRunning, animate]);
};
