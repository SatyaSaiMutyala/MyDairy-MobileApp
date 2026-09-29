import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = { label: string; value?: string | null };

// Label on the left, value on the right. Hidden when there is no value.
export function InfoRow({ label, value }: Props) {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.row}>
      <AppText variant="meta" color={colors.inkMuted} style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodyRegular" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: s(12), marginBottom: vs(10) },
  label: { width: s(96), paddingTop: vs(2) },
  value: { flex: 1 },
});
