// src/App.js (root component)
import React from 'react';
import { AppProvider } from './context/AppContext';
import AppContainer from './AppContainer';

export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}