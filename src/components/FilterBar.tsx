import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';

type Props = {
  // How many filters are switched on.
  active: number;
  onClear: () => void;
  children: React.ReactNode;
};

// A "Filters" button that opens a card with the filter fields.
export function FilterBar({ active, onClear, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setOpen(v => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={[styles.button, (open || active > 0) && styles.buttonOn]}>
          <SlidersHorizontal
            size={s(15)}
            color={open || active ? colors.tealDeep : colors.inkSoft}
            strokeWidth={2}
          />
          <AppText
            variant="metaStrong"
            color={open || active ? colors.tealDeep : colors.inkSoft}>
            {active ? `Filters · ${active}` : 'Filters'}
          </AppText>
        </Pressable>
        {active ? (
          <Pressable hitSlop={s(10)} onPress={onClear}>
            <AppText variant="metaStrong" color={colors.teal}>
              Clear all
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {open ? <Card style={styles.card}>{children}</Card> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: vs(12) },
  row: { flexDirection: 'row', alignItems: 'center', gap: s(14) },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    minHeight: vs(32),
    paddingHorizontal: s(12),
    borderRadius: radius.pill,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buttonOn: { backgroundColor: colors.tealTint, borderColor: colors.tealLine },
  card: {
    marginTop: vs(10),
    paddingHorizontal: s(14),
    paddingTop: vs(14),
    paddingBottom: vs(2),
  },
});
