import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar, FilterButton } from '../components/FilterBar';
import { FilterChips } from '../components/FilterChips';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { ProjectRow } from '../components/ProjectRow';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { errorMessage } from '../store';
import {
  ProjectFilters,
  ProjectStatus,
  PROJECTS_PER_PAGE,
  useProjectMetaQuery,
  useProjectsInfiniteQuery,
} from '../store/api/projectsApi';
import type { ApiPriority } from '../store/api/tasksApi';
import { pagesOf } from '../store/pages';
import { useFresh } from '../store/useFresh';
import { useDebounced } from '../utils/useDebounced';
import { colors, hairline, s, vs } from '../theme';

type View3 = 'open' | 'done' | 'all';

const FRESH = ['Projects'] as const;
const blank = { category: 'all', status: 'all', priority: 'all' };
const priorities = [
  { id: 'all', label: 'Any priority' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export function ProjectsScreen() {
  const nav = useNavigation<any>();
  const fresh = useFresh(FRESH);
  const [view, setView] = useState<View3>('open');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  const active = Object.entries(f).filter(
    ([k, v]) => v !== blank[k as keyof typeof blank],
  ).length;

  const meta = useProjectMetaQuery().data;
  const categories = useMemo(
    () => [
      { id: 'all', label: 'All categories' },
      ...(meta?.categories ?? []).map(c => ({ id: c.key, label: c.label })),
    ],
    [meta],
  );
  const statuses = useMemo(
    () => [
      { id: 'all', label: 'Any status' },
      ...(meta?.statuses ?? []).map(c => ({ id: c.key, label: c.label })),
    ],
    [meta],
  );

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<ProjectFilters>(
    () => ({
      ...(term ? { search: term } : null),
      ...(f.category !== 'all' ? { category: f.category } : null),
      ...(f.status !== 'all' ? { status: f.status as ProjectStatus } : null),
      ...(f.priority !== 'all'
        ? { priority: f.priority as ApiPriority }
        : null),
    }),
    [term, f],
  );
  const query = useProjectsInfiniteQuery(filters);
  const list = pagesOf(query);
  const counts = query.currentData?.pages[0]?.counts;
  // Open / done is decided here: the server gives every project the person can see.
  const rows = useMemo(
    () =>
      list.rows.filter(p =>
        view === 'all'
          ? true
          : view === 'done'
          ? p.status === 'completed'
          : p.status !== 'completed',
      ),
    [list.rows, view],
  );
  const filtering = active > 0 || !!term;

  return (
    <FormScreen
      title="Projects"
      onEndReached={list.loadMore}
      onRefresh={fresh}
      footer={
        <Button
          label="Start a project"
          iconLeft={Plus}
          onPress={() => nav.navigate('ProjectForm')}
        />
      }
    >
      <Card style={styles.summary}>
        <Stat
          value={counts?.active ?? '–'}
          label="In progress"
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.attention ?? '–'}
          label="Need attention"
          tone={counts?.attention ? colors.red : colors.ink}
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.completed ?? '–'}
          label="Completed"
          tone={colors.greenInk}
          style={styles.stat}
        />
      </Card>

      <View style={styles.tools}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search projects"
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
        doneLabel="Show projects"
      >
        <Dropdown
          label="Category"
          options={categories}
          value={f.category}
          onChange={category => set({ category })}
        />
        <Dropdown
          label="Status"
          options={statuses}
          value={f.status}
          onChange={status => set({ status })}
        />
        <Dropdown
          label="Priority"
          options={priorities}
          value={f.priority}
          onChange={priority => set({ priority })}
        />
      </FilterBar>

      <View style={styles.chips}>
        <FilterChips
          value={view}
          onChange={setView}
          options={[
            { key: 'open', label: 'Open' },
            { key: 'done', label: 'Completed' },
            { key: 'all', label: 'All', count: counts?.total },
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
        ) : rows.length ? (
          rows.map(p => (
            <ProjectRow
              key={p.id}
              project={p}
              onPress={() => nav.navigate('ProjectDetail', { id: p.id })}
            />
          ))
        ) : (
          <EmptyState
            text={
              filtering
                ? 'No projects match.'
                : view === 'done'
                ? 'No completed projects yet.'
                : 'No projects yet. Tap "Start a project".'
            }
          />
        )}
        {list.loadingMore ? (
          <Card>
            <ShimmerRows rows={2} icon={false} />
          </Card>
        ) : null}
        {list.rows.length && !list.hasMore && list.total > PROJECTS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} projects.
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
