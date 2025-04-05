import React, { useReducer } from 'react';
import { AppContext, appReducer, initialState } from './AppContext'; // Adjust path if needed

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};