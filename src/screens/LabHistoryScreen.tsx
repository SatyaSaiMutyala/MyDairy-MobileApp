import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { Eyebrow } from '../components/Eyebrow';
import { FormScreen } from '../components/FormScreen';
import { LabRecordRow } from '../components/LabRecordRow';
import { Notice } from '../components/Notice';
import { ShimmerRows } from '../components/Shimmer';
import { useLabUnit } from '../lab/useLabUnit';
import { errorMessage } from '../store';
import { HistoryRow, Phase, useLabHistoryQuery } from '../store/api/labApi';
import { colors, s, vs } from '../theme';

const PER_PAGE = 20;

export function LabHistoryScreen() {
  const nav = useNavigation<any>();
  const { units } = useLabUnit();
  const [unit, setUnit] = useState('all');
  const [date, setDate] = useState('');
  const [phase, setPhase] = useState<'both' | Phase>('both');
  const [page, setPage] = useState(1);
  // Records from the pages before the current one.
  const [older, setOlder] = useState<{ rows: HistoryRow[]; total: number }>({
    rows: [],
    total: 0,
  });

  const query = useLabHistoryQuery({
    unit: unit === 'all' ? undefined : unit,
    phase: phase === 'both' ? undefined : phase,
    date_from: date || undefined,
    date_to: date || undefined,
    page,
    per_page: PER_PAGE,
  });

  // The answer for exactly these filters and this page. It stays empty until
  // that answer arrives, so "no records" is never shown while still fetching.
  const current = query.currentData;
  const rows = current ? [...older.rows, ...current.data] : older.rows;
  const total = current?.meta.total ?? older.total;
  const more = current ? current.meta.page < current.meta.last_page : false;
  const failed = !current && !!query.error;
  const firstLoad = !current && !failed && older.rows.length === 0;
  const loadingMore = !current && !failed && older.rows.length > 0;

  // New filters start the list again from the first page.
  const restart = () => {
    setPage(1);
    setOlder({ rows: [], total: 0 });
  };
  const unitOptions = [
    { id: 'all', label: 'All units' },
    ...units.map(u => ({ id: u.key, label: u.name })),
  ];

  // Reaching the bottom asks for the next page. The guard stops a second
  // request while one is already on its way.
  const loadMore = () => {
    if (current && more && !query.isFetching) {
      setOlder({ rows, total });
      setPage(p => p + 1);
    }
  };

  return (
    <FormScreen title="History" onEndReached={loadMore}>
      <View style={styles.filters}>
        <Dropdown
          style={styles.filter}
          options={unitOptions}
          value={unit}
          onChange={k => {
            setUnit(k);
            restart();
          }}
        />
        <DateField
          clearable
          placeholder="All dates"
          value={date}
          onChange={d => {
            setDate(d);
            restart();
          }}
          style={styles.filter}
        />
      </View>
      <ChoiceGroup
        value={phase}
        onChange={k => {
          if (k) {
            setPhase(k);
            restart();
          }
        }}
        options={[
          { key: 'both', label: 'Both' },
          { key: 'opening', label: 'Opening' },
          { key: 'closing', label: 'Closing' },
        ]}
      />

      {failed ? (
        <Notice
          tone="error"
          title={errorMessage(query.error)}
          style={styles.notice}
        />
      ) : null}

      <Eyebrow
        label={
          firstLoad || failed
            ? 'Records'
            : `${rows.length} of ${total} ${total === 1 ? 'record' : 'records'}`
        }
      />
      {firstLoad ? (
        <Card>
          <ShimmerRows rows={6} />
        </Card>
      ) : rows.length ? (
        <CardList inset={50}>
          {rows.map(r => (
            <LabRecordRow
              key={r.id}
              record={r}
              onPress={() => nav.navigate('LabRecord', { id: r.id })}
            />
          ))}
        </CardList>
      ) : failed ? null : (
        <EmptyState text="No records match these filters." />
      )}

      {loadingMore ? (
        <Card style={styles.more}>
          <ShimmerRows rows={2} />
        </Card>
      ) : null}
      {current && !more && total > PER_PAGE ? (
        <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
          That is all {total} records.
        </AppText>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: s(10),
    marginTop: vs(6),
    marginBottom: vs(10),
  },
  filter: { flex: 1 },
  notice: { marginTop: vs(12) },
  more: { marginTop: vs(12) },
  end: { textAlign: 'center', marginTop: vs(16) },
});
