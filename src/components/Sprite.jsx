import React, { useEffect, useRef } from 'react';

interface SpriteProps {
  spriteData: any; // Define a more specific type based on your sprite data structure
  animationSpeed?: number;
}

const Sprite: React.FC<SpriteProps> = ({ spriteData, animationSpeed = 100 }) => {
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const totalFrames = spriteData.frames.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % totalFrames);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [totalFrames, animationSpeed]);

  return (
    <img
      ref={spriteRef}
      src={spriteData.frames[currentFrame].image}
      alt="Sprite Animation"
      style={{ width: spriteData.width, height: spriteData.height }}
    />
  );
};

export default Sprite;