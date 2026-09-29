import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera, ChevronRight, Moon, Sun } from 'lucide-react-native';
import { dateLabel, units } from '../data/labReadiness';
import { LabRecord, summarise } from '../state/LabStore';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconText } from './IconText';
import { IconTile } from './IconTile';
import { Pill } from './Pill';

type Props = { record: LabRecord; onPress: () => void };

// One past record in the Lab Readiness history list.
export function LabRecordRow({ record, onPress }: Props) {
  const totals = summarise(record.phase, record);
  const unit = units.find(u => u.id === record.unitId);
  const opening = record.phase === 'opening';
  const Icon = opening ? Sun : Moon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <IconTile size={40} bg={opening ? colors.amberTint : colors.blueTint}>
        <Icon
          size={s(19)}
          color={opening ? colors.amberInk : colors.blueInk}
          strokeWidth={1.75}
        />
      </IconTile>
      <View style={styles.body}>
        <AppText variant="body" numberOfLines={1}>
          {unit?.name}
        </AppText>
        <AppText variant="meta" color={colors.inkMuted}>
          {dateLabel(record.date)} · {opening ? 'Opening' : 'Closing'}
        </AppText>
        <View style={styles.tags}>
          {record.signed ? (
            <Pill label={`Signed ${record.signed.at}`} tone="signed" />
          ) : (
            <Pill label="Open" tone="watch" />
          )}
          {totals.chosen.deviation ? (
            <Pill label={`${totals.chosen.deviation} deviation`} tone="critical" />
          ) : null}
          {record.reopenLog.length ? (
            <Pill label={`Reopened ×${record.reopenLog.length}`} tone="escalated" />
          ) : null}
          <IconText icon={Camera} text={String(totals.photos)} />
        </View>
        <AppText variant="meta" color={colors.inkMuted} style={styles.by}>
          {totals.chosen.done} done · {totals.chosen.na} N/A ·{' '}
          {record.signed ? `signed by ${record.signed.by}` : `started by ${record.startedBy}`}
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
