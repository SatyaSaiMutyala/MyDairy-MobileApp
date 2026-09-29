import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconText } from './IconText';
import { StatusDot } from './StatusDot';

type Props = {
  icon: LucideIcon;
  name: string;
  state: string;
  detail: string;
  signed: boolean;
  onPress?: () => void;
};

// Opening / Closing checklist summary shown on teal.
export function ShiftCard({ icon, name, state, detail, signed, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, signed ? styles.signed : styles.pending]}>
      <View style={styles.head}>
        <IconText
          icon={icon}
          text={name}
          iconSize={15}
          gap={6}
          color={colors.onTealSoft}
          style={styles.name}
        />
        <StatusDot status={signed ? 'done' : 'open'} onTeal />
      </View>
      <AppText variant="heading" color={colors.white}>
        {state}
      </AppText>
      <AppText variant="meta" color={colors.onTealSoft}>
        {detail}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderRadius: radius.lg,
  },
  signed: { backgroundColor: colors.tealDeep },
  pending: {
    borderWidth: ms(1.25, 0.2),
    borderStyle: 'dashed',
    borderColor: colors.tealEdge,
    backgroundColor: colors.tealGlass,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(6) },
  name: { flex: 1 },
});
