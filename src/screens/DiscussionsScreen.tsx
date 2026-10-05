import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { DiscussionRow } from '../components/DiscussionRow';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar, FilterButton } from '../components/FilterBar';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { QuickAdd } from '../components/QuickAdd';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { SwitchRow } from '../components/SwitchRow';
import { errorMessage } from '../store';
import {
  DiscussionFilters,
  DISCUSSIONS_PER_PAGE,
  Outcome,
  Privacy,
  useDiscussionMetaQuery,
  useDiscussionsInfiniteQuery,
  useQuickDiscussionMutation,
} from '../store/api/discussionsApi';
import { pagesOf } from '../store/pages';
import { useFresh } from '../store/useFresh';
import { useDebounced } from '../utils/useDebounced';
import { colors, hairline, s, vs } from '../theme';

const FRESH = ['Discussions'] as const;
const blank = {
  type: 'all',
  outcome: 'all',
  privacy: 'all',
  open: false,
  from: '',
  to: '',
};

export function DiscussionsScreen() {
  const nav = useNavigation<any>();
  const fresh = useFresh(FRESH);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  const active = Object.entries(f).filter(
    ([k, v]) => v !== blank[k as keyof typeof blank],
  ).length;

  const meta = useDiscussionMetaQuery().data;
  const opt = (list?: { key: string; label: string }[], all = 'All') => [
    { id: 'all', label: all },
    ...(list ?? []).map(x => ({ id: x.key, label: x.label })),
  ];
  const types = useMemo(() => opt(meta?.types, 'All kinds'), [meta]);
  const outcomes = useMemo(() => opt(meta?.outcomes, 'Any outcome'), [meta]);
  const privacies = useMemo(
    () => opt(meta?.privacies, 'Private and team'),
    [meta],
  );

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<DiscussionFilters>(
    () => ({
      ...(term ? { search: term } : null),
      ...(f.type !== 'all' ? { type: f.type } : null),
      ...(f.outcome !== 'all' ? { outcome: f.outcome as Outcome } : null),
      ...(f.privacy !== 'all' ? { privacy: f.privacy as Privacy } : null),
      ...(f.open ? { open: 1 as const } : null),
      ...(f.from ? { date_from: f.from } : null),
      ...(f.to ? { date_to: f.to } : null),
    }),
    [term, f],
  );
  const query = useDiscussionsInfiniteQuery(filters);
  const list = pagesOf(query);
  const counts = query.currentData?.pages[0]?.counts;
  const [quick, quickCall] = useQuickDiscussionMutation();
  const filtering = active > 0 || !!term;
  const failure = list.failed ? list.error : quickCall.error;

  return (
    <FormScreen
      title="Discussion logs"
      onEndReached={list.loadMore}
      onRefresh={fresh}
      footer={
        <Button
          label="Log a discussion"
          iconLeft={Plus}
          onPress={() => nav.navigate('DiscussionForm')}
        />
      }
    >
      <Card style={styles.summary}>
        <Stat value={counts?.total ?? '–'} label="Logged" style={styles.stat} />
        <View style={styles.rule} />
        <Stat
          value={counts?.attention ?? '–'}
          label="Need attention"
          tone={counts?.attention ? colors.red : colors.ink}
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.openFollowUps ?? '–'}
          label="To follow up"
          tone={counts?.openFollowUps ? colors.amberInk : colors.ink}
          style={styles.stat}
        />
      </Card>

      <View style={styles.quick}>
        <QuickAdd
          placeholder="Quick log: what was discussed, press +"
          onAdd={title => quick({ title })}
        />
      </View>

      <View style={styles.tools}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search logs and people"
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
        doneLabel="Show logs"
      >
        <Dropdown
          label="Kind"
          options={types}
          value={f.type}
          onChange={type => set({ type })}
        />
        <Dropdown
          label="Outcome"
          options={outcomes}
          value={f.outcome}
          onChange={outcome => set({ outcome })}
        />
        <Dropdown
          label="Privacy"
          options={privacies}
          value={f.privacy}
          onChange={privacy => set({ privacy })}
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
        <SwitchRow
          label="Only with open follow-ups"
          value={f.open}
          onChange={open => set({ open })}
        />
      </FilterBar>

      <View style={styles.list}>
        {failure ? (
          <Notice
            tone="error"
            title={errorMessage(failure)}
            style={styles.gap}
          />
        ) : null}
        {list.firstLoad ? (
          <Card>
            <ShimmerRows rows={4} icon={false} />
          </Card>
        ) : list.rows.length ? (
          list.rows.map(d => (
            <DiscussionRow
              key={d.id}
              discussion={d}
              onPress={() => nav.navigate('DiscussionDetail', { id: d.id })}
            />
          ))
        ) : list.failed ? null : (
          <EmptyState
            text={
              filtering
                ? 'No logs match.'
                : 'Nothing logged yet. A quick line is enough to start.'
            }
          />
        )}
        {list.loadingMore ? (
          <Card>
            <ShimmerRows rows={2} icon={false} />
          </Card>
        ) : null}
        {list.rows.length &&
        !list.hasMore &&
        list.total > DISCUSSIONS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} logs.
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
  quick: { marginTop: vs(12) },
  tools: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  search: { flex: 1 },
  list: { marginTop: vs(12) },
  gap: { marginBottom: vs(10) },
  end: { textAlign: 'center', marginTop: vs(8) },
});
