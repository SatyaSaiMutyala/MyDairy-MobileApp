import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Reopen } from '../store/api/labApi';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';

// "2026-09-30T12:31:05+00:00" -> "30 Sep 2026, 12:31"
const when = (iso: string | null) => {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ReopenLog({ log }: { log: Reopen[] }) {
  if (!log.length) {
    return null;
  }
  return (
    <View style={styles.box}>
      <AppText variant="label" color={colors.amberInk}>
        Reopened {log.length} {log.length === 1 ? 'time' : 'times'}
      </AppText>
      <AppText variant="meta" color={colors.amberInk}>
        Each reopening is itself a deviation.
      </AppText>
      {log.map((r, i) => (
        <View key={i} style={styles.entry}>
          <AppText variant="metaStrong" color={colors.inkSoft}>
            {r.by ?? 'Unknown'} · {when(r.ts)}
          </AppText>
          <AppText variant="meta" color={colors.inkSoft}>
            {r.reason}
          </AppText>
          <AppText variant="meta" color={colors.inkMuted}>
            Was signed by {r.signedBy ?? 'unknown'} at {when(r.signedAt)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: vs(14),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    borderRadius: radius.md,
    backgroundColor: colors.amberTint,
  },
  entry: { marginTop: vs(10) },
});
