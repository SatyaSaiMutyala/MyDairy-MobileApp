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
import { FilterChips } from '../components/FilterChips';
import { FormScreen } from '../components/FormScreen';
import { MeetingRow } from '../components/MeetingRow';
import { Notice } from '../components/Notice';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { errorMessage } from '../store';
import {
  MeetingFilters,
  MeetingStatus,
  MEETINGS_PER_PAGE,
  useMeetingMetaQuery,
  useMeetingsInfiniteQuery,
} from '../store/api/meetingsApi';
import { pagesOf } from '../store/pages';
import { useFresh } from '../store/useFresh';
import { useDebounced } from '../utils/useDebounced';
import { colors, hairline, s, vs } from '../theme';

type View3 = 'upcoming' | 'past' | 'all';

const FRESH = ['Meetings'] as const;
const blank = { type: 'all', status: 'all', from: '', to: '' };

export function MeetingsScreen() {
  const nav = useNavigation<any>();
  const fresh = useFresh(FRESH);
  const [view, setView] = useState<View3>('upcoming');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  const active = Object.entries(f).filter(
    ([k, v]) => v !== blank[k as keyof typeof blank],
  ).length;

  const meta = useMeetingMetaQuery().data;
  const types = useMemo(
    () => [
      { id: 'all', label: 'All kinds' },
      ...(meta?.types ?? []).map(t => ({ id: t.key, label: t.label })),
    ],
    [meta],
  );
  const statuses = useMemo(
    () => [
      { id: 'all', label: 'Any status' },
      ...(meta?.statuses ?? []).map(t => ({ id: t.key, label: t.label })),
    ],
    [meta],
  );

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<MeetingFilters>(
    () => ({
      ...(view !== 'all' ? { when: view } : null),
      ...(term ? { search: term } : null),
      ...(f.type !== 'all' ? { type: f.type } : null),
      ...(f.status !== 'all' ? { status: f.status as MeetingStatus } : null),
      ...(f.from ? { date_from: f.from } : null),
      ...(f.to ? { date_to: f.to } : null),
    }),
    [view, term, f],
  );
  const query = useMeetingsInfiniteQuery(filters);
  const list = pagesOf(query);
  const counts = query.currentData?.pages[0]?.counts;
  const filtering = active > 0 || !!term;

  return (
    <FormScreen
      title="My meetings"
      onEndReached={list.loadMore}
      onRefresh={fresh}
      footer={
        <Button
          label="Plan a meeting"
          iconLeft={Plus}
          onPress={() => nav.navigate('MeetingForm')}
        />
      }
    >
      <Card style={styles.summary}>
        <Stat
          value={counts?.upcoming ?? '–'}
          label="Upcoming"
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.completed ?? '–'}
          label="Completed"
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.openActions ?? '–'}
          label="Open actions"
          tone={counts?.openActions ? colors.amberInk : colors.ink}
          style={styles.stat}
        />
      </Card>

      <View style={styles.tools}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search meetings"
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
        doneLabel="Show meetings"
      >
        <Dropdown
          label="Kind"
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
          label="From"
          placeholder="Any date"
          value={f.from}
          onChange={from => set({ from })}
        />
        <DateField
          clearable
          label="Until"
          placeholder="Any date"
          value={f.to}
          onChange={to => set({ to })}
        />
      </FilterBar>

      <View style={styles.chips}>
        <FilterChips
          value={view}
          onChange={setView}
          options={[
            { key: 'upcoming', label: 'Upcoming', count: counts?.upcoming },
            { key: 'past', label: 'Past' },
            { key: 'all', label: 'All' },
          ]}
        />
      </View>

      <View style={styles.list}>
        {list.failed ? (
          <Notice tone="error" title={errorMessage(list.error)} />
        ) : list.firstLoad ? (
          <Card>
            <ShimmerRows rows={4} icon={false} />
          </Card>
        ) : list.rows.length ? (
          list.rows.map(m => (
            <MeetingRow
              key={m.id}
              meeting={m}
              onPress={() => nav.navigate('MeetingDetail', { id: m.id })}
            />
          ))
        ) : (
          <EmptyState
            text={
              filtering
                ? 'No meetings match.'
                : view === 'upcoming'
                ? 'Nothing planned. Tap "Plan a meeting" to start.'
                : 'No meetings here yet.'
            }
          />
        )}
        {list.loadingMore ? (
          <Card>
            <ShimmerRows rows={2} icon={false} />
          </Card>
        ) : null}
        {list.rows.length && !list.hasMore && list.total > MEETINGS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} meetings.
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
  chips: { marginTop: vs(10) },
  list: { marginTop: vs(12) },
  end: { textAlign: 'center', marginTop: vs(8) },
});
