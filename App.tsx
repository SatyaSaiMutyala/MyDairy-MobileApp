import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { LabProvider } from './src/state/LabStore';
import { SessionProvider } from './src/state/Session';
import { StoreProvider } from './src/state/Store';

function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StoreProvider>
          <LabProvider>
            <RootNavigator />
          </LabProvider>
        </StoreProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

export default App;
