// src/constants/blocks.js
export const BLOCK_TYPES = {
    MOTION_MOVE_STEPS: 'MOTION_MOVE_STEPS',
    MOTION_TURN_DEGREES: 'MOTION_TURN_DEGREES',
    MOTION_GOTO_XY: 'MOTION_GOTO_XY',
    CONTROL_REPEAT: 'CONTROL_REPEAT',
    EVENT_FLAG_CLICKED: 'EVENT_FLAG_CLICKED',
  };
  
  export const BLOCK_DEFINITIONS = {
    [BLOCK_TYPES.MOTION_MOVE_STEPS]: { category: 'Motion', label: 'Move {} steps', defaultValues: [10], icon: 'Move' },
    [BLOCK_TYPES.MOTION_TURN_DEGREES]: { category: 'Motion', label: 'Turn {} degrees', defaultValues: [15], icon: 'RotateCw' },
    [BLOCK_TYPES.MOTION_GOTO_XY]: { category: 'Motion', label: 'Go to x:{} y:{}', defaultValues: [0, 0], icon: 'LocateFixed' },
    [BLOCK_TYPES.CONTROL_REPEAT]: { category: 'Controls', label: 'Repeat {} times', defaultValues: [10], isContainer: true, icon: 'Repeat' },
    [BLOCK_TYPES.EVENT_FLAG_CLICKED]: {
      category: 'Events',
      label: 'When Green Flag clicked',
      icon: 'Flag',
      isHatBlock: true,
    },
    // ... other blocks
  };