import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { LockOpen } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { CardList } from '../components/CardList';
import { CheckLine } from '../components/CheckLine';
import { Checkbox } from '../components/Checkbox';
import { DepartmentPicker, useDepartment } from '../components/DepartmentPicker';
import { EmptyState } from '../components/EmptyState';
import { ExpandRow } from '../components/ExpandRow';
import { Eyebrow } from '../components/Eyebrow';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { Pill, PillTone } from '../components/Pill';
import { ProgressHeader } from '../components/ProgressHeader';
import { TextArea } from '../components/TextArea';
import { departmentOf } from '../data/departments';
import { preflightHistory, today } from '../data/mock';
import { currentUser } from '../data/user';
import { clockNow, useStore } from '../state/Store';
import { colors, s, vs } from '../theme';

const priority: Record<string, { label: string; tone: PillTone }> = {
  critical: { label: 'Critical', tone: 'critical' },
  high: { label: 'High', tone: 'high' },
  standard: { label: 'Standard', tone: 'low' },
};

export function PreOpsScreen() {
  const store = useStore();
  const { dept, setDept, canSwitch } = useDepartment();
  const department = departmentOf(dept);
  const items = department.preflight;
  const preflight = store.preflightOf(dept);

  const locked = !!preflight.submittedAt;
  const done = items.filter(i => preflight.checks[i.ref]).length;
  const left = items.length - done;

  const toggle = (ref: string) =>
    store.setPreflight(dept, {
      checks: { ...preflight.checks, [ref]: !preflight.checks[ref] },
    });

  const submit = () =>
    Alert.alert(
      left
        ? `${left} ${left === 1 ? 'check is' : 'checks are'} still unticked`
        : 'Submit this check?',
      'Once submitted the day is locked and only an admin can reopen it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: left ? 'Submit anyway' : 'Submit',
          onPress: () =>
            store.setPreflight(dept, {
              submittedAt: clockNow(),
              submittedBy: currentUser.name,
            }),
        },
      ],
    );

  const reopen = () =>
    Alert.alert(
      'Reopen this submission?',
      'The ticks and remarks are kept. The department can change them and submit again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reopen',
          onPress: () =>
            store.setPreflight(dept, { submittedAt: null, submittedBy: null }),
        },
      ],
    );

  const dotOf = (pct: number) =>
    pct === 100 ? colors.green : pct >= 60 ? colors.amber : colors.red;

  return (
    <FormScreen
      title="Pre-operations"
      footer={
        locked ? (
          <>
            <Notice
              tone="locked"
              title={`Submitted by ${preflight.submittedBy} at ${preflight.submittedAt}`}
              text={
                canSwitch
                  ? 'This check is locked. You can reopen it.'
                  : 'This check is locked. An admin can reopen it.'
              }
            />
            {canSwitch ? (
              <Button
                label="Admin: reopen"
                variant="outline"
                iconLeft={LockOpen}
                onPress={reopen}
                style={styles.reopen}
              />
            ) : null}
          </>
        ) : items.length ? (
          <>
            {left ? (
              <AppText variant="meta" color={colors.inkMuted} style={styles.note}>
                {left} {left === 1 ? 'check is' : 'checks are'} still unticked.
                You can submit and explain in the remarks.
              </AppText>
            ) : null}
            <Button label="Submit check" onPress={submit} />
          </>
        ) : undefined
      }>
      <DepartmentPicker value={dept} onChange={setDept} style={styles.picker} />

      <ProgressHeader
        eyebrow={`${department.name} · morning pre-flight`}
        done={done}
        total={items.length}
        unit="checks completed"
        due="09:00"
        caption={`${today.short} · ${department.lead}, ${department.owner}`}
      />

      <Eyebrow label="Checks" />
      {items.length ? (
        <CardList inset={54}>
          {items.map(item => {
            const on = !!preflight.checks[item.ref];
            const p = priority[item.priority];
            return (
              <Pressable
                key={item.ref}
                disabled={locked}
                onPress={() => toggle(item.ref)}
                style={styles.row}>
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
          value={preflight.remarks}
          onChangeText={remarks => store.setPreflight(dept, { remarks })}
          maxLength={5000}
          placeholder="Note any issues, deviations, or escalations for today..."
        />
      </FormCard>

      <Eyebrow label="Previous submissions" />
      <CardList inset={14}>
        {preflightHistory.map(h => {
          const missed = h.missed.filter(i => i < items.length);
          const pct = items.length
            ? Math.round(((items.length - missed.length) / items.length) * 100)
            : 0;
          const by = h.by === 'lead' ? department.lead : h.by;
          return (
            <ExpandRow
              key={h.date}
              dot={dotOf(pct)}
              title={h.date}
              detail={h.at ? `${by} · submitted ${h.at}` : `${by} · draft`}
              value={`${pct}%`}>
              {h.remarks ? (
                <AppText variant="meta" color={colors.inkSoft}>
                  {h.remarks}
                </AppText>
              ) : null}
              {items.map((i, n) => (
                <CheckLine
                  key={i.ref}
                  ok={!missed.includes(n)}
                  text={i.text}
                  note={i.ref}
                />
              ))}
            </ExpandRow>
          );
        })}
      </CardList>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: vs(6), marginBottom: 0 },
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
