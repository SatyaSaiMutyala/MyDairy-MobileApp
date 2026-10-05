import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar, FilterButton } from '../components/FilterBar';
import { FilterChips } from '../components/FilterChips';
import { IconTile } from '../components/IconTile';
import { Notice } from '../components/Notice';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SearchField } from '../components/SearchField';
import { SegmentedControl } from '../components/SegmentedControl';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TaskRow } from '../components/TaskRow';
import { seesAllDepartments } from '../data/user';
import { errorMessage } from '../store';
import {
  ApiPriority,
  TaskBox,
  TaskFilters,
  TaskStatus,
  TASKS_PER_PAGE,
  usePeopleQuery,
  useTaskMetaQuery,
  useToggleTaskMutation,
} from '../store/api/tasksApi';
import { useTaskList } from '../tasks/useTaskList';
import { longDate, realToday } from '../utils/dates';
import { useDebounced } from '../utils/useDebounced';
import { colors, s, shadow, vs } from '../theme';
import { useFresh } from '../store/useFresh';

const emptyText: Record<TaskStatus, string> = {
  all: 'No tasks yet.',
  today: 'Nothing left for today.',
  overdue: 'No overdue tasks. Well kept.',
  returned: 'Nothing has come back to you.',
  upcoming: 'Nothing planned yet.',
  done: 'Finished tasks will show here.',
};

const priorities = [
  { id: 'all', label: 'All priorities' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];
const periods = [
  { id: 'any', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

const blank = {
  priority: 'all',
  dept: 'all',
  place: 'all',
  period: 'any',
  date: '',
  owner: 'all',
  hard: false,
};

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Tasks'] as const;

export function TasksScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const everyone = seesAllDepartments();

  const [box, setBox] = useState<TaskBox>('mine');
  const [status, setStatus] = useState<TaskStatus>('today');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  const active = Object.entries(f).filter(
    ([k, v]) => v !== blank[k as keyof typeof blank],
  ).length;

  const meta = useTaskMetaQuery().data;
  const people = usePeopleQuery({}, { skip: !everyone }).data;
  const departments = useMemo(
    () => [
      { id: 'all', label: 'All departments' },
      ...(meta?.categories ?? []).map(c => ({ id: c.key, label: c.label })),
    ],
    [meta],
  );
  const places = useMemo(
    () => [
      { id: 'all', label: 'All locations' },
      ...(meta?.locations ?? []).map(l => ({ id: l.key, label: l.label })),
    ],
    [meta],
  );
  const owners = useMemo(
    () => [
      { id: 'all', label: 'Everyone' },
      ...(people ?? []).map(p => ({ id: String(p.id), label: p.name })),
    ],
    [people],
  );

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<TaskFilters>(
    () => ({
      box,
      ...(box === 'mine' ? { status } : null),
      ...(term ? { search: term } : null),
      ...(f.priority !== 'all'
        ? { priority: f.priority as ApiPriority }
        : null),
      ...(f.dept !== 'all' ? { department: f.dept } : null),
      ...(f.place !== 'all' ? { location: f.place } : null),
      ...(everyone && f.owner !== 'all' ? { owner: Number(f.owner) } : null),
      ...(f.hard ? { hard: 1 as const } : null),
      ...(f.date
        ? { due_date: f.date }
        : f.period !== 'any'
        ? { due: f.period as 'today' | 'week' | 'month' }
        : null),
    }),
    [box, status, term, f, everyone],
  );
  const list = useTaskList(filters);
  const counts = list.counts;

  const [toggle, toggling] = useToggleTaskMutation();
  // A tick shows at once; the list catches up when the server answers.
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  useEffect(() => setFlipped({}), [list.rows]);

  const tick = (id: number, checked: boolean) => {
    setFlipped(v => ({ ...v, [id]: !checked }));
    toggle(id)
      .unwrap()
      .catch(() => setFlipped(v => ({ ...v, [id]: checked })));
  };

  const filtering = active > 0 || !!term;
  const empty = filtering
    ? 'No tasks match.'
    : box === 'inbox'
    ? 'Nobody has escalated a task to you.'
    : box === 'out'
    ? 'You have no tasks waiting with a colleague.'
    : emptyText[status];
  const failure = list.failed ? list.error : toggling.error;
  const today = longDate(realToday());

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow={everyone ? `${today} · everyone's tasks` : today}
        title={everyone ? 'Tasks' : 'My tasks'}
        right={
          <Pressable
            accessibilityLabel="Add task"
            onPress={() => nav.navigate('TaskForm')}
          >
            <IconTile size={38} bg={colors.yellow} style={styles.add}>
              <Plus size={s(20)} color={colors.yellowInk} strokeWidth={2.25} />
            </IconTile>
          </Pressable>
        }
      >
        <SegmentedControl
          compact
          value={box}
          onChange={setBox}
          options={[
            {
              key: 'mine',
              label: everyone ? 'All tasks' : 'My tasks',
              count: counts?.mine,
            },
            {
              key: 'inbox',
              label: 'Inbox',
              count: counts?.inbox,
              countColor: counts?.inbox ? colors.redInk : undefined,
            },
            { key: 'out', label: 'Escalated out', count: counts?.out },
          ]}
        />
      </ScreenHeader>

      <ScreenScroll
        contentContainerStyle={styles.scroll}
        onRefresh={fresh}
        onEndReached={list.loadMore}
      >
        <View style={styles.tools}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search tasks"
            style={styles.search}
          />
          <FilterButton
            active={active}
            open={filtersOpen}
            onPress={() => setFiltersOpen(v => !v)}
          />
        </View>
        <FilterBar
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          active={active}
          onClear={() => setF(blank)}
          doneLabel="Show tasks"
        >
          <Dropdown
            label="Priority"
            options={priorities}
            value={f.priority}
            onChange={priority => set({ priority })}
          />
          <Dropdown
            label="Department"
            options={departments}
            value={f.dept}
            onChange={dept => set({ dept })}
          />
          <Dropdown
            label="Location"
            options={places}
            value={f.place}
            onChange={place => set({ place })}
          />
          {everyone ? (
            <Dropdown
              label="Owner"
              options={owners}
              value={f.owner}
              onChange={owner => set({ owner })}
            />
          ) : null}
          <Dropdown
            label="Due"
            options={periods}
            value={f.period}
            onChange={period => set({ period, date: '' })}
          />
          <DateField
            clearable
            label="Exact due date"
            placeholder="Any date"
            value={f.date}
            onChange={date => set({ date, period: 'any' })}
          />
          <SwitchRow
            label="Hard deadlines only"
            value={f.hard}
            onChange={hard => set({ hard })}
          />
        </FilterBar>
        {box === 'mine' ? (
          <View style={styles.chips}>
            <FilterChips
              value={status}
              onChange={setStatus}
              options={[
                { key: 'today', label: 'Today', count: counts?.today },
                {
                  key: 'overdue',
                  label: 'Overdue',
                  count: counts?.overdue,
                  alert: true,
                },
                {
                  key: 'returned',
                  label: 'Returned',
                  count: counts?.returned,
                  alert: true,
                },
                { key: 'upcoming', label: 'Upcoming', count: counts?.upcoming },
                { key: 'done', label: 'Done', count: counts?.done },
                { key: 'all', label: 'All', count: counts?.all },
              ]}
            />
          </View>
        ) : null}

        {failure ? (
          <Notice
            tone="error"
            title={errorMessage(failure)}
            style={styles.list}
          />
        ) : null}

        {list.firstLoad ? (
          <Card style={styles.list}>
            <ShimmerRows rows={6} />
          </Card>
        ) : list.rows.length ? (
          <CardList inset={box === 'mine' ? 54 : 16} style={styles.list}>
            {list.rows.map(t => {
              const checked = flipped[t.id] ?? t.done;
              return (
                <TaskRow
                  key={t.id}
                  task={t}
                  checked={checked}
                  readOnly={box !== 'mine'}
                  showOwner={everyone}
                  onToggle={() => tick(t.id, checked)}
                  onOpen={() => nav.navigate('TaskDetail', { id: t.id })}
                />
              );
            })}
          </CardList>
        ) : list.failed ? null : (
          <EmptyState text={empty} />
        )}

        {list.loadingMore ? (
          <Card style={styles.list}>
            <ShimmerRows rows={2} />
          </Card>
        ) : null}
        {list.rows.length && !list.hasMore && list.total > TASKS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} tasks.
          </AppText>
        ) : null}
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  add: { ...shadow.action },
  scroll: { paddingTop: vs(12) },
  tools: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  search: { flex: 1 },
  chips: { marginTop: vs(10) },
  list: { marginTop: vs(10) },
  end: { textAlign: 'center', marginTop: vs(16) },
});
