// src/components/layout/Sidebar.js

import React from 'react';
import BlockPalette from '../editor/BlockPalette'; // Adjust the import path based on your structure

/**
 * Sidebar Component
 *
 * Renders the content within the sidebar area defined by EditorLayout.
 * Primarily responsible for displaying the BlockPalette.
 */
const Sidebar = () => {
  // The outer container styling (width, height, background, overflow, shadow)
  // is applied by the parent component (EditorLayout).
  // This component simply renders the content that goes inside the sidebar.

  return (
    // Using React.Fragment as we don't need an extra wrapping div here.
    // The BlockPalette itself will likely have its own root element.
    <React.Fragment>
      <BlockPalette />
    </React.Fragment>
  );
};

export default Sidebar;