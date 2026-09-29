import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = { text: string; ok: boolean; note?: string };

// A read-only line: ticked or missed.
export function CheckLine({ text, ok, note }: Props) {
  const Icon = ok ? Check : X;
  return (
    <View style={styles.row}>
      <Icon
        size={s(15)}
        color={ok ? colors.green : colors.red}
        strokeWidth={2.75}
        style={styles.icon}
      />
      <View style={styles.text}>
        <AppText variant="meta" color={ok ? colors.inkSoft : colors.redInk}>
          {text}
        </AppText>
        {note ? (
          <AppText variant="meta" color={colors.inkFaint}>
            {note}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: s(8), marginTop: vs(6) },
  icon: { marginTop: vs(2) },
  text: { flex: 1 },
});
