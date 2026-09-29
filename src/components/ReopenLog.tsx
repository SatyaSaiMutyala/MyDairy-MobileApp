import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Reopen } from '../state/LabStore';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';

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
            {r.by} · {r.at}
          </AppText>
          <AppText variant="meta" color={colors.inkSoft}>
            {r.reason}
          </AppText>
          <AppText variant="meta" color={colors.inkMuted}>
            Was signed by {r.signedBy} at {r.signedAt}
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
