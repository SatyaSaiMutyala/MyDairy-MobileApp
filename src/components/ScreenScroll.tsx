import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  ScrollViewInstance,
  ScrollViewProps,
  StyleSheet,
  TextInput,
} from 'react-native';
import { colors, space, vs } from '../theme';
import { onInputFocused } from './KeyboardAvoider';

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
// Room kept between a focused field and the edge of the scroll.
const FIELD_GAP = vs(16);
// Android lays out the keyboard padding after the keyboard event arrives.
const SETTLE_MS = Platform.OS === 'ios' ? 0 : 120;

// Scrolls so the focused field sits inside the visible part of the scroll,
// above the keyboard and any footer. Does nothing when the field belongs to
// another scroll, such as a screen further down the stack.
function revealFocused(scroll: ScrollViewInstance) {
  const input = TextInput.State.currentlyFocusedInput();
  const content = scroll.getInnerViewRef();
  const frame = scroll.getNativeScrollRef();
  if (!input || !content || !frame) {
    return;
  }
  input.measureLayout(
    content,
    (_x, y, _w, height) => {
      frame.measureInWindow((_fx, frameY, _fw, frameHeight) => {
        input.measureInWindow((_ix, inputY) => {
          const toTop = Math.max(0, y - FIELD_GAP);
          if (inputY + height < frameY + FIELD_GAP) {
            // Entirely above the visible part.
            scroll.scrollTo({ y: toTop });
          } else if (inputY + height > frameY + frameHeight - FIELD_GAP) {
            // Bring its bottom up, but never push its top out of view.
            const toBottom = y + height + FIELD_GAP - frameHeight;
            scroll.scrollTo({ y: Math.min(toBottom, toTop) });
          }
        });
      });
    },
    () => {},
  );
}

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

  // Keep the focused field in view when the keyboard opens, and when focus
  // moves to another field while it is open.
  const scroll = useRef<ScrollViewInstance>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (scroll.current && Keyboard.isVisible()) {
          revealFocused(scroll.current);
        }
      }, SETTLE_MS);
    };
    const shown = Keyboard.addListener('keyboardDidShow', reveal);
    const focused = onInputFocused(reveal);
    return () => {
      clearTimeout(timer);
      shown.remove();
      focused.remove();
    };
  }, []);

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
      ref={scroll}
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
