import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Kpi } from '../data/mock';
import type { KpiEntry } from '../state/Store';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { ChoiceGroup } from './ChoiceGroup';
import { Pill, PillTone } from './Pill';
import { TextField } from './TextField';

type Props = {
  kpi: Kpi;
  entry: KpiEntry | undefined;
  locked: boolean;
  onChange: (entry: KpiEntry) => void;
};

const importance: Record<Kpi['importance'], { label: string; tone: PillTone }> = {
  critical: { label: 'Critical', tone: 'critical' },
  high: { label: 'High', tone: 'high' },
  medium: { label: 'Medium', tone: 'medium' },
  low: { label: 'Low', tone: 'low' },
};

// One KPI line in the daily report: actual value and how it is doing.
export function KpiRow({ kpi, entry, locked, onChange }: Props) {
  const value = entry?.value ?? '';
  const status = entry?.status ?? 'good';
  const imp = importance[kpi.importance];

  return (
    <View style={styles.row}>
      <AppText variant="body">{kpi.name}</AppText>
      <View style={styles.meta}>
        <Pill label={imp.label} tone={imp.tone} />
        <AppText variant="meta" color={colors.inkMuted}>
          {kpi.frequency}
          {kpi.dueOn ? ` · due ${kpi.dueOn}` : ''}
        </AppText>
        {kpi.target ? (
          <AppText variant="meta" color={colors.inkMuted}>
            Target: {kpi.target}
          </AppText>
        ) : null}
      </View>

      <TextField
        label="Actual"
        editable={!locked}
        value={value}
        onChangeText={v => onChange({ value: v, status })}
        maxLength={120}
        placeholder="Enter actual…"
      />
      {kpi.last && !value && !locked ? (
        <Pressable
          hitSlop={s(8)}
          onPress={() => onChange({ value: kpi.last!, status })}
          style={styles.last}>
          <AppText variant="metaStrong" color={colors.teal}>
            Use last value · {kpi.last}
          </AppText>
        </Pressable>
      ) : null}

      <ChoiceGroup
        disabled={locked}
        value={status}
        onChange={k => k && onChange({ value, status: k })}
        options={[
          { key: 'good', label: 'On target', tone: 'green' },
          { key: 'amber', label: 'Watch', tone: 'amber' },
          { key: 'red', label: 'Action', tone: 'red' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: s(14), paddingVertical: vs(14) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: s(9),
    rowGap: vs(4),
    marginTop: vs(6),
    marginBottom: vs(10),
  },
  last: { marginTop: -vs(8), marginBottom: vs(10) },
});
