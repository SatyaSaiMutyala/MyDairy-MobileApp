import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Lock, Pencil, Plus } from 'lucide-react-native';
import {
  blankRow,
  Draft,
  minutesLabel,
  problem,
  rowsFrom,
  stateColor,
  stateLabel,
  stateTone,
  toBody,
} from '../activity/model';
import { ActivityRowEdit, ActivityRowView } from '../components/ActivityRow';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { Checkbox } from '../components/Checkbox';
import { useConfirm } from '../components/ConfirmDialog';
import { DateField } from '../components/DateField';
import { EmptyState } from '../components/EmptyState';
import { ExpandRow } from '../components/ExpandRow';
import { Eyebrow } from '../components/Eyebrow';
import { FooterBar } from '../components/FooterBar';
import { FormCard } from '../components/FormCard';
import { IconTile } from '../components/IconTile';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { PersonPicker } from '../components/PersonPicker';
import { Pill } from '../components/Pill';
import { ReopenLog } from '../components/ReopenLog';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { Shimmer, ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { TextArea } from '../components/TextArea';
import { errorMessage, useAppSelector } from '../store';
import {
  ActivityDay,
  ActivityMeta,
  useActivityDayQuery,
  useActivityHistoryInfiniteQuery,
  useActivityMetaQuery,
  useActivityOverviewQuery,
  useSaveActivityMutation,
} from '../store/api/activityApi';
import { pagesOf } from '../store/pages';
import { useFresh } from '../store/useFresh';
import { longDate, realToday, shortDate } from '../utils/dates';
import { colors, hairline, s, vs } from '../theme';

type View_ = 'day' | 'history' | 'team';

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Activity', 'ActivityHistory', 'ActivityOverview'] as const;

export function ActivityScreen() {
  const fresh = useFresh(FRESH);
  const route = useRoute<any>();
  const me = useAppSelector(st => st.session.user);
  const canSeeAll = !!me?.sees_all;
  const TODAY = realToday();

  const [view, setView] = useState<View_>('day');
  const [date, setDate] = useState<string>(route.params?.date ?? TODAY);
  // Admin and CMD may look at anyone's day; everyone else only at their own.
  const [person, setPerson] = useState<{ id: string; label: string }>();
  useEffect(() => {
    if (route.params?.date) {
      setDate(route.params.date);
      setView('day');
    }
  }, [route.params?.date]);

  const userArg = person && canSeeAll ? Number(person.id) : undefined;
  const dayArg = useMemo(
    () => ({ ...(date !== TODAY ? { date } : null), ...(userArg ? { user: userArg } : null) }),
    [date, TODAY, userArg],
  );
  const day = useActivityDayQuery(dayArg);
  const meta = useActivityMetaQuery();
  const history = pagesOf(
    useActivityHistoryInfiniteQuery(
      useMemo(() => (userArg ? { user: userArg } : {}), [userArg]),
      { skip: view !== 'history' },
    ),
  );

  const data = day.currentData;
  const picker = canSeeAll ? (
    <PersonPicker
      label="Whose day"
      placeholder={me?.name ?? 'Me'}
      value={person}
      onChange={setPerson}
      style={styles.picker}
    />
  ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        eyebrow={
          date === TODAY
            ? `Today, ${shortDate(date).slice(5)}`
            : date.slice(0, 4) === TODAY.slice(0, 4)
            ? shortDate(date)
            : longDate(date)
        }
        title={data && !data.isSelf ? data.viewed.name : 'My activity'}
        eyebrowAction={
          <DateField
            value={date}
            onChange={d => {
              setDate(d || TODAY);
              setView('day');
            }}
            renderTrigger={() => (
              <AppText variant="metaStrong" color={colors.yellow}>
                {date === TODAY ? 'Change' : 'Today'}
              </AppText>
            )}
          />
        }
      >
        <SegmentedControl
          compact
          value={view}
          onChange={setView}
          options={[
            { key: 'day', label: date === TODAY ? 'Today' : 'Day' },
            { key: 'history', label: 'History' },
            ...(canSeeAll ? [{ key: 'team' as const, label: 'Everyone' }] : []),
          ]}
        />
      </ScreenHeader>

      {view === 'team' ? (
        <TeamView
          date={date}
          onRefresh={fresh}
          onOpen={(id, name) => {
            setPerson({ id: String(id), label: name });
            setView('day');
          }}
        />
      ) : view === 'history' ? (
        <ScreenScroll
          contentContainerStyle={styles.scroll}
          onRefresh={fresh}
          onEndReached={history.loadMore}
        >
          {picker}
          <Eyebrow label="Past days" />
          {history.firstLoad ? (
            <Card>
              <ShimmerRows rows={4} icon={false} lines={2} />
            </Card>
          ) : history.failed ? (
            <Notice tone="error" title={errorMessage(history.error)} />
          ) : history.rows.length ? (
            <CardList inset={14}>
              {history.rows.map(h => (
                <ExpandRow
                  key={h.id}
                  dot={stateColor[h.state]}
                  title={longDate(h.date)}
                  detail={`${stateLabel[h.state]}${
                    h.submittedAt ? ` · ${h.submittedAt}` : ''
                  } · ${h.activities} ${
                    h.activities === 1 ? 'activity' : 'activities'
                  }`}
                  value={h.total}
                >
                  {h.items.map((i, n) => (
                    <ActivityRowView key={n} index={n} item={i} />
                  ))}
                  <InfoRow label="Pending" value={h.pendingForward} />
                  <InfoRow label="Remarks" value={h.remarks} />
                </ExpandRow>
              ))}
            </CardList>
          ) : (
            <EmptyState text="No earlier days yet." />
          )}
          {history.loadingMore ? (
            <Card style={styles.gap}>
              <ShimmerRows rows={2} icon={false} lines={2} />
            </Card>
          ) : null}
        </ScreenScroll>
      ) : !data || !meta.data ? (
        <ScreenScroll contentContainerStyle={styles.scroll} onRefresh={fresh}>
          {picker}
          {day.error || meta.error ? (
            <Notice
              tone="error"
              title={errorMessage(day.error ?? meta.error)}
              style={styles.gap}
            />
          ) : (
            <>
              <Shimmer width="55%" height={vs(34)} style={styles.skeleton} />
              <Shimmer height={vs(10)} round />
              <Card style={styles.gap}>
                <ShimmerRows rows={4} icon={false} />
              </Card>
            </>
          )}
        </ScreenScroll>
      ) : (
        <DayView
          // A fresh form for each day and person; a lock or reopen resets it.
          key={`${data.date}-${data.viewed.id}-${data.locked}`}
          data={data}
          meta={meta.data}
          picker={picker}
          onRefresh={fresh}
        />
      )}
    </KeyboardAvoidingView>
  );
}

type DayProps = {
  data: ActivityDay;
  meta: ActivityMeta;
  picker: React.ReactNode;
  onRefresh: () => Promise<unknown>;
};

function DayView({ data, meta, picker, onRefresh }: DayProps) {
  const nav = useNavigation<any>();
  const confirm = useConfirm();
  const [save, saving] = useSaveActivityMutation();
  const log = data.log;

  const [rows, setRows] = useState<Draft[]>(() =>
    log?.items.length ? rowsFrom(log.items) : [blankRow()],
  );
  const [pending, setPending] = useState(log?.pendingForward ?? '');
  const [remarks, setRemarks] = useState(log?.remarks ?? '');
  const [confirmed, setConfirmed] = useState(false);

  const categories = useMemo(
    () => meta.categories.map(c => ({ id: c.key, label: c.label })),
    [meta],
  );
  const durations = useMemo(
    () => meta.durations.map(d => ({ id: String(d.minutes), label: d.label })),
    [meta],
  );

  const editable = data.editable;
  const filled = rows.filter(r => r.text.trim());
  const total = filled.reduce((sum, r) => sum + r.minutes, 0);
  const blocker = problem(rows, confirmed, meta.minChars);

  const send = (submit: boolean) =>
    save({
      date: data.date,
      activities: toBody(rows),
      pending_forward: pending.trim(),
      remarks: remarks.trim(),
      confirm: confirmed,
      submit,
    });

  const signOff = async () => {
    const yes = await confirm({
      title: `Sign off ${longDate(data.date)}?`,
      text: `${filled.length} ${
        filled.length === 1 ? 'activity' : 'activities'
      } · ${minutesLabel(
        total,
      )}.\n\nOnce signed off the day is locked. Only your HOD or the CMD can reopen it.`,
      confirmLabel: 'Sign off',
    });
    if (yes) {
      send(true);
    }
  };

  const submitting = saving.isLoading && !!saving.originalArgs?.submit;
  const drafting = saving.isLoading && !saving.originalArgs?.submit;
  const st = data.stats;

  return (
    <>
      <ScreenScroll contentContainerStyle={styles.scroll} onRefresh={onRefresh}>
        {picker}

        {saving.error ? (
          <Notice
            tone="error"
            title={errorMessage(saving.error)}
            style={styles.gap}
          />
        ) : saving.isSuccess && !data.locked ? (
          <Notice
            tone="success"
            title={saving.data?.message ?? 'Draft saved.'}
            style={styles.gap}
          />
        ) : null}

        {!data.isSelf ? (
          <Notice
            tone="info"
            title={`${data.viewed.name}'s day`}
            text="Only they can write and sign it off. You can reopen it once it is signed."
            style={styles.gap}
          />
        ) : null}

        <Card style={styles.status}>
          <View style={styles.statusHead}>
            <Pill label={stateLabel[data.state]} tone={stateTone[data.state]} />
            <AppText variant="meta" color={colors.inkMuted}>
              Cut-off {data.cutoff}
            </AppText>
          </View>
          <InfoRow label="Department" value={data.viewed.deptName} />
          <InfoRow
            label="Time logged"
            value={data.locked ? log?.total : minutesLabel(total)}
          />
          <InfoRow label="Signed off" value={log?.submittedOn} />
        </Card>

        <Eyebrow
          label={`${st.scope} · ${st.total} ${
            st.total === 1 ? 'person' : 'people'
          } today`}
        />
        <Card style={styles.stats}>
          <Stat
            size="sm"
            value={st.signed}
            label="Signed off"
            dot={{ color: colors.green }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={st.late}
            label="Of them late"
            dot={{ color: colors.amber }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={st.pending}
            label="Not yet"
            dot={{ color: colors.inkFaint, hollow: true }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={st.overdue}
            label="Overdue"
            dot={{ color: colors.red }}
            style={styles.stat}
          />
        </Card>

        <Eyebrow
          label={`Activities completed · ${
            editable ? filled.length : log?.activities ?? 0
          }`}
        />
        {editable ? (
          <>
            {rows.map((row, i) => (
              <ActivityRowEdit
                key={row.key}
                index={i}
                row={row}
                categories={categories}
                durations={durations}
                onChange={r => setRows(v => v.map(x => (x.key === r.key ? r : x)))}
                onRemove={() =>
                  setRows(v =>
                    v.length === 1 ? [blankRow()] : v.filter(x => x.key !== row.key),
                  )
                }
              />
            ))}
            {rows.length < meta.maxActivities ? (
              <Button
                label="Add another activity"
                variant="outline"
                size="md"
                iconLeft={Plus}
                onPress={() => setRows(v => [...v, blankRow()])}
                style={styles.add}
              />
            ) : null}
          </>
        ) : log?.items.length ? (
          <CardList inset={44}>
            {log.items.map((i, n) => (
              <ActivityRowView key={n} index={n} item={i} />
            ))}
          </CardList>
        ) : (
          <EmptyState text="Nothing was logged for this day." />
        )}

        {editable ? (
          <FormCard title="Before you leave" style={styles.gapLg}>
            <TextArea
              label="Pending / carry forward to tomorrow"
              value={pending}
              onChangeText={setPending}
              maxLength={5000}
              placeholder="Anything started but not finished, to pick up tomorrow"
            />
            <TextArea
              label="Remarks / issues for your HOD"
              value={remarks}
              onChangeText={setRemarks}
              maxLength={5000}
              placeholder="Blockers, escalations or support needed"
              style={styles.gap}
            />
            <Pressable
              style={styles.confirm}
              onPress={() => setConfirmed(v => !v)}
            >
              <Checkbox
                checked={confirmed}
                onToggle={() => setConfirmed(v => !v)}
                label="Confirm this log"
              />
              <AppText variant="meta" color={colors.inkSoft} style={styles.confirmText}>
                I confirm this is a true record of what I completed today.
              </AppText>
            </Pressable>
          </FormCard>
        ) : log?.pendingForward || log?.remarks ? (
          <FormCard title="Notes left with the day" style={styles.gapLg}>
            {log.pendingForward ? (
              <View style={styles.note}>
                <AppText variant="label" color={colors.inkSoft}>
                  Pending / carry forward
                </AppText>
                <AppText variant="bodyRegular">{log.pendingForward}</AppText>
              </View>
            ) : null}
            {log.remarks ? (
              <View style={styles.note}>
                <AppText variant="label" color={colors.inkSoft}>
                  Remarks for HOD
                </AppText>
                <AppText variant="bodyRegular">{log.remarks}</AppText>
              </View>
            ) : null}
          </FormCard>
        ) : null}

        {log?.reopens.length ? (
          <ReopenLog
            log={log.reopens.map(r => ({
              ts: r.ts ?? '',
              by: r.by,
              reason: r.reason,
              signedBy: log.name,
              signedAt: r.signedAt,
            }))}
          />
        ) : null}

        <Notice
          tone="info"
          title={`Sign off before ${data.cutoff}`}
          text={`Each activity needs a clear description (at least ${meta.minChars} characters), a category and the time it took. A later sign-off is recorded as late. After sign-off the day is locked; only your HOD or the CMD can reopen it.`}
          style={styles.gapLg}
        />
      </ScreenScroll>

      {editable ? (
        <FooterBar inTabs>
          <View style={styles.footRow}>
            <IconTile size={36}>
              {blocker ? (
                <Lock size={s(17)} color={colors.inkSoft} strokeWidth={1.9} />
              ) : (
                <Check size={s(18)} color={colors.tealDeep} strokeWidth={2.5} />
              )}
            </IconTile>
            <View style={styles.footText}>
              <AppText variant="label">
                {blocker ? 'Not ready to sign' : 'Ready to sign off'}
              </AppText>
              <AppText variant="meta" color={colors.inkMuted} numberOfLines={2}>
                {blocker ??
                  `${filled.length} ${
                    filled.length === 1 ? 'activity' : 'activities'
                  } · ${minutesLabel(total)}`}
              </AppText>
            </View>
          </View>
          <View style={styles.actions}>
            <Button
              label={drafting ? 'Saving…' : 'Save draft'}
              variant="outline"
              style={styles.action}
              disabled={saving.isLoading}
              onPress={() => send(false)}
            />
            <Button
              label={submitting ? 'Signing…' : 'Sign off'}
              iconLeft={Pencil}
              style={styles.action}
              disabled={!!blocker || saving.isLoading}
              onPress={signOff}
            />
          </View>
        </FooterBar>
      ) : data.locked && log ? (
        <FooterBar inTabs>
          <View style={styles.footRow}>
            <IconTile size={36} bg={log.late ? colors.amber : colors.teal}>
              <Check size={s(18)} color={colors.white} strokeWidth={2.75} />
            </IconTile>
            <View style={styles.footText}>
              <AppText variant="label">
                {log.late ? 'Signed off late' : 'Signed off'}
              </AppText>
              <AppText variant="meta" color={colors.inkMuted}>
                {log.submittedAt} · {log.total} · {log.activities}{' '}
                {log.activities === 1 ? 'activity' : 'activities'}
              </AppText>
            </View>
            {data.canReopen ? (
              <Pressable
                hitSlop={s(10)}
                onPress={() =>
                  nav.navigate('ActivityReopen', {
                    id: log.id,
                    name: log.name,
                    date: data.date,
                    signedOn: log.submittedOn,
                  })
                }
              >
                <AppText variant="label" color={colors.teal}>
                  Reopen
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </FooterBar>
      ) : null}
    </>
  );
}

type TeamProps = {
  date: string;
  onRefresh: () => Promise<unknown>;
  onOpen: (userId: number, name: string) => void;
};

// Admin and CMD: where everyone stands on one date.
function TeamView({ date, onRefresh, onOpen }: TeamProps) {
  const TODAY = realToday();
  const query = useActivityOverviewQuery(date !== TODAY ? { date } : {});
  const rows = query.currentData?.rows ?? [];
  const count = (st: string) => rows.filter(r => r.state === st).length;

  return (
    <ScreenScroll contentContainerStyle={styles.scroll} onRefresh={onRefresh}>
      {query.currentData ? (
        <Card style={styles.stats}>
          <Stat
            size="sm"
            value={count('signed')}
            label="Signed"
            dot={{ color: colors.green }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={count('late')}
            label="Late"
            dot={{ color: colors.amber }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={count('pending')}
            label="Pending"
            dot={{ color: colors.inkFaint, hollow: true }}
            style={styles.stat}
          />
          <View style={styles.rule} />
          <Stat
            size="sm"
            value={count('overdue')}
            label="Overdue"
            dot={{ color: colors.red }}
            style={styles.stat}
          />
        </Card>
      ) : null}
      <Eyebrow label={`${rows.length} people · ${longDate(date)}`} />
      {!query.currentData ? (
        query.error ? (
          <Notice tone="error" title={errorMessage(query.error)} />
        ) : (
          <Card>
            <ShimmerRows rows={6} icon={false} lines={2} />
          </Card>
        )
      ) : rows.length ? (
        <CardList inset={14}>
          {rows.map(r => (
            <Pressable
              key={r.userId}
              style={styles.person}
              onPress={() => onOpen(r.userId, r.name)}
            >
              <View style={styles.personText}>
                <AppText variant="body">{r.name}</AppText>
                <AppText variant="meta" color={colors.inkMuted}>
                  {r.dept}
                  {r.designation ? ` · ${r.designation}` : ''}
                </AppText>
              </View>
              <View style={styles.personRight}>
                <Pill label={stateLabel[r.state]} tone={stateTone[r.state]} />
                <AppText variant="meta" color={colors.inkMuted}>
                  {r.activities ? `${r.activities} · ${r.time}` : '—'}
                  {r.submittedAt ? ` · ${r.submittedAt}` : ''}
                </AppText>
              </View>
            </Pressable>
          ))}
        </CardList>
      ) : (
        <EmptyState text="Nobody to show." />
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  scroll: { paddingTop: vs(12) },
  picker: { marginBottom: vs(4) },
  gap: { marginTop: vs(12) },
  gapLg: { marginTop: vs(20) },
  skeleton: { marginTop: vs(18), marginBottom: vs(12) },
  status: {
    marginTop: vs(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    gap: vs(4),
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(4),
  },
  stats: { flexDirection: 'row', alignItems: 'stretch' },
  stat: { paddingHorizontal: s(10), paddingVertical: vs(10) },
  rule: { width: hairline, backgroundColor: colors.line },
  add: { marginTop: vs(12) },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginTop: vs(14),
  },
  confirmText: { flex: 1 },
  note: { marginBottom: vs(12), gap: vs(2) },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  footText: { flex: 1 },
  actions: { flexDirection: 'row', gap: s(12), marginTop: vs(10) },
  action: { flex: 1 },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(10),
  },
  personText: { flex: 1 },
  personRight: { alignItems: 'flex-end', gap: vs(4) },
});
