import CatSpriteUrl from '../assets/cat.svg';
import DogSpriteUrl from '../assets/dog.svg';
import Cat2SpriteUrl from '../assets/cat2.svg';
import ElephantSpriteUrl from '../assets/elephant.svg';
import Dinosaur from '../assets/dinosaur.svg';

export const AVAILABLE_SPRITES = [
  {
    type: 'cat', 
    imageSrc: CatSpriteUrl,
    defaultWidth: 50, 
    defaultHeight: 50,
  },
  {
    type: 'dog',
    name: 'Dog',
    imageSrc: DogSpriteUrl,
    defaultWidth: 50,
    defaultHeight: 50,
  },
  {
    type: 'cat2',
    name: 'Cat2',
    imageSrc: Cat2SpriteUrl,
    defaultWidth: 50,
    defaultHeight: 50,
  },
  {
    type: 'elephant',
    name: 'Elephant',
    imageSrc: ElephantSpriteUrl,
    defaultWidth: 50,
    defaultHeight: 50,
  },
  {
    type: 'dinosaur',
    name: 'Dinosaur',
    imageSrc: Dinosaur,
    defaultWidth: 50,
    defaultHeight: 50,
  },
];

// Helper function to get sprite definition by type
export const getSpriteDefinition = (type) => {
    return AVAILABLE_SPRITES.find(sprite => sprite.type === type);
}