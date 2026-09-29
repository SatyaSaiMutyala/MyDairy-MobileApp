import React from 'react';
import { StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

// Tab screens stay mounted, so only the visible one may set the status bar.
export function FocusStatusBar({ tone }: { tone: 'light' | 'dark' }) {
  const focused = useIsFocused();
  return focused ? (
    <StatusBar barStyle={tone === 'light' ? 'light-content' : 'dark-content'} />
  ) : null;
}
