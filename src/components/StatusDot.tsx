import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, Minus } from 'lucide-react-native';
import type { ItemStatus } from '../data/mock';
import { colors, fonts, fs, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = {
  status: ItemStatus;
  // White version for teal surfaces.
  onTeal?: boolean;
};

export function StatusDot({ status, onTeal = false }: Props) {
  if (status === 'open') {
    return (
      <View
        style={[
          styles.dot,
          styles.open,
          onTeal && { borderColor: colors.onTealSoft },
        ]}
      />
    );
  }
  const bg = onTeal
    ? colors.white
    : status === 'done'
    ? colors.teal
    : status === 'deviation'
    ? colors.amber
    : colors.slate;
  const ink = onTeal ? colors.tealDeep : colors.white;
  return (
    <View style={[styles.dot, { backgroundColor: bg }]}>
      {status === 'done' ? (
        <Check size={s(13)} color={ink} strokeWidth={3} />
      ) : status === 'deviation' ? (
        <AppText style={[styles.bang, { color: ink }]}>!</AppText>
      ) : (
        <Minus size={s(13)} color={ink} strokeWidth={3} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: s(22),
    height: s(22),
    marginTop: vs(1),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: {
    borderWidth: ms(1.75, 0.2),
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
  },
  bang: { fontFamily: fonts.bold, fontSize: fs(13), lineHeight: fs(17) },
});
