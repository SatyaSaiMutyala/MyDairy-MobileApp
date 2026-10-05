import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';
import { colors, space, vs } from '../theme';

type Props = ScrollViewProps & {
  // Side padding. Turn off when a full-width header sits inside the scroll.
  padded?: boolean;
  bottomGap?: number;
  // Called when the person scrolls close to the bottom. Used to fetch the
  // next page of a list.
  onEndReached?: () => void;
  // Pull down to fetch again. Resolves when the fresh data has arrived.
  onRefresh?: () => Promise<unknown> | void;
};

// How close to the bottom counts as "the end".
const END_ZONE = vs(160);

// The scrolling body of a screen, with the standard side and bottom spacing.
export function ScreenScroll({
  padded = true,
  bottomGap = 28,
  contentContainerStyle,
  onEndReached,
  onRefresh,
  onScroll,
  ...rest
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const pulled = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };
  const scrolled = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll?.(e);
    if (onEndReached) {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      if (
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - END_ZONE
      ) {
        onEndReached();
      }
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      alwaysBounceVertical={false}
      overScrollMode="never"
      scrollEventThrottle={onEndReached ? 120 : undefined}
      onScroll={onEndReached || onScroll ? scrolled : undefined}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pulled}
            tintColor={colors.teal}
            colors={[colors.teal]}
          />
        ) : undefined
      }
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
