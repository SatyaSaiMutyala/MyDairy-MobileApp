import React from 'react';
import { StyleSheet, View } from 'react-native';
import { taskFrequencies } from '../data/mock';
import { shortDate, TODAY_ISO } from '../utils/dates';
import {
  dayOfMonthOptions,
  describe,
  monthOptions,
  occurrenceFrom,
  Recurring,
} from '../utils/recur';
import { s, vs } from '../theme';
import { DateField } from './DateField';
import { DayPicker } from './DayPicker';
import { Dropdown } from './Dropdown';
import { Notice } from './Notice';
import { TimeField } from './TimeField';

type Props = {
  value: Recurring;
  onChange: (value: Recurring) => void;
};

// How often a recurring task repeats. The fields change with the frequency.
export function RepeatFields({ value, onChange }: Props) {
  const set = (change: Partial<Recurring>) => onChange({ ...value, ...change });
  const weekly = value.freq === 'weekly' || value.freq === 'biweekly';
  const byMonthDay =
    value.freq === 'monthly' || value.freq === 'quarterly' || value.freq === 'annual';
  const needsMonth = value.freq === 'quarterly' || value.freq === 'annual';
  const next = occurrenceFrom(value, TODAY_ISO);

  return (
    <View>
      <Dropdown
        label="Frequency"
        options={taskFrequencies}
        value={value.freq}
        onChange={freq => set({ freq: freq as Recurring['freq'] })}
      />
      {weekly ? (
        <DayPicker
          label="Repeat on"
          value={value.days ?? []}
          onChange={days => set({ days })}
        />
      ) : null}
      {needsMonth ? (
        <Dropdown
          label={value.freq === 'annual' ? 'Month' : 'Starting month'}
          options={monthOptions}
          value={String(value.month ?? 1)}
          onChange={m => set({ month: Number(m) })}
        />
      ) : null}
      {byMonthDay ? (
        <Dropdown
          label="Day of month"
          options={dayOfMonthOptions}
          value={value.dayOfMonth ?? '1'}
          onChange={dayOfMonth => set({ dayOfMonth })}
        />
      ) : null}
      <View style={styles.pair}>
        <TimeField
          label="Time of day"
          placeholder="Any time"
          value={value.time ?? ''}
          onChange={time => set({ time: time || undefined })}
          style={styles.half}
        />
        <DateField
          clearable
          label="End date (optional)"
          placeholder="No end"
          value={value.endDate ?? ''}
          onChange={endDate => set({ endDate: endDate || undefined })}
          style={styles.half}
        />
      </View>
      <Notice
        tone={next ? 'info' : 'error'}
        title={describe(value)}
        text={
          next
            ? `First occurrence: ${next === TODAY_ISO ? 'today' : shortDate(next)}`
            : 'No occurrence falls before the end date.'
        }
        style={styles.notice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  notice: { marginBottom: vs(14) },
});
