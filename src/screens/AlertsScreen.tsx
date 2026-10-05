import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AlertRow } from '../components/AlertRow';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { EmptyState } from '../components/EmptyState';
import { FilterBar, FilterButton } from '../components/FilterBar';
import { FilterChips } from '../components/FilterChips';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { SwitchRow } from '../components/SwitchRow';
import { AlertItem } from '../alerts/model';
import { useAlertList } from '../alerts/useAlertList';
import { seesAllDepartments } from '../data/user';
import { errorMessage } from '../store';
import {
  AlertFilters,
  ALERTS_PER_PAGE,
  Severity,
  useDepartmentsQuery,
  useEscalateAlertMutation,
} from '../store/api/alertsApi';
import { addDays, realToday, shortDate } from '../utils/dates';
import { useDebounced } from '../utils/useDebounced';
import { colors, hairline, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

type View3 = 'open' | 'resolved' | 'history';

const HISTORY_DAYS = 14;

const levels = [
  { id: 'all', label: 'All levels' },
  { id: 'red', label: 'Action' },
  { id: 'amber', label: 'Watch' },
  { id: 'green', label: 'Clear' },
];
const sevLabel = { red: 'Action', amber: 'Watch', green: 'Clear' } as const;
const sevTone = { red: 'critical', amber: 'watch', green: 'good' } as const;

const emptyText: Record<View3, string> = {
  open: 'All clear. No active alerts today.',
  resolved: 'Nothing has been resolved today.',
  history: `No alerts were logged in the last ${HISTORY_DAYS} days.`,
};

const blank = { dept: 'all', level: 'all', date: '', escalated: false };

const ALL_DEPARTMENTS = {};

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Alerts'] as const;

export function AlertsScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const everyone = seesAllDepartments();
  const today = realToday();

  const [view, setView] = useState<View3>('open');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState(blank);
  const set = (change: Partial<typeof blank>) =>
    setF(v => ({ ...v, ...change }));
  // The exact date only applies to the history view.
  const active =
    (f.dept !== 'all' ? 1 : 0) +
    (f.level !== 'all' ? 1 : 0) +
    (f.escalated ? 1 : 0) +
    (view === 'history' && f.date ? 1 : 0);

  const departments = useDepartmentsQuery(ALL_DEPARTMENTS, {
    skip: !everyone,
  }).data;
  const deptOptions = useMemo(
    () => [
      { id: 'all', label: 'All departments' },
      ...(departments ?? []).map(d => ({ id: d.key, label: d.name })),
    ],
    [departments],
  );

  const dept = everyone && f.dept !== 'all' ? f.dept : undefined;
  // Today's numbers for the summary, whatever the list below is showing.
  const summary = useAlertList(
    useMemo<AlertFilters>(
      () => ({ status: 'open', ...(dept ? { department: dept } : null) }),
      [dept],
    ),
  );

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<AlertFilters>(
    () => ({
      ...(view === 'history'
        ? f.date
          ? { status: 'all' as const, date: f.date }
          : {
              status: 'all' as const,
              date_from: addDays(today, -HISTORY_DAYS),
              date_to: addDays(today, -1),
            }
        : { status: view }),
      ...(dept ? { department: dept } : null),
      ...(f.level !== 'all' ? { severity: f.level as Severity } : null),
      ...(f.escalated ? { escalated: 1 as const } : null),
      ...(term ? { search: term } : null),
    }),
    [view, f.date, f.level, f.escalated, dept, term, today],
  );
  const list = useAlertList(filters);
  const [escalate, escalating] = useEscalateAlertMutation();

  const counts = summary.counts;
  const filtering = active > 0 || !!term;
  const failure = list.failed ? list.error : escalating.error;

  const actions = (a: AlertItem) =>
    a.resolved ? (
      <AppText variant="meta" color={colors.inkSoft} style={styles.note}>
        {`Resolved ${a.resolvedAt ?? ''}${
          a.resolvedBy ? ` · ${a.resolvedBy}` : ''
        }\n`}
        {a.resolutionNote ?? 'No resolution note was written.'}
      </AppText>
    ) : view === 'history' ? (
      <>
        <Pill label={sevLabel[a.level]} tone={sevTone[a.level]} />
        {a.level === 'green' ? null : <Pill label="Open" tone="watch" />}
      </>
    ) : a.level === 'green' || !a.canAct ? undefined : (
      <>
        <Button
          label="Resolve"
          size="sm"
          variant="secondary"
          onPress={() => nav.navigate('ResolveAlert', { id: a.id })}
        />
        {a.level === 'red' && !a.escalated ? (
          <Button
            label="Escalate to CMD"
            size="sm"
            variant="outline"
            disabled={escalating.isLoading}
            onPress={() => escalate(a.id)}
          />
        ) : null}
      </>
    );

  return (
    <FormScreen
      title="Alerts"
      onRefresh={fresh}
      onEndReached={list.loadMore}
      footer={
        <Button
          label="Log new alert"
          iconLeft={Plus}
          onPress={() =>
            nav.navigate(
              'RaiseAlert',
              f.dept === 'all' ? undefined : { dept: f.dept },
            )
          }
        />
      }
    >
      <Card style={styles.summary}>
        <Stat
          value={counts?.red ?? '–'}
          label="Action"
          tone={colors.red}
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.amber ?? '–'}
          label="Watch"
          tone={colors.amberInk}
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat
          value={counts?.green ?? '–'}
          label="Clear"
          tone={colors.greenInk}
          style={styles.stat}
        />
      </Card>

      <View style={styles.tools}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search alerts"
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
        doneLabel="Show alerts"
      >
        {everyone ? (
          <Dropdown
            label="Department"
            options={deptOptions}
            value={f.dept}
            onChange={id => set({ dept: id })}
          />
        ) : null}
        <Dropdown
          label="Level"
          options={levels}
          value={f.level}
          onChange={level => set({ level })}
        />
        {view === 'history' ? (
          <DateField
            clearable
            label="Exact date"
            placeholder={`Last ${HISTORY_DAYS} days`}
            value={f.date}
            onChange={date => set({ date })}
          />
        ) : null}
        <SwitchRow
          label="Escalated to CMD only"
          value={f.escalated}
          onChange={escalated => set({ escalated })}
        />
      </FilterBar>

      <View style={styles.chips}>
        <FilterChips
          value={view}
          onChange={setView}
          options={[
            {
              key: 'open',
              label: 'Open today',
              count: counts?.open,
              alert: true,
            },
            {
              key: 'resolved',
              label: 'Resolved today',
              count: counts?.resolved,
            },
            { key: 'history', label: `Last ${HISTORY_DAYS} days` },
          ]}
        />
      </View>

      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.list}
        />
      ) : null}

      {list.firstLoad ? (
        <Card style={styles.list}>
          <ShimmerRows rows={5} />
        </Card>
      ) : list.rows.length ? (
        <CardList inset={68} style={styles.list}>
          {list.rows.map(a => (
            <AlertRow
              key={a.id}
              alert={
                view === 'history'
                  ? { ...a, time: `${shortDate(a.date)} · ${a.time}` }
                  : a
              }
              actions={actions(a)}
            />
          ))}
        </CardList>
      ) : list.failed ? null : (
        <EmptyState text={filtering ? 'No alerts match.' : emptyText[view]} />
      )}

      {list.loadingMore ? (
        <Card style={styles.list}>
          <ShimmerRows rows={2} />
        </Card>
      ) : null}
      {list.rows.length && !list.hasMore && list.total > ALERTS_PER_PAGE ? (
        <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
          That is all {list.total} alerts.
        </AppText>
      ) : null}
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
  list: { marginTop: vs(10) },
  note: { flex: 1 },
  end: { textAlign: 'center', marginTop: vs(16) },
});
