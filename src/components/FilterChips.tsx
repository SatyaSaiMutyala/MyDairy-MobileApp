import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, hairline, radius, s, space, vs } from '../theme';
import { AppText } from './AppText';

export type Chip<K extends string> = {
  key: K;
  label: string;
  count?: number;
  alert?: boolean;
};

type Props<K extends string> = {
  options: Chip<K>[];
  value: K;
  onChange: (key: K) => void;
};

// A row of filter chips that scrolls sideways.
export function FilterChips<K extends string>({ options, value, onChange }: Props<K>) {
  return (
    <ScrollView
      horizontal
      bounces={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {options.map(o => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on && styles.on]}>
            <AppText variant="metaStrong" color={on ? colors.white : colors.inkSoft}>
              {o.label}
            </AppText>
            {o.count !== undefined ? (
              <AppText
                variant="meta"
                color={
                  on
                    ? colors.onTealSoft
                    : o.alert && o.count
                    ? colors.redInk
                    : colors.inkMuted
                }>
                {o.count}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginHorizontal: -space.gutter },
  row: { gap: s(8), paddingHorizontal: space.gutter },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    minHeight: vs(32),
    paddingHorizontal: s(14),
    borderRadius: radius.pill,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  on: { backgroundColor: colors.teal, borderColor: colors.teal },
});
