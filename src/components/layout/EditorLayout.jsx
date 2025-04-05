// src/components/layout/EditorLayout.jsx
import React, { useContext } from "react"; // Make sure useContext is imported
import { Play, Pause, Flag, Square } from "lucide-react";
import Sidebar from "./Sidebar";
import Stage from "./Stage";
import ScriptArea from "../editor/ScriptArea";
import SpriteList from "../sprites/SpriteList";
import { AppContext } from "../../contexts/AppContext";
import { useSpriteAnimation } from "../../hooks/useSpriteAnimation"; // <-- Import the hook

const EditorLayout = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isRunning, sprites } = state; // Get sprites state as well

  console.log(state, "EditorLayout state"); // Log the state for debugging

  // --- Activate the Animation Hook ---
  // Pass the necessary state and dispatch function to the hook
  useSpriteAnimation(isRunning, sprites, dispatch);
  // --- Hook is now active and will respond to isRunning changes ---

  const handleGreenFlagClick = () => {
    console.log("Green Flag Clicked - Dispatching START_ANIMATION");
    // Reset sprite state (position, pointer) before starting? Optional.
    // dispatch({ type: 'RESET_ANIMATION_STATE' }); // You'd need to implement this action
    dispatch({ type: "START_ANIMATION" });
  };

  const handleStopClick = () => {
    console.log("Stop Sign Clicked - Dispatching STOP_ANIMATION");
    dispatch({ type: "STOP_ANIMATION" });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 shadow-md z-10 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 h-full">
        {/* Scripting Area */}
        <div className="flex-1 h-full border-l border-r border-[#292929] overflow-y-auto">
          <ScriptArea />
        </div>

        {/* Stage and Controls */}
        <div className="w-[580px] flex-shrink-0 flex flex-col items-center h-full overflow-y-auto">
          {/* Global Controls */}
          <div className="flex space-x-3 items-center border-b border-[#292929] w-full justify-center p-2">
            <button
              onClick={handleGreenFlagClick}
              title="Start (Green Flag)"
              className="bg-gradient-to-r from-[#2A5A1C] to-[#4C7E44] text-white rounded-xl shadow-md hover:brightness-110 transition-all px-4 py-2 flex items-center space-x-2 cursor-pointer"
            >
              <Flag size={18} />
              <span className="text-base font-bold">Run</span>
            </button>
            <button onClick={handleStopClick} title="Stop All" className="bg-gradient-to-r from-[#202329] to-[#383940] text-white rounded-xl shadow-md hover:brightness-110 transition-all px-4 py-2 flex items-center space-x-2 cursor-pointer">
              <Square size={18} fill="currentColor" />
              <span>Stop</span>
            </button>
          </div>
          {/* Stage */}
          <Stage />
          {/* Sprite List */}
          <div className="mt-4 w-full border-t pt-2 border-[#292929]">
            <h3 className="text-left text-sm font-semibold mb-2 text-white px-2">
              Sprites
            </h3>
            <SpriteList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
