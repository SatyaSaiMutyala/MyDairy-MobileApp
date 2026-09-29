import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
};

export function StarRating({ label, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyRegular" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(n => {
          const on = n <= value;
          return (
            <Pressable
              key={n}
              hitSlop={s(4)}
              disabled={!onChange}
              accessibilityLabel={`${label}: ${n} of 5`}
              onPress={() => onChange?.(n === value ? 0 : n)}>
              <Star
                size={s(21)}
                color={on ? colors.amber : colors.line}
                fill={on ? colors.yellow : 'transparent'}
                strokeWidth={1.75}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  label: { flex: 1 },
  stars: { flexDirection: 'row', gap: s(5) },
});
