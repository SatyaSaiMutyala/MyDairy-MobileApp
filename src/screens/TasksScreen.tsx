import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { CardList } from '../components/CardList';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar } from '../components/FilterBar';
import { FilterChips } from '../components/FilterChips';
import { IconTile } from '../components/IconTile';
import { QuickAdd } from '../components/QuickAdd';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { SwitchRow } from '../components/SwitchRow';
import { TaskRow } from '../components/TaskRow';
import { departments } from '../data/departments';
import { locations, Task, today } from '../data/mock';
import { currentUser, seesAllDepartments } from '../data/user';
import { useStore } from '../state/Store';
import { isMine, useVisibleTasks } from '../state/views';
import { sameMonth, TODAY_ISO, weekOf } from '../utils/dates';
import { colors, s, shadow, vs } from '../theme';

type Box = 'mine' | 'inbox' | 'out';
type Status = 'all' | 'today' | 'overdue' | 'returned' | 'upcoming' | 'done';

const emptyText: Record<Status, string> = {
  all: 'No tasks match.',
  today: 'Nothing left for today.',
  overdue: 'No overdue tasks. Well kept.',
  returned: 'Nothing has come back to you.',
  upcoming: 'Nothing planned yet.',
  done: 'Finished tasks will show here.',
};

const priorities = [
  { id: 'all', label: 'All priorities' },
  { id: 'Critical', label: 'Critical' },
  { id: 'High', label: 'High' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Low', label: 'Low' },
];
const periods = [
  { id: 'any', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];
const allDepartments = [{ id: 'all', label: 'All departments' }, ...departments];
const allLocations = [
  { id: 'all', label: 'All locations' },
  ...locations.filter(l => l.id !== 'none'),
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

export function TasksScreen() {
  const nav = useNavigation<any>();
  const { toggleTask, addTask } = useStore();
  const tasks = useVisibleTasks();
  const everyone = seesAllDepartments();

  const [box, setBox] = useState<Box>('mine');
  const [status, setStatus] = useState<Status>('today');
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) => setF(v => ({ ...v, ...change }));

  const owners = useMemo(
    () => [
      { id: 'all', label: 'Everyone' },
      ...[...new Set(tasks.map(t => t.owner))].sort().map(o => ({ id: o, label: o })),
    ],
    [tasks],
  );

  const passes = (t: Task) => {
    const week = weekOf(TODAY_ISO);
    const day = t.dueDate;
    return (
      (f.priority === 'all' || t.priority === f.priority) &&
      (f.dept === 'all' ||
        t.area === departments.find(d => d.id === f.dept)?.label) &&
      (f.place === 'all' || t.location === f.place) &&
      (f.owner === 'all' || t.owner === f.owner) &&
      (!f.hard || !!t.hard) &&
      (!f.date || day === f.date) &&
      (f.period === 'any' ||
        (!!day &&
          (f.period === 'today'
            ? day === TODAY_ISO
            : f.period === 'week'
            ? day >= week[0] && day <= week[6]
            : sameMonth(day, TODAY_ISO))))
    );
  };
  const active =
    Object.entries(f).filter(([k, v]) => v !== blank[k as keyof typeof blank]).length;

  const lists = useMemo(() => {
    const inbox = tasks.filter(t => t.from && !isMine(t));
    const out = tasks.filter(t => t.escalatedTo && isMine(t));
    // Admin and CMD also see other people's tasks in the main list.
    const mine = tasks.filter(t => !inbox.includes(t) && !out.includes(t));
    return {
      inbox,
      out,
      all: mine,
      today: mine.filter(t => t.bucket === 'today' && !t.done),
      overdue: mine.filter(t => t.overdue && !t.done),
      returned: mine.filter(t => t.returned && !t.done),
      upcoming: mine.filter(t => t.bucket === 'upcoming' && !t.done),
      done: mine.filter(t => t.done),
    };
  }, [tasks]);

  const base =
    box === 'inbox' ? lists.inbox : box === 'out' ? lists.out : lists[status];
  const shown = base.filter(passes);
  const count = (key: Status) => lists[key].filter(passes).length;

  const empty = active
    ? 'No tasks match these filters.'
    : box === 'inbox'
    ? 'Nobody has escalated a task to you.'
    : box === 'out'
    ? 'You have no tasks waiting with a colleague.'
    : emptyText[status];

  const quickAdd = (title: string) =>
    addTask({
      owner: currentUser.name,
      title,
      priority: 'Medium',
      area: currentUser.department,
      due: 'Today',
      dueDate: TODAY_ISO,
      bucket: 'today',
    });

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow={everyone ? `${today.short} · everyone's tasks` : today.short}
        title={everyone ? 'Tasks' : 'My tasks'}
        right={
          <Pressable
            accessibilityLabel="Add task"
            onPress={() => nav.navigate('TaskForm')}>
            <IconTile size={38} bg={colors.yellow} style={styles.add}>
              <Plus size={s(20)} color={colors.yellowInk} strokeWidth={2.25} />
            </IconTile>
          </Pressable>
        }>
        <SegmentedControl
          value={box}
          onChange={setBox}
          options={[
            {
              key: 'mine',
              label: everyone ? 'All tasks' : 'My tasks',
              count: lists.all.filter(t => !t.done).length,
            },
            {
              key: 'inbox',
              label: 'Inbox',
              count: lists.inbox.length,
              countColor: lists.inbox.length ? colors.redInk : undefined,
            },
            { key: 'out', label: 'Escalated out', count: lists.out.length },
          ]}
        />
      </ScreenHeader>

      <ScreenScroll contentContainerStyle={styles.scroll}>
        {box === 'mine' ? (
          <>
            <QuickAdd placeholder="Quick add: type a task and press +" onAdd={quickAdd} />
            <FilterChips
              value={status}
              onChange={setStatus}
              options={[
                { key: 'today', label: 'Today', count: count('today') },
                { key: 'overdue', label: 'Overdue', count: count('overdue'), alert: true },
                { key: 'returned', label: 'Returned', count: count('returned'), alert: true },
                { key: 'upcoming', label: 'Upcoming', count: count('upcoming') },
                { key: 'done', label: 'Done', count: count('done') },
                { key: 'all', label: 'All', count: count('all') },
              ]}
            />
          </>
        ) : null}

        <FilterBar active={active} onClear={() => setF(blank)}>
          <Dropdown
            label="Priority"
            options={priorities}
            value={f.priority}
            onChange={priority => set({ priority })}
          />
          <Dropdown
            label="Department"
            options={allDepartments}
            value={f.dept}
            onChange={dept => set({ dept })}
          />
          <Dropdown
            label="Location"
            options={allLocations}
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

        {shown.length ? (
          <CardList inset={box === 'mine' ? 54 : 16} style={styles.list}>
            {shown.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                checked={!!t.done}
                readOnly={box !== 'mine'}
                showOwner={everyone}
                onToggle={() => toggleTask(t.id)}
                onOpen={() => nav.navigate('TaskDetail', { id: t.id })}
              />
            ))}
          </CardList>
        ) : (
          <EmptyState text={empty} />
        )}
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  add: { ...shadow.action },
  scroll: { paddingTop: vs(16) },
  list: { marginTop: vs(14) },
});

