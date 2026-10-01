import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, s, vs } from '../theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  round?: boolean;
  // For placeholders that sit on a teal header.
  onTeal?: boolean;
  style?: ViewStyle;
};

// A grey placeholder block with a soft light sweeping across it. Shown in
// place of content while it is being fetched.
export function Shimmer({
  width = '100%',
  height = vs(12),
  round = false,
  onTeal = false,
  style,
}: Props) {
  const sweep = useRef(new Animated.Value(0)).current;
  const [span, setSpan] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const onLayout = (e: LayoutChangeEvent) =>
    setSpan(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.block,
        { width, height, borderRadius: round ? radius.pill : radius.xs },
        onTeal && styles.onTeal,
        style,
      ]}
    >
      {span ? (
        <Animated.View
          style={[
            styles.light,
            onTeal && styles.lightOnTeal,
            {
              width: span * 0.45,
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-span * 0.5, span],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

type RowsProps = {
  rows?: number;
  // Leaves room for a leading icon, to match rows that have one.
  icon?: boolean;
  // 2 for short rows (a name and one line under it), 4 for full list rows.
  lines?: 2 | 4;
};

// Placeholder list rows: an icon spot and three lines of text each.
export function ShimmerRows({ rows = 5, icon = true, lines = 4 }: RowsProps) {
  return (
    <View>
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          style={[
            styles.row,
            lines === 2 && styles.short,
            i > 0 && styles.rule,
          ]}
        >
          {icon ? <Shimmer width={s(24)} height={s(24)} round /> : null}
          <View style={styles.lines}>
            <Shimmer width="62%" height={vs(13)} />
            <Shimmer width="44%" height={vs(10)} style={styles.gap} />
            {lines === 4 ? (
              <>
                <View style={styles.tags}>
                  <Shimmer width={s(70)} height={vs(16)} />
                  <Shimmer width={s(48)} height={vs(16)} />
                </View>
                <Shimmer width="78%" height={vs(10)} style={styles.gap} />
              </>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.fill, overflow: 'hidden' },
  onTeal: { backgroundColor: 'rgba(255,255,255,0.16)' },
  lightOnTeal: { opacity: 0.22 },
  light: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(14),
  },
  short: { paddingVertical: vs(10) },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  lines: { flex: 1 },
  gap: { marginTop: vs(7) },
  tags: { flexDirection: 'row', gap: s(6), marginTop: vs(8) },
});
