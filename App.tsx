import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './src/component/buoi 13/AppTabs';
import { initDatabase } from './src/component/buoi 13/database';

export default function App() {
  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
}
