import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

// A solid strip behind the clock and battery. Used on screens whose header
// scrolls away, so page content never shows through the status bar.
export function StatusBarShade({ color = colors.teal }: { color?: string }) {
  const { top } = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      style={[styles.shade, { height: top, backgroundColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  shade: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
});
