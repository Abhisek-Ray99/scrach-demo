import React from 'react';
import { X } from 'lucide-react';
import { AVAILABLE_SPRITES } from '../../constants/sprites';

const ChooseSpritePopover = ({ isOpen, onClose, onSelectSpriteType, anchorRef }) => {
  if (!isOpen) return null;

  const handleSelect = (spriteType) => {
    onSelectSpriteType(spriteType);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="absolute z-50 bg-[#171717] rounded-lg shadow-lg"
          style={{
            top: anchorRef?.current?.getBoundingClientRect().bottom + 10 || '50%',
            left: anchorRef?.current?.getBoundingClientRect().left || '50%',
            transform: anchorRef ? 'none' : 'translate(-50%, -50%)'
          }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Choose a Sprite</h2>
              <button 
                className="text-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-1"
                onClick={onClose} 
                aria-label="Close popover"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {AVAILABLE_SPRITES.map((sprite) => (
                <button
                  key={sprite.type}
                  onClick={() => handleSelect(sprite.type)}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-[#17262a] hover:border-[#1374e8] focus:ring-[#1374e8] focus:ring-offset-1 transition-colors duration-150 ease-in-out"
                  title={`Add ${sprite.name}`}
                >
                  <img
                    src={sprite.imageSrc}
                    alt={sprite.name}
                    style={{ width: `${sprite.defaultWidth * 1.2}px`, height: `${sprite.defaultHeight * 1.2}px` }}
                    className="object-contain mb-2"
                    loading="lazy"
                  />
                  <span className="text-sm font-medium text-gray-700">{sprite.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChooseSpritePopover;