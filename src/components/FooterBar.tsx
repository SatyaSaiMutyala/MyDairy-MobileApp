import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, hairline, space, vs } from '../theme';

type Props = {
  children: React.ReactNode;
  // Inside the tab navigator the tab bar already covers the bottom inset.
  inTabs?: boolean;
};

// White strip pinned to the bottom of a screen for its main action.
export function FooterBar({ children, inTabs = false }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: vs(12) + (inTabs ? 0 : insets.bottom) },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: space.gutter,
    paddingTop: vs(12),
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.line,
  },
});
