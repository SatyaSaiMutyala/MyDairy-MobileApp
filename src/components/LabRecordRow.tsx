import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera, ChevronRight, Moon, Sun } from 'lucide-react-native';
import type { HistoryRow } from '../store/api/labApi';
import { longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconText } from './IconText';
import { Pill } from './Pill';

type Props = { record: HistoryRow; onPress: () => void };

// One past record in the Lab Readiness history list.
export function LabRecordRow({ record, onPress }: Props) {
  const opening = record.phase === 'opening';
  const Icon = opening ? Sun : Moon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon size={s(22)} color={colors.tealDeep} strokeWidth={1.6} />
      <View style={styles.body}>
        <AppText variant="body" numberOfLines={1}>
          {record.unitName}
        </AppText>
        <AppText variant="meta" color={colors.inkMuted}>
          {longDate(record.date)} · {opening ? 'Opening' : 'Closing'}
        </AppText>
        <View style={styles.tags}>
          {record.signed ? (
            <Pill label={`Signed ${record.signedAt}`} tone="signed" />
          ) : (
            <Pill label="Open" tone="watch" />
          )}
          {record.dev ? <Pill label={`${record.dev} deviation`} tone="critical" /> : null}
          {record.reopens ? (
            <Pill label={`Reopened ×${record.reopens}`} tone="escalated" />
          ) : null}
          <IconText icon={Camera} text={String(record.photos)} />
        </View>
        <AppText variant="meta" color={colors.inkMuted} style={styles.by}>
          {record.done} done · {record.na} N/A ·{' '}
          {record.signed
            ? `signed by ${record.signedBy}`
            : `started by ${record.startedBy ?? 'unknown'}`}
        </AppText>
      </View>
      <ChevronRight size={s(19)} color={colors.inkFaint} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1 },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(6),
  },
  by: { marginTop: vs(4) },
});
