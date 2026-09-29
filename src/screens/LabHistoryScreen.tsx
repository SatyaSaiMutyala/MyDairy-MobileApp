import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CardList } from '../components/CardList';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { Eyebrow } from '../components/Eyebrow';
import { FormScreen } from '../components/FormScreen';
import { LabRecordRow } from '../components/LabRecordRow';
import { unitOptions } from '../data/labReadiness';
import { useLab } from '../state/LabStore';
import { s, vs } from '../theme';

const allUnits = [{ id: 'all', label: 'All units' }, ...unitOptions];

export function LabHistoryScreen() {
  const nav = useNavigation<any>();
  const { records } = useLab();
  const [unit, setUnit] = useState('all');
  const [date, setDate] = useState('');
  const [phase, setPhase] = useState<'both' | 'opening' | 'closing'>('both');

  const rows = useMemo(
    () =>
      Object.values(records)
        .filter(
          r =>
            (unit === 'all' || r.unitId === unit) &&
            (!date || r.date === date) &&
            (phase === 'both' || r.phase === phase),
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || a.unitId.localeCompare(b.unitId),
        ),
    [records, unit, date, phase],
  );

  return (
    <FormScreen title="History">
      <View style={styles.filters}>
        <Dropdown style={styles.filter} options={allUnits} value={unit} onChange={setUnit} />
        <DateField
          clearable
          placeholder="All dates"
          value={date}
          onChange={setDate}
          style={styles.filter}
        />
      </View>
      <ChoiceGroup
        value={phase}
        onChange={k => k && setPhase(k)}
        options={[
          { key: 'both', label: 'Both' },
          { key: 'opening', label: 'Opening' },
          { key: 'closing', label: 'Closing' },
        ]}
      />

      <Eyebrow label={`${rows.length} ${rows.length === 1 ? 'record' : 'records'}`} />
      {rows.length ? (
        <CardList inset={66}>
          {rows.map(r => (
            <LabRecordRow
              key={`${r.unitId}|${r.date}|${r.phase}`}
              record={r}
              onPress={() =>
                nav.navigate('LabRecord', {
                  unitId: r.unitId,
                  date: r.date,
                  phase: r.phase,
                })
              }
            />
          ))}
        </CardList>
      ) : (
        <EmptyState text="No records match these filters." />
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: s(10), marginTop: vs(6), marginBottom: vs(10) },
  filter: { flex: 1 },
});
