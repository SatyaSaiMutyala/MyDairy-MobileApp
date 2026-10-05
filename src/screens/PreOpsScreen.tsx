import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LockOpen } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { CheckLine } from '../components/CheckLine';
import { Checkbox } from '../components/Checkbox';
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
import { Notice } from '../components/Notice';
import { Pill, PillTone } from '../components/Pill';
import { ProgressHeader } from '../components/ProgressHeader';
import { Shimmer, ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { errorMessage } from '../store';
import {
  PreOpsState,
  usePreOpsHistoryInfiniteQuery,
  usePreOpsQuery,
  useReopenPreOpsMutation,
  useSavePreOpsMutation,
} from '../store/api/reportsApi';
import { pagesOf } from '../store/pages';
import { addDays, longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

const priority: Record<string, { label: string; tone: PillTone }> = {
  critical: { label: 'Critical', tone: 'critical' },
  high: { label: 'High', tone: 'high' },
  standard: { label: 'Standard', tone: 'low' },
};

const dotOf = (pct: number) =>
  pct === 100 ? colors.green : pct >= 60 ? colors.amber : colors.red;

// Ticks are saved as a draft a moment after the last change.
const AUTOSAVE_MS = 700;

const FRESH = ['PreOps', 'PreOpsHistory'] as const;

export function PreOpsScreen() {
  const fresh = useFresh(FRESH);
  const { dept, setDept, canSwitch } = useDepartment(
    useRoute<any>().params?.dept,
  );
  // A department login never names a department: the server uses its own.
  const arg = useMemo(
    () => (canSwitch ? { department: dept } : {}),
    [canSwitch, dept],
  );
  const query = usePreOpsQuery(arg);
  const picker = (
    <DepartmentPicker
      scope="preflight"
      value={dept}
      onChange={setDept}
      style={styles.picker}
    />
  );

  if (!query.currentData) {
    return (
      <FormScreen title="Pre-operations">
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
              <ShimmerRows rows={5} />
            </Card>
          </>
        )}
      </FormScreen>
    );
  }
  return (
    <PreOpsForm
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
  data: PreOpsState;
  arg: { department?: string };
  picker: React.ReactNode;
  onRefresh: () => Promise<unknown>;
};

function PreOpsForm({ data, arg, picker, onRefresh }: FormProps) {
  const confirm = useConfirm();
  const [save, saving] = useSavePreOpsMutation();
  const [reopenCall, reopening] = useReopenPreOpsMutation();
  const history = pagesOf(
    usePreOpsHistoryInfiniteQuery(
      useMemo(
        () => ({ ...arg, date_to: addDays(data.date, -1) }),
        [arg, data.date],
      ),
    ),
  );

  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.items.map(i => [i.ref, i.done])),
  );
  const [remarks, setRemarks] = useState(data.remarks);
  const locked = data.locked;
  const items = data.items;
  const done = items.filter(i => checks[i.ref]).length;
  const left = items.length - done;

  // Save the draft once the person pauses. Skipped until something changes.
  const dirty = useRef(false);
  useEffect(() => {
    if (!dirty.current || locked) {
      return;
    }
    const timer = setTimeout(() => {
      dirty.current = false;
      save({ ...arg, checks, remarks });
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [checks, remarks, locked, arg, save]);

  const toggle = (ref: string) => {
    dirty.current = true;
    setChecks(v => ({ ...v, [ref]: !v[ref] }));
  };

  const submit = async () => {
    const yes = await confirm({
      title: left
        ? `${left} ${left === 1 ? 'check is' : 'checks are'} still unticked`
        : 'Submit this check?',
      text: 'Once submitted the day is locked and only an admin can reopen it.',
      confirmLabel: left ? 'Submit anyway' : 'Submit',
      tone: left ? 'warn' : 'ask',
    });
    if (yes) {
      dirty.current = false;
      save({ ...arg, checks, remarks, submit: true });
    }
  };

  const reopen = async () => {
    const yes = await confirm({
      title: 'Reopen this submission?',
      text: 'The ticks and remarks are kept. The department can change them and submit again.',
      confirmLabel: 'Reopen',
    });
    if (yes) {
      reopenCall(arg);
    }
  };

  const failure = saving.error ?? reopening.error;
  const dept = data.department;

  return (
    <FormScreen
      title="Pre-operations"
      onRefresh={onRefresh}
      onEndReached={history.loadMore}
      footer={
        locked ? (
          <>
            <Notice
              tone="locked"
              title={`Submitted by ${data.submittedBy ?? 'the department'} at ${
                data.submittedAt ?? ''
              }`}
              text={
                data.canReopen
                  ? 'This check is locked. You can reopen it.'
                  : 'This check is locked. An admin can reopen it.'
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
        ) : items.length ? (
          <>
            {left ? (
              <AppText
                variant="meta"
                color={colors.inkMuted}
                style={styles.note}
              >
                {left} {left === 1 ? 'check is' : 'checks are'} still unticked.
                You can submit and explain in the remarks.
              </AppText>
            ) : null}
            <Button
              label={
                saving.isLoading && saving.originalArgs?.submit
                  ? 'Submitting…'
                  : 'Submit check'
              }
              disabled={saving.isLoading && !!saving.originalArgs?.submit}
              onPress={submit}
            />
          </>
        ) : undefined
      }
    >
      {picker}

      {failure ? (
        <Notice tone="error" title={errorMessage(failure)} style={styles.gap} />
      ) : null}

      <ProgressHeader
        eyebrow={`${dept.name} · morning pre-flight`}
        done={done}
        total={items.length}
        unit="checks completed"
        due={data.cutoff}
        caption={[longDate(data.date), dept.lead, dept.owner]
          .filter(Boolean)
          .join(' · ')}
      />

      <Eyebrow label="Checks" />
      {items.length ? (
        <CardList inset={54}>
          {items.map(item => {
            const on = !!checks[item.ref];
            const p = priority[item.priority] ?? priority.standard;
            return (
              <Pressable
                key={item.ref}
                disabled={locked}
                onPress={() => toggle(item.ref)}
                style={styles.row}
              >
                <Checkbox
                  checked={on}
                  disabled={locked}
                  label={item.text}
                  onToggle={() => toggle(item.ref)}
                />
                <View style={styles.body}>
                  <AppText variant="body">{item.text}</AppText>
                  <View style={styles.meta}>
                    <Pill label={p.label} tone={p.tone} />
                    <AppText variant="meta" color={colors.inkMuted}>
                      {item.ref}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </CardList>
      ) : (
        <EmptyState text="No checks are set up for this department." />
      )}

      <FormCard title="Remarks">
        <TextArea
          label="Remarks / escalations for CMD (optional)"
          editable={!locked}
          value={remarks}
          onChangeText={text => {
            dirty.current = true;
            setRemarks(text);
          }}
          maxLength={5000}
          placeholder="Note any issues, deviations, or escalations for today..."
        />
      </FormCard>

      <Eyebrow label="Previous submissions" />
      {history.firstLoad ? (
        <Card>
          <ShimmerRows rows={3} icon={false} lines={2} />
        </Card>
      ) : history.failed ? (
        <Notice tone="error" title={errorMessage(history.error)} />
      ) : history.rows.length ? (
        <CardList inset={14}>
          {history.rows.map(h => (
            <ExpandRow
              key={h.id}
              dot={dotOf(h.pct)}
              title={longDate(h.date)}
              detail={
                h.submittedAt
                  ? `${h.by ?? 'Unknown'} · submitted ${h.submittedAt}`
                  : `${h.by ?? 'Unknown'} · draft`
              }
              value={`${h.pct}%`}
            >
              {h.remarks ? (
                <AppText variant="meta" color={colors.inkSoft}>
                  {h.remarks}
                </AppText>
              ) : null}
              {h.items.map(i => (
                <CheckLine key={i.ref} ok={i.done} text={i.text} note={i.ref} />
              ))}
            </ExpandRow>
          ))}
        </CardList>
      ) : (
        <AppText variant="meta" color={colors.inkFaint}>
          No earlier submissions for this department.
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
  row: {
    flexDirection: 'row',
    gap: s(14),
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
  },
  body: { flex: 1 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(9),
    marginTop: vs(6),
  },
  note: { marginBottom: vs(8) },
  reopen: { marginTop: vs(10) },
});
