import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Search } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FormScreen } from '../components/FormScreen';
import { Stat } from '../components/Stat';
import { TextField } from '../components/TextField';
import { VisitCard, visitCounts } from '../components/VisitCard';
import { visitTypes } from '../data/mock';
import { useVisibleVisits } from '../state/views';
import { colors, hairline, s, vs } from '../theme';

const statuses = [
  { id: 'all', label: 'All status' },
  { id: 'draft', label: 'Draft' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'reviewed', label: 'Reviewed' },
];
const types = [{ id: 'all', label: 'All types' }, ...visitTypes];
const sorts = [
  { id: 'recent', label: 'Most recent' },
  { id: 'oldest', label: 'Oldest first' },
];

export function VisitsScreen() {
  const nav = useNavigation<any>();
  const visits = useVisibleVisits();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');

  const q = query.trim().toLowerCase();
  const found = visits.filter(
    v =>
      (type === 'all' || v.type === type) &&
      (status === 'all' || v.status === status) &&
      (!q || `${v.title} ${v.org} ${v.city} ${v.branch ?? ''}`.toLowerCase().includes(q)),
  );
  const shown = sort === 'recent' ? found : [...found].reverse();

  const total = (pick: (n: ReturnType<typeof visitCounts>) => number) =>
    visits.reduce((sum, v) => sum + pick(visitCounts(v)), 0);
  const ncs = total(n => n.ncs);

  return (
    <FormScreen
      title="Visit observations"
      footer={
        <Button
          label="Log visit observation"
          iconLeft={Plus}
          onPress={() => nav.navigate('VisitForm')}
        />
      }>
      <Card style={styles.summary}>
        <Stat value={visits.length} label="Total visits" style={styles.stat} />
        <View style={styles.rule} />
        <Stat value={total(n => n.openActions)} label="Open actions" style={styles.stat} />
        <View style={styles.rule} />
        <Stat
          value={ncs}
          label="Open NCs"
          tone={ncs ? colors.red : colors.ink}
          style={styles.stat}
        />
      </Card>

      <View style={styles.search}>
        <TextField
          label="Search"
          icon={Search}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          placeholder="Visits, organisations, locations"
        />
      </View>
      <View style={styles.filters}>
        <Dropdown style={styles.filter} options={types} value={type} onChange={setType} />
        <Dropdown style={styles.filter} options={statuses} value={status} onChange={setStatus} />
      </View>
      <Dropdown style={styles.sort} options={sorts} value={sort} onChange={setSort} />

      {shown.length ? (
        shown.map(v => (
          <VisitCard
            key={v.id}
            visit={v}
            onPress={() => nav.navigate('VisitDetail', { id: v.id })}
          />
        ))
      ) : (
        <EmptyState text="No visits match these filters." />
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', marginTop: vs(6) },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
  rule: { width: hairline, backgroundColor: colors.line },
  search: { marginTop: vs(14) },
  filters: { flexDirection: 'row', gap: s(10), marginBottom: vs(10) },
  filter: { flex: 1 },
  sort: { marginBottom: vs(12) },
});
