import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar, FilterButton } from '../components/FilterBar';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { VisitCard } from '../components/VisitCard';
import { errorMessage } from '../store';
import {
  VisitFilters,
  VisitStatus,
  VISITS_PER_PAGE,
  useVisitsInfiniteQuery,
} from '../store/api/visitsApi';
import { pagesOf } from '../store/pages';
import { useDebounced } from '../utils/useDebounced';
import { toVisit, visitTypes } from '../visits/model';
import { colors, hairline, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

const statuses = [
  { id: 'all', label: 'All status' },
  { id: 'draft', label: 'Draft' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'reviewed', label: 'Reviewed' },
];
const types = [{ id: 'all', label: 'All types' }, ...visitTypes];
const sorts = [
  { id: 'recent', label: 'Most recent first' },
  { id: 'oldest', label: 'Oldest first' },
];

const blank = { type: 'all', status: 'all', from: '', to: '', sort: 'recent' };

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Visits'] as const;

export function VisitsScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  const active = Object.entries(f).filter(
    ([k, v]) => v !== blank[k as keyof typeof blank],
  ).length;

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<VisitFilters>(
    () => ({
      ...(term ? { search: term } : null),
      ...(f.type !== 'all' ? { type: f.type } : null),
      ...(f.status !== 'all' ? { status: f.status as VisitStatus } : null),
      ...(f.from ? { date_from: f.from } : null),
      ...(f.to ? { date_to: f.to } : null),
      ...(f.sort !== 'recent' ? { sort: 'oldest' as const } : null),
    }),
    [term, f],
  );
  const query = useVisitsInfiniteQuery(filters);
  const list = pagesOf(query);
  const visits = useMemo(() => list.rows.map(toVisit), [list.rows]);
  const counts = query.currentData?.pages[0]?.counts;
  const filtering = active > 0 || !!term;

  return (
    <FormScreen
      title="Visit observations"
      onRefresh={fresh}
      onEndReached={list.loadMore}
      footer={
        <Button
          label="Log visit observation"
          iconLeft={Plus}
          onPress={() => nav.navigate('VisitForm')}
        />
      }
    >
      <Card style={styles.summary}>
        <Stat
          value={counts?.total ?? '–'}
          label="Total visits"
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.openActions ?? '–'}
          label="Open actions"
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.ncs ?? '–'}
          label="Open NCs"
          tone={counts?.ncs ? colors.red : colors.ink}
          style={styles.stat}
        />
      </Card>

      <View style={styles.tools}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Visits, organisations, locations"
          style={styles.search}
        />
        <FilterButton
          active={active}
          open={filtersOpen}
          onPress={() => setFiltersOpen(true)}
        />
      </View>
      <FilterBar
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        active={active}
        onClear={() => setF(blank)}
        doneLabel="Show visits"
      >
        <Dropdown
          label="Visit type"
          options={types}
          value={f.type}
          onChange={type => set({ type })}
        />
        <Dropdown
          label="Status"
          options={statuses}
          value={f.status}
          onChange={status => set({ status })}
        />
        <DateField
          clearable
          label="Visited from"
          placeholder="Any date"
          value={f.from}
          onChange={from => set({ from })}
        />
        <DateField
          clearable
          label="Visited until"
          placeholder="Any date"
          value={f.to}
          onChange={to => set({ to })}
        />
        <Dropdown
          label="Order"
          options={sorts}
          value={f.sort}
          onChange={sort => set({ sort })}
        />
      </FilterBar>

      <View style={styles.list}>
        {list.failed ? (
          <Notice tone="error" title={errorMessage(list.error)} />
        ) : list.firstLoad ? (
          <Card>
            <ShimmerRows rows={4} icon={false} />
          </Card>
        ) : visits.length ? (
          visits.map(v => (
            <VisitCard
              key={v.id}
              visit={v}
              onPress={() => nav.navigate('VisitDetail', { id: v.id })}
            />
          ))
        ) : (
          <EmptyState
            text={
              filtering ? 'No visits match.' : 'No visits have been logged yet.'
            }
          />
        )}
        {list.loadingMore ? (
          <Card>
            <ShimmerRows rows={2} icon={false} />
          </Card>
        ) : null}
        {visits.length && !list.hasMore && list.total > VISITS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} visits.
          </AppText>
        ) : null}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', marginTop: vs(6) },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
  rule: { width: hairline, backgroundColor: colors.line },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginTop: vs(10),
  },
  search: { flex: 1 },
  list: { marginTop: vs(12) },
  end: { textAlign: 'center', marginTop: vs(8) },
});
