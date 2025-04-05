import React from 'react';

/**
 * Sprite Component
 * Renders a single sprite on the stage using an img tag.
 * Now includes a class name for drag detection by the parent Stage.
 */
const Sprite = ({
    id,
    x,
    y,
    direction,
    width,
    height,
    type,
    imageSrc,
}) => {

  // Style calculation remains the same
  const stageWidth = 480;
  const stageHeight = 360;
  const style = {
    position: 'absolute',
    left: `${(stageWidth / 2) + x - (width / 2)}px`,
    top: `${(stageHeight / 2) - y - (height / 2)}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${direction - 90}deg)`,
    transformOrigin: 'center center',
    userSelect: 'none', // Prevent text selection during drag
    WebkitUserDrag: 'none', // Prevent default image drag
    cursor: 'grab', // Indicate it's draggable
    // Add transition for smoother updates when NOT actively dragging (optional)
    // transition: 'left 0.05s linear, top 0.05s linear',
  };

  return (
    // Add a specific class name 'sprite-instance'
    <div
        style={style}
        data-sprite-id={id} // Keep data attribute to identify the sprite
        className="sprite-instance" // Class for event delegation target finding
        // Remove draggable="false" if you added it, mouse events handle it
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={type}
          className="w-full h-full object-contain pointer-events-none" // Add pointer-events-none to img
          draggable="false" // Explicitly prevent img drag
        />
      ) : (
        <div className="w-full h-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 text-xs pointer-events-none">?</div>
      )}
    </div>
  );
};

export default Sprite;