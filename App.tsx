import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { ConfirmProvider } from './src/components/ConfirmDialog';
import { store } from './src/store';

function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ConfirmProvider>
          <RootNavigator />
        </ConfirmProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
