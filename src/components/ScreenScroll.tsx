import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { space, vs } from '../theme';

type Props = ScrollViewProps & {
  // Side padding. Turn off when a full-width header sits inside the scroll.
  padded?: boolean;
  bottomGap?: number;
};

// The scrolling body of a screen, with the standard side and bottom spacing.
export function ScreenScroll({
  padded = true,
  bottomGap = 28,
  contentContainerStyle,
  ...rest
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
      {...rest}
      contentContainerStyle={[
        padded && styles.padded,
        { paddingBottom: vs(bottomGap) },
        contentContainerStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: space.gutter },
});
