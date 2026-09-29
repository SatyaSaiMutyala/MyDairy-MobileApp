import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp, LockOpen } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { CardList } from '../components/CardList';
import { DepartmentPicker, useDepartment } from '../components/DepartmentPicker';
import { ExpandRow } from '../components/ExpandRow';
import { Eyebrow } from '../components/Eyebrow';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { KpiRow } from '../components/KpiRow';
import { Notice } from '../components/Notice';
import { ProgressHeader } from '../components/ProgressHeader';
import { Stat } from '../components/Stat';
import { TextArea } from '../components/TextArea';
import { departmentOf, Kpi } from '../data/departments';
import { reportHistory, statusWord, today } from '../data/mock';
import { currentUser } from '../data/user';
import { clockNow, KpiEntry, useStore } from '../state/Store';
import { colors, s, vs } from '../theme';

const tone = { good: colors.greenInk, amber: colors.amberInk, red: colors.redInk };

export function DailyReportScreen() {
  const store = useStore();
  const { dept, setDept, canSwitch } = useDepartment();
  const department = departmentOf(dept);
  const kpis = department.kpis;
  const report = store.reportOf(dept);
  const [showLater, setShowLater] = useState(false);
  const locked = report.status === 'submitted';

  const group = (due: Kpi['due']) => kpis.filter(k => k.due === due);
  const dueToday = group('today');
  const isFilled = (k: Kpi) => !!report.entries[k.id]?.value.trim();
  const filledToday = dueToday.filter(isFilled);
  const filled = kpis.filter(isFilled);
  const count = (st: KpiEntry['status']) =>
    filled.filter(k => report.entries[k.id].status === st).length;

  const change = (id: string, entry: KpiEntry) =>
    store.setReport(dept, { entries: { ...report.entries, [id]: entry } });
  const stamp = { savedAt: clockNow(), savedBy: currentUser.name };

  const submit = () => {
    const blank = dueToday.filter(k => !isFilled(k));
    Alert.alert(
      blank.length
        ? `${blank.length} KPIs due today are still blank`
        : `Submit the report for ${today.short}?`,
      blank.length
        ? `${blank.map(k => `• ${k.name}`).join('\n')}\n\nOnce submitted the day is locked.`
        : 'Once submitted the day is locked and only an admin can reopen it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: blank.length ? 'Submit anyway' : 'Submit',
          onPress: () => store.setReport(dept, { status: 'submitted', ...stamp }),
        },
      ],
    );
  };

  const reopen = () =>
    Alert.alert(
      'Reopen this report?',
      'While reopened, this day is withdrawn from the KPI Tracker until it is submitted again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reopen',
          onPress: () => store.setReport(dept, { status: 'draft', ...stamp }),
        },
      ],
    );

  const rows = (list: Kpi[]) => (
    <CardList inset={14}>
      {list.map(k => (
        <KpiRow
          key={k.id}
          kpi={k}
          locked={locked}
          entry={report.entries[k.id]}
          onChange={e => change(k.id, e)}
        />
      ))}
    </CardList>
  );

  return (
    <FormScreen
      title="Daily report"
      footer={
        locked ? (
          <>
            <Notice
              tone="locked"
              title={`Submitted by ${report.savedBy} at ${report.savedAt}`}
              text={
                canSwitch
                  ? 'This report is locked. You can reopen it.'
                  : 'This report is locked. Contact an admin to unlock it.'
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
        ) : (
          <View style={styles.actions}>
            <Button
              label="Save draft"
              variant="outline"
              style={styles.action}
              onPress={() => store.setReport(dept, { status: 'draft', ...stamp })}
            />
            <Button
              label="Submit"
              style={styles.action}
              disabled={filled.length === 0}
              onPress={submit}
            />
          </View>
        )
      }>
      <DepartmentPicker value={dept} onChange={setDept} style={styles.picker} />

      <ProgressHeader
        eyebrow={`${department.name} · HOD submission`}
        done={filledToday.length}
        total={dueToday.length}
        unit="scheduled today"
        due="09:00"
        caption={
          report.status === 'draft'
            ? `${today.short} · draft saved at ${report.savedAt}`
            : `${today.short} · ${kpis.length} KPIs in total`
        }
      />
      <View style={styles.stats}>
        <Stat size="sm" value={count('good')} label="On target" dot={{ color: colors.green }} />
        <Stat size="sm" value={count('amber')} label="Watch" dot={{ color: colors.amber }} />
        <Stat size="sm" value={count('red')} label="Action" dot={{ color: colors.red }} />
        <Stat
          size="sm"
          value={dueToday.length - filledToday.length}
          label="Not filled"
          dot={{ color: colors.inkFaint, hollow: true }}
        />
      </View>

      <Eyebrow label={`Due today · ${dueToday.length}`} />
      {rows(dueToday)}

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
              <ChevronDown size={s(20)} color={colors.inkSoft} strokeWidth={2} />
            )}
          </Pressable>
          {showLater ? rows(group('later')) : null}
        </>
      ) : null}

      <FormCard title="Remarks">
        <TextArea
          label="Remarks & observations"
          editable={!locked}
          value={report.remarks}
          onChangeText={remarks => store.setReport(dept, { remarks })}
          maxLength={5000}
          placeholder="Anything the CMD should know about today"
        />
      </FormCard>

      <Eyebrow label="Previous reports" />
      <CardList inset={14}>
        {reportHistory.map(h => {
          const shown = dueToday.slice(0, h.statuses.length);
          const worst = h.statuses.includes('red')
            ? colors.red
            : h.statuses.includes('amber')
            ? colors.amber
            : colors.green;
          const by = h.by === 'lead' ? department.lead : h.by;
          return (
            <ExpandRow
              key={h.date}
              dot={worst}
              title={h.date}
              detail={`${by} · ${h.locked ? 'submitted' : 'draft'}`}
              value={`${shown.length}/${dueToday.length}`}>
              {shown.map((k, i) => (
                <View key={k.id} style={styles.past}>
                  <AppText variant="meta" color={colors.inkSoft} style={styles.pastName}>
                    {k.name}
                  </AppText>
                  <AppText variant="metaStrong" color={tone[h.statuses[i]]}>
                    {statusWord[h.statuses[i]]}
                  </AppText>
                </View>
              ))}
              {h.remarks ? (
                <AppText variant="meta" color={colors.inkMuted} style={styles.pastNote}>
                  {h.remarks}
                </AppText>
              ) : null}
            </ExpandRow>
          );
        })}
      </CardList>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: vs(6), marginBottom: 0 },
  stats: { flexDirection: 'row', marginTop: vs(12) },
  hint: { marginTop: -vs(4), marginBottom: vs(10) },
  fold: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(24),
    marginBottom: vs(10),
  },
  foldText: { flex: 1 },
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  reopen: { marginTop: vs(10) },
  past: { flexDirection: 'row', gap: s(10), marginTop: vs(6) },
  pastName: { flex: 1 },
  pastNote: { marginTop: vs(10) },
});
