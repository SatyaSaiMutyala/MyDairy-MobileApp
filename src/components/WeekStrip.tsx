import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { dayName, dayNumber, TODAY_ISO, weekOf } from '../utils/dates';
import { colors, fonts, fs, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Dot } from './Dot';

type Props = {
  selected: string;
  onSelect: (iso: string) => void;
  // Days that have something on them.
  busy: Set<string>;
  style?: ViewStyle;
};

// The seven days of the selected week, shown on teal.
export function WeekStrip({ selected, onSelect, busy, style }: Props) {
  return (
    <View style={[styles.week, style]}>
      {weekOf(selected).map(iso => {
        const on = iso === selected;
        const today = iso === TODAY_ISO;
        return (
          <Pressable
            key={iso}
            onPress={() => onSelect(iso)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.day, on && styles.on, today && !on && styles.today]}>
            <AppText variant="meta" color={on ? colors.inkMuted : colors.onTealSoft}>
              {dayName(iso)}
            </AppText>
            <AppText style={[styles.num, { color: on ? colors.tealDeep : colors.white }]}>
              {dayNumber(iso)}
            </AppText>
            <Dot
              size={5}
              style={styles.dot}
              color={
                busy.has(iso) ? (on ? colors.teal : colors.yellow) : 'transparent'
              }
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', gap: s(2) },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(4),
    borderRadius: radius.sm + s(2),
  },
  on: { backgroundColor: colors.white },
  today: { backgroundColor: colors.tealShade },
  num: { fontFamily: fonts.semibold, fontSize: fs(15), lineHeight: fs(20) },
  dot: { marginTop: vs(1) },
});
