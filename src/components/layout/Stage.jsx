import React, { useContext, useRef, useCallback, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Sprite from '../sprites/Sprite';
import { getSpriteDefinition } from '../../constants/sprites';

const Stage = () => {
  const { state, dispatch } = useContext(AppContext);
  const { sprites } = state;
  const stageRef = useRef(null); // Ref for the stage container DOM element
  const dragInfo = useRef(null); // Ref to store active drag details { id, startX, startY, mouseStartX, mouseStartY, element }

  // --- Mouse Move Handler (attached to document during drag) ---
  const handleMouseMove = useCallback((e) => {
    if (!dragInfo.current) return; // Exit if not dragging

    e.preventDefault(); // Prevent text selection, etc.

    const { id, startX, startY, mouseStartX, mouseStartY, element } = dragInfo.current;

    // Calculate mouse movement delta
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY; // Screen Y increases downwards

    // Calculate new STAGE coordinates (Stage Y increases upwards)
    const newStageX = startX + deltaX;
    const newStageY = startY - deltaY; // Invert deltaY for stage coordinates

    // --- Direct Style Manipulation for Smooth Feedback ---
    // Get sprite dimensions (needed for CSS positioning)
    const spriteData = sprites.find(s => s.id === id);
    if (!spriteData) return; // Should not happen if drag started correctly
    const { width, height } = spriteData;
    const stageWidth = stageRef.current?.offsetWidth || 480; // Get actual stage dimensions
    const stageHeight = stageRef.current?.offsetHeight || 360;

    // Convert new stage coords to CSS top-left coords
    const newCssLeft = (stageWidth / 2) + newStageX - (width / 2);
    const newCssTop = (stageHeight / 2) - newStageY - (height / 2);

    // Apply directly to the DOM element's style for this frame
    // NOTE: We are NOT changing the rotation here, only position
    element.style.left = `${newCssLeft}px`;
    element.style.top = `${newCssTop}px`;
    element.style.cursor = 'grabbing'; // Change cursor while dragging
    // --- End Direct Style Manipulation ---

  }, [sprites]); // Include sprites in dependency array as it's used to find width/height

  // --- Mouse Up Handler (attached to document during drag) ---
  const handleMouseUp = useCallback((e) => {
    if (!dragInfo.current) return; // Exit if not dragging

    const { id, startX, startY, mouseStartX, mouseStartY, element } = dragInfo.current;

    // Calculate final position
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;
    const finalStageX = startX + deltaX;
    const finalStageY = startY - deltaY; // Invert deltaY

    console.log(`Sprite ${id} dropped at Stage X: ${finalStageX.toFixed(1)}, Y: ${finalStageY.toFixed(1)}`);

    // --- Dispatch Final Position to Context ---
    dispatch({
      type: 'UPDATE_SPRITE_STATE',
      payload: {
        spriteId: id,
        updates: { x: finalStageX, y: finalStageY }
      }
    });
    // --- End Dispatch ---

    // Reset element style if needed (React re-render will handle it based on context)
    element.style.cursor = 'grab'; // Reset cursor

    // Clean up
    dragInfo.current = null; // Clear drag info
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

  }, [dispatch, handleMouseMove]); // handleMouseMove is included because it's used in the cleanup

  // --- Mouse Down Handler (attached to the Stage container) ---
  const handleMouseDown = useCallback((e) => {
    // Find the sprite element that was clicked on
    const targetElement = e.target.closest('.sprite-instance');
    if (!targetElement) return; // Exit if click wasn't on a sprite instance

    const spriteId = targetElement.dataset.spriteId;
    if (!spriteId) return; // Exit if no ID found

    // Find the sprite's current state from context
    const sprite = sprites.find(s => s.id === spriteId);
    if (!sprite) return; // Exit if sprite data not found

    console.log(`Starting drag for sprite: ${spriteId}`);

    // Prevent default browser drag behavior just in case
    e.preventDefault();

    // Store drag start information
    dragInfo.current = {
      id: spriteId,
      startX: sprite.x, // Initial STAGE X
      startY: sprite.y, // Initial STAGE Y
      mouseStartX: e.clientX, // Initial Mouse X
      mouseStartY: e.clientY, // Initial Mouse Y
      element: targetElement, // The DOM element being dragged
    };

    // Attach listeners to the document for move and up events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

  }, [sprites, handleMouseMove, handleMouseUp]); // Dependencies for the mousedown handler

  // --- Effect for Cleanup ---
  // Ensures listeners are removed if the component unmounts during a drag
  useEffect(() => {
    return () => {
      if (dragInfo.current) {
        // If component unmounts while dragging, clean up listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        dragInfo.current = null; // Clear drag info
        console.log("Stage unmounted during drag - cleaned up listeners.");
      }
    };
  }, [handleMouseMove, handleMouseUp]); // Dependencies for cleanup effect

  return (
    // Attach ref and mousedown listener to the stage container
    <div
      ref={stageRef}
      className="relative w-[480px] h-[360px] overflow-hidden shadow-inner select-none" // Added select-none
      onMouseDown={handleMouseDown} // Attach listener here
    >
      {sprites.length > 0 ? (
        sprites.map(sprite => {
          const definition = getSpriteDefinition(sprite.type);
          return (
            <Sprite
              key={sprite.id}
              {...sprite}
              imageSrc={definition?.imageSrc}
              // No need to pass drag handlers down to Sprite anymore
            />
          );
        })
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none"> {/* Added pointer-events-none */}
          Stage is empty. Add a sprite!
        </div>
      )}
    </div>
  );
};

export default Stage;