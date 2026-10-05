import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ChevronDown, ChevronUp, LockOpen } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { useConfirm } from '../components/ConfirmDialog';
import {
  DepartmentPicker,
  useDepartment,
} from '../components/DepartmentPicker';
import { EmptyState } from '../components/EmptyState';
import { ExpandRow } from '../components/ExpandRow';
import { Eyebrow } from '../components/Eyebrow';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { KpiRow } from '../components/KpiRow';
import { Notice } from '../components/Notice';
import { ProgressHeader } from '../components/ProgressHeader';
import { Shimmer, ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { TextArea } from '../components/TextArea';
import { Kpi, KpiEntry, statusWord, toKpi } from '../reports/model';
import { errorMessage } from '../store';
import {
  KpiStatus,
  ReportState,
  useDailyReportHistoryInfiniteQuery,
  useDailyReportQuery,
  useReopenDailyReportMutation,
  useSaveDailyReportMutation,
} from '../store/api/reportsApi';
import { pagesOf } from '../store/pages';
import { addDays, longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

const tone = {
  good: colors.greenInk,
  amber: colors.amberInk,
  red: colors.redInk,
};

const FRESH = ['Report', 'ReportHistory'] as const;

export function DailyReportScreen() {
  const fresh = useFresh(FRESH);
  const { dept, setDept, canSwitch } = useDepartment(
    useRoute<any>().params?.dept,
  );
  // A department login never names a department: the server uses its own.
  const arg = useMemo(
    () => (canSwitch ? { department: dept } : {}),
    [canSwitch, dept],
  );
  const query = useDailyReportQuery(arg);
  const picker = (
    <DepartmentPicker
      scope="kpis"
      value={dept}
      onChange={setDept}
      style={styles.picker}
    />
  );

  if (!query.currentData) {
    return (
      <FormScreen title="Daily report">
        {picker}
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
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
      </FormScreen>
    );
  }
  return (
    <ReportForm
      // A fresh form for each department.
      key={query.currentData.department.key}
      data={query.currentData}
      arg={arg}
      picker={picker}
      onRefresh={fresh}
    />
  );
}

type FormProps = {
  data: ReportState;
  arg: { department?: string };
  picker: React.ReactNode;
  onRefresh: () => Promise<unknown>;
};

function ReportForm({ data, arg, picker, onRefresh }: FormProps) {
  const confirm = useConfirm();
  const [save, saving] = useSaveDailyReportMutation();
  const [reopenCall, reopening] = useReopenDailyReportMutation();
  const history = pagesOf(
    useDailyReportHistoryInfiniteQuery(
      useMemo(
        () => ({ ...arg, date_to: addDays(data.date, -1) }),
        [arg, data.date],
      ),
    ),
  );

  const kpis = useMemo(() => data.kpis.map(toKpi), [data.kpis]);
  const [entries, setEntries] = useState<Record<string, KpiEntry>>(() =>
    Object.fromEntries(
      data.kpis
        .filter(k => k.value || k.status !== 'good')
        .map(k => [String(k.index), { value: k.value, status: k.status }]),
    ),
  );
  const [remarks, setRemarks] = useState(data.remarks);
  const [showLater, setShowLater] = useState(false);
  const locked = data.locked;

  const group = (due: Kpi['due']) => kpis.filter(k => k.due === due);
  const dueToday = group('today');
  const isFilled = (k: Kpi) => !!entries[k.id]?.value.trim();
  const filledToday = dueToday.filter(isFilled);
  const filled = kpis.filter(isFilled);
  const count = (st: KpiStatus) =>
    filled.filter(k => entries[k.id].status === st).length;

  const send = (submit: boolean) =>
    save({
      ...arg,
      kpi_values: Object.fromEntries(
        Object.entries(entries).map(([id, e]) => [
          id,
          { val: e.value.trim(), status: e.status },
        ]),
      ),
      remarks,
      submit,
    });

  const submit = async () => {
    const blank = dueToday.filter(k => !isFilled(k));
    const yes = await confirm({
      title: blank.length
        ? `${blank.length} ${blank.length === 1 ? 'KPI' : 'KPIs'} due today ${
            blank.length === 1 ? 'is' : 'are'
          } still blank`
        : `Submit the report for ${longDate(data.date)}?`,
      text: blank.length
        ? `${blank
            .map(k => `• ${k.name}`)
            .join('\n')}\n\nOnce submitted the day is locked.`
        : 'Once submitted the day is locked and only an admin can reopen it.',
      confirmLabel: blank.length ? 'Submit anyway' : 'Submit',
      tone: blank.length ? 'warn' : 'ask',
    });
    if (yes) {
      send(true);
    }
  };

  const reopen = async () => {
    const yes = await confirm({
      title: 'Reopen this report?',
      text: 'While reopened, this day is withdrawn from the KPI Tracker until it is submitted again.',
      confirmLabel: 'Reopen',
    });
    if (yes) {
      reopenCall(arg);
    }
  };

  const rows = (list: Kpi[]) => (
    <CardList inset={14}>
      {list.map(k => (
        <KpiRow
          key={k.id}
          kpi={k}
          locked={locked}
          entry={entries[k.id]}
          onChange={e => setEntries(v => ({ ...v, [k.id]: e }))}
        />
      ))}
    </CardList>
  );

  const failure = saving.error ?? reopening.error;
  const dept = data.department;
  const submitting = saving.isLoading && !!saving.originalArgs?.submit;
  const drafting = saving.isLoading && !saving.originalArgs?.submit;

  return (
    <FormScreen
      title="Daily report"
      onRefresh={onRefresh}
      onEndReached={history.loadMore}
      footer={
        locked ? (
          <>
            <Notice
              tone="locked"
              title={`Submitted by ${data.savedBy ?? 'the department'} at ${
                data.savedAt ?? ''
              }`}
              text={
                data.canReopen
                  ? 'This report is locked. You can reopen it.'
                  : 'This report is locked. Contact an admin to unlock it.'
              }
            />
            {data.canReopen ? (
              <Button
                label={reopening.isLoading ? 'Reopening…' : 'Admin: reopen'}
                variant="outline"
                iconLeft={LockOpen}
                disabled={reopening.isLoading}
                onPress={reopen}
                style={styles.reopen}
              />
            ) : null}
          </>
        ) : (
          <>
            {filled.length === 0 ? (
              <AppText
                variant="meta"
                color={colors.inkMuted}
                style={styles.note}
              >
                Type at least one Actual value to submit. A status alone is not
                a figure.
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <Button
                label={drafting ? 'Saving…' : 'Save draft'}
                variant="outline"
                style={styles.action}
                disabled={saving.isLoading}
                onPress={() => send(false)}
              />
              <Button
                label={submitting ? 'Submitting…' : 'Submit'}
                style={styles.action}
                disabled={filled.length === 0 || saving.isLoading}
                onPress={submit}
              />
            </View>
          </>
        )
      }
    >
      {picker}

      {failure ? (
        <Notice tone="error" title={errorMessage(failure)} style={styles.gap} />
      ) : saving.isSuccess && !locked ? (
        <Notice
          tone="success"
          title={`Draft saved at ${data.savedAt ?? ''}`}
          style={styles.gap}
        />
      ) : null}

      <ProgressHeader
        eyebrow={`${dept.name} · HOD submission`}
        done={filledToday.length}
        total={dueToday.length}
        unit="scheduled today"
        due="09:00"
        caption={
          data.status === 'draft'
            ? `${longDate(data.date)} · draft saved at ${data.savedAt ?? ''}`
            : `${longDate(data.date)} · ${kpis.length} KPIs in total`
        }
      />
      <View style={styles.stats}>
        <Stat
          size="sm"
          value={count('good')}
          label="On target"
          dot={{ color: colors.green }}
        />
        <Stat
          size="sm"
          value={count('amber')}
          label="Watch"
          dot={{ color: colors.amber }}
        />
        <Stat
          size="sm"
          value={count('red')}
          label="Action"
          dot={{ color: colors.red }}
        />
        <Stat
          size="sm"
          value={dueToday.length - filledToday.length}
          label="Not filled"
          dot={{ color: colors.inkFaint, hollow: true }}
        />
      </View>

      {kpis.length === 0 ? (
        <EmptyState text="No KPIs are set up for this department." />
      ) : null}

      {dueToday.length ? (
        <>
          <Eyebrow label={`Due today · ${dueToday.length}`} />
          {rows(dueToday)}
        </>
      ) : null}

      {group('event').length ? (
        <>
          <Eyebrow label={`When it happens · ${group('event').length}`} />
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            No fixed date. Fill only if it occurred.
          </AppText>
          {rows(group('event'))}
        </>
      ) : null}

      {group('later').length ? (
        <>
          <Pressable style={styles.fold} onPress={() => setShowLater(v => !v)}>
            <View style={styles.foldText}>
              <AppText variant="eyebrow" color={colors.inkMuted}>
                NOT DUE TODAY · {group('later').length}
              </AppText>
              <AppText variant="meta" color={colors.inkMuted}>
                Scheduled for another day
              </AppText>
            </View>
            {showLater ? (
              <ChevronUp size={s(20)} color={colors.inkSoft} strokeWidth={2} />
            ) : (
              <ChevronDown
                size={s(20)}
                color={colors.inkSoft}
                strokeWidth={2}
              />
            )}
          </Pressable>
          {showLater ? rows(group('later')) : null}
        </>
      ) : null}

      <FormCard title="Remarks">
        <TextArea
          label="Remarks & observations"
          editable={!locked}
          value={remarks}
          onChangeText={setRemarks}
          maxLength={5000}
          placeholder="Anything the CMD should know about today"
        />
      </FormCard>

      <Eyebrow label="Previous reports" />
      {history.firstLoad ? (
        <Card>
          <ShimmerRows rows={3} icon={false} lines={2} />
        </Card>
      ) : history.failed ? (
        <Notice tone="error" title={errorMessage(history.error)} />
      ) : history.rows.length ? (
        <CardList inset={14}>
          {history.rows.map(h => {
            const worst = h.values.some(v => v.status === 'red')
              ? colors.red
              : h.values.some(v => v.status === 'amber')
              ? colors.amber
              : colors.green;
            return (
              <ExpandRow
                key={h.id}
                dot={worst}
                title={longDate(h.date)}
                detail={`${h.by ?? 'Unknown'} · ${
                  h.locked ? `submitted ${h.at ?? ''}` : 'draft'
                }`}
                value={`${h.filled}/${h.total}`}
              >
                {h.values.map(v => (
                  <View key={v.name} style={styles.past}>
                    <AppText
                      variant="meta"
                      color={colors.inkSoft}
                      style={styles.pastName}
                    >
                      {v.name}
                    </AppText>
                    <AppText variant="metaStrong" color={tone[v.status]}>
                      {v.val} · {statusWord[v.status]}
                    </AppText>
                  </View>
                ))}
                {h.remarks ? (
                  <AppText
                    variant="meta"
                    color={colors.inkMuted}
                    style={styles.pastNote}
                  >
                    {h.remarks}
                  </AppText>
                ) : null}
              </ExpandRow>
            );
          })}
        </CardList>
      ) : (
        <AppText variant="meta" color={colors.inkFaint}>
          No earlier reports for this department.
        </AppText>
      )}
      {history.loadingMore ? (
        <Card style={styles.gap}>
          <ShimmerRows rows={2} icon={false} lines={2} />
        </Card>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: vs(6), marginBottom: 0 },
  gap: { marginTop: vs(12) },
  skeleton: { marginTop: vs(18), marginBottom: vs(12) },
  stats: { flexDirection: 'row', marginTop: vs(12) },
  hint: { marginTop: -vs(4), marginBottom: vs(10) },
  fold: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(24),
    marginBottom: vs(10),
  },
  foldText: { flex: 1 },
  note: { marginBottom: vs(8) },
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  reopen: { marginTop: vs(10) },
  past: { flexDirection: 'row', gap: s(10), marginTop: vs(6) },
  pastName: { flex: 1 },
  pastNote: { marginTop: vs(10) },
});
