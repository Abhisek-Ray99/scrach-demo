// src/components/sprites/SpriteList.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { PlusCircle, Trash2 } from 'lucide-react'; // Removed Cat icon import
import ChooseSpriteModal from '../modals/ChooseSpriteModal';
import { getSpriteDefinition } from '../../constants/sprites';

const SpriteList = () => {
  const { state, dispatch } = useContext(AppContext);
  const { sprites, selectedSpriteId } = state;
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);

  const handleSelectSprite = (spriteId) => {
    dispatch({ type: 'SELECT_SPRITE', payload: { spriteId } });
  };

  const handleOpenModal = () => {
    setIsChooseModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsChooseModalOpen(false);
  };

  // Called when a sprite type is selected in the modal
  const handleAddSpriteType = (spriteType) => {
    // console.log(`Adding sprite of type: ${spriteType}`);
    dispatch({ type: 'ADD_SPRITE', payload: { spriteType } });
    // Modal is closed automatically by the modal component after selection
  };

  const handleDeleteSprite = (e, spriteId) => {
    e.stopPropagation(); // Prevent the click from also selecting the sprite
    // Optional: Add confirmation dialog here
    console.log(`Requesting removal of sprite: ${spriteId}`);
    dispatch({ type: 'REMOVE_SPRITE', payload: { spriteIdToRemove: spriteId } });
  };

  return (
    <div className="p-2">
      <div className="flex items-end space-x-2 overflow-x-auto pb-2 min-h-[96px]">
        {sprites.map((sprite) => {
          const definition = getSpriteDefinition(sprite.type); // Get definition

          return (
            <div key={sprite.id} className="relative flex-shrink-0">
              <button
                onClick={() => handleSelectSprite(sprite.id)}
                className={` /* ... button styling ... */
                  bg-[#171717] px-5 py-3 rounded-xl shadow-md border border-[#2E2D2E] hover:brightness-110 transition-all flex flex-col items-center justify-center ${selectedSpriteId === sprite.id ? '' : ''}
                `}
                title={`Select ${sprite.id}`}
              >
                {/* --- Render Thumbnail using img --- */}
                {definition?.imageSrc ? (
                  <img
                    src={definition.imageSrc}
                    alt={definition.name}
                    className="w-8 h-8 object-contain mb-1" // Adjust size as needed for thumbnail
                    loading="lazy"
                  />
                ) : (
                  <div className="w-8 h-8 mb-1 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded">?</div> // Fallback if no image
                )}
                {/* --- End Thumbnail --- */}
                <span className={`text-xs font-medium truncate w-full text-center ${selectedSpriteId === sprite.id ? 'text-blue-800' : 'text-gray-700'}`}>
                  {sprite.id}
                </span>
              </button>
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteSprite(e, sprite.id)}
                className="absolute -top-1 -right-1 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-colors"
                title={`Delete ${sprite.id}`} aria-label={`Delete ${sprite.id}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {/* Add Sprite Button */}
        <button onClick={handleOpenModal} /* ... styling ... */ title="Add new sprite" className='bg-[#171717] px-6 py-4 rounded-xl shadow-md border border-[#2E2D2E] hover:brightness-110 transition-all flex flex-col items-center justify-center'>
          <PlusCircle size={24} />
          <span className="mt-1 text-xs font-medium">Add</span>
        </button>
      </div>

      {/* Render the Modal */}
      <ChooseSpriteModal
        isOpen={isChooseModalOpen}
        onClose={handleCloseModal}
        onSelectSpriteType={handleAddSpriteType}
      />
    </div>
  );
};

export default SpriteList;