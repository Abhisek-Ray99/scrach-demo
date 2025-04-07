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
    size = 100, 
    sayMessage = null
}) => {

  // Style calculation remains the same
  const stageWidth = 480;
  const stageHeight = 360;
  const scaleFactor = size / 100;
  const style = {
    position: 'absolute',
    left: `${(stageWidth / 2) + x - (width / 2)}px`,
    top: `${(stageHeight / 2) - y - (height / 2)}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${direction - 90}deg) scale(${scaleFactor})`,
    transformOrigin: 'center center',
    userSelect: 'none', // Prevent text selection during drag
    WebkitUserDrag: 'none', // Prevent default image drag
    cursor: 'grab', // Indicate it's draggable
    zIndex: 10, // Ensure sprite is above stage background
    transition: 'transform 0.05s linear, left 0.05s linear, top 0.05s linear' // Smooth transitions (optional)
  };

  return (
    // Add a specific class name 'sprite-instance'
    <div style={style} data-sprite-id={id} className="sprite-instance relative">
      {/* Render the sprite image */}
      {imageSrc ? (
        <img
          src={imageSrc} alt={type}
          className="w-full h-full object-contain pointer-events-none"
          draggable="false"
        />
      ) : ( <></> )}

      {/* --- Speech Bubble --- */}
      {sayMessage && (
        <div
          className="absolute bottom-full left-1/2 mb-2 transform -translate-x-1/2 px-3 py-1.5 bg-white border border-gray-400 rounded-lg shadow-md text-sm text-black whitespace-nowrap z-20"
          style={{ '--bubble-tail-color': 'white', '--bubble-tail-border-color': '#cbd5e1' }} // For CSS variables
        >
          {sayMessage}
           <div className="speech-bubble-tail"></div> {/* Add class for CSS tail */}
        </div>
      )}
      {/* --- End Speech Bubble --- */}

    </div>
  );
};

export default Sprite;