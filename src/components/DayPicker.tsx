import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { dayLetters } from '../utils/recur';
import { colors, fieldGap, hairline, labelGap, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: number[]; // 0 = Monday … 6 = Sunday
  onChange: (days: number[]) => void;
};

const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Pick the days of the week a task repeats on.
export function DayPicker({ label, value, onChange }: Props) {
  const toggle = (day: number) =>
    onChange(
      value.includes(day)
        ? value.filter(d => d !== day)
        : [...value, day].sort(),
    );

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={colors.inkSoft} style={styles.label}>
        {label}
      </AppText>
      <View style={styles.row}>
        {dayLetters.map((letter, day) => {
          const on = value.includes(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggle(day)}
              accessibilityRole="checkbox"
              accessibilityLabel={names[day]}
              accessibilityState={{ checked: on }}
              style={[styles.day, on && styles.on]}>
              <AppText variant="label" color={on ? colors.white : colors.inkSoft}>
                {letter}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: fieldGap },
  label: { marginBottom: labelGap },
  row: { flexDirection: 'row', gap: s(6) },
  day: {
    flex: 1,
    minHeight: vs(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  on: { backgroundColor: colors.teal, borderColor: colors.teal },
});
