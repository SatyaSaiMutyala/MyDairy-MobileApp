import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';

export type Segment<K extends string> = {
  key: K;
  label: string;
  icon?: LucideIcon;
  count?: number;
  countColor?: string;
};

type Props<K extends string> = {
  options: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
  // A shorter control, for tight headers.
  compact?: boolean;
  style?: ViewStyle;
};

// Switch used on teal surfaces: the chosen option turns white.
export function SegmentedControl<K extends string>({
  options,
  value,
  onChange,
  compact = false,
  style,
}: Props<K>) {
  return (
    <View style={[styles.track, compact && styles.trackCompact, style]}>
      {options.map(o => {
        const on = o.key === value;
        const ink = on ? colors.tealDeep : colors.white;
        const Icon = o.icon;
        const counted = o.count !== undefined;
        // A compact control keeps the count beside the label, on one line.
        const stacked = counted && !compact;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[
              styles.option,
              stacked ? styles.stacked : styles.inline,
              compact && styles.optionCompact,
              on && styles.on,
            ]}>
            {Icon ? <Icon size={s(16)} color={ink} strokeWidth={1.9} /> : null}
            <AppText
              variant={stacked || compact ? 'metaStrong' : 'label'}
              color={ink}>
              {o.label}
            </AppText>
            {counted ? (
              <AppText
                variant="meta"
                color={
                  on ? o.countColor ?? colors.inkMuted : colors.onTealSoft
                }>
                {o.count}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: s(4),
    padding: s(4),
    borderRadius: radius.md,
    backgroundColor: colors.tealShade,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  inline: { flexDirection: 'row', gap: s(7), minHeight: vs(40) },
  stacked: { minHeight: vs(44) },
  trackCompact: { padding: s(3), gap: s(2), borderRadius: radius.sm + s(2) },
  optionCompact: { minHeight: vs(28), flexDirection: 'row', gap: s(5) },
  on: { backgroundColor: colors.white },
});
