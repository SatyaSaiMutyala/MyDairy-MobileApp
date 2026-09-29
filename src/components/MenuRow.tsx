import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Pill } from './Pill';

export type MenuItem = {
  icon: LucideIcon;
  title: string;
  detail: string;
  count?: number;
};

type Props = {
  item: MenuItem;
  onPress?: () => void;
  danger?: boolean;
};

// A line in a menu: a plain line icon, the name, and where it leads.
export function MenuRow({ item, onPress, danger = false }: Props) {
  const Icon = item.icon;
  const ink = danger ? colors.red : colors.tealDeep;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon size={s(22)} color={ink} strokeWidth={1.6} />
      <View style={styles.text}>
        <AppText variant="body" color={danger ? colors.redInk : colors.ink}>
          {item.title}
        </AppText>
        <AppText variant="meta" color={colors.inkMuted}>
          {item.detail}
        </AppText>
      </View>
      {item.count ? (
        <View style={styles.count}>
          <Pill label={String(item.count)} tone="critical" />
        </View>
      ) : null}
      {danger ? null : (
        <ChevronRight size={s(18)} color={colors.inkFaint} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1 },
  count: { alignSelf: 'center' },
});
