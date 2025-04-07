// src/constants/blocks.js
export const BLOCK_TYPES = {
  MOTION_MOVE_STEPS: "MOTION_MOVE_STEPS",
  MOTION_TURN_DEGREES: "MOTION_TURN_DEGREES",
  MOTION_TURN_DEGREES_ANTI_CLOCK: "MOTION_TURN_DEGREES_ANTI_CLOCK",
  MOTION_GOTO_XY: "MOTION_GOTO_XY",
  // Looks <-- NEW CATEGORY
  LOOKS_SAY: "LOOKS_SAY",
  LOOKS_CHANGE_SIZE_BY: "LOOKS_CHANGE_SIZE_BY",
  CONTROL_REPEAT: "CONTROL_REPEAT",
  EVENT_FLAG_CLICKED: "EVENT_FLAG_CLICKED",
};

export const BLOCK_DEFINITIONS = {
  [BLOCK_TYPES.MOTION_MOVE_STEPS]: {
    category: "Motion",
    label: "Move {} steps",
    defaultValues: [10],
    icon: "Move",
  },
  [BLOCK_TYPES.MOTION_TURN_DEGREES]: {
    category: "Motion",
    label: "Turn {} degrees",
    defaultValues: [15],
    icon: "RotateCw",
  },
  [BLOCK_TYPES.MOTION_TURN_DEGREES_ANTI_CLOCK]: {
    category: "Motion",
    label: "Turn {} degrees anti-clockwise",
    defaultValues: [15],
    icon: "RotateCcw",
  },
  [BLOCK_TYPES.MOTION_GOTO_XY]: {
    category: "Motion",
    label: "Go to x:{} y:{}",
    defaultValues: [0, 0],
    icon: "LocateFixed",
  },
  [BLOCK_TYPES.LOOKS_SAY]: {
    category: "Looks",
    label: "Say {}", // Simple label
    defaultValues: ["Hello!"], // Default message
    icon: "MessageSquare", // Icon for speech
  },
  [BLOCK_TYPES.LOOKS_CHANGE_SIZE_BY]: {
    category: "Looks",
    label: "Change size by {}",
    defaultValues: [10], // Default size change
    icon: "ZoomIn", // Icon for size change
  },
  [BLOCK_TYPES.CONTROL_REPEAT]: {
    category: "Controls",
    label: "Repeat {} times",
    defaultValues: [10],
    isContainer: true,
    icon: "Repeat",
  },
  [BLOCK_TYPES.EVENT_FLAG_CLICKED]: {
    category: "Events",
    label: "When Green Flag clicked",
    icon: "Flag",
    isHatBlock: true,
  },
  // ... other blocks
};
