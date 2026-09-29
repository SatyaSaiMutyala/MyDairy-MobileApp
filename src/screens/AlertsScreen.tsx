import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AlertRow } from '../components/AlertRow';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { DepartmentPicker, useDepartment } from '../components/DepartmentPicker';
import { EmptyState } from '../components/EmptyState';
import { ExpandRow } from '../components/ExpandRow';
import { Eyebrow } from '../components/Eyebrow';
import { FormScreen } from '../components/FormScreen';
import { Pill } from '../components/Pill';
import { Stat } from '../components/Stat';
import { alertHistory, AlertItem } from '../data/mock';
import { useStore } from '../state/Store';
import { colors, hairline, s, vs } from '../theme';

const groups: { level: AlertItem['level']; title: string }[] = [
  { level: 'red', title: 'Immediate action required' },
  { level: 'amber', title: 'Watch items' },
  { level: 'green', title: 'Positive highlights' },
];

const sevLabel = { red: 'Action', amber: 'Watch', green: 'Clear' } as const;
const sevTone = { red: 'critical', amber: 'watch', green: 'good' } as const;

export function AlertsScreen() {
  const nav = useNavigation<any>();
  const { alerts, escalateAlert } = useStore();
  const { dept, setDept, canSwitch } = useDepartment(true);

  const inScope = <T extends { dept: string }>(list: T[]) =>
    dept === 'all' ? list : list.filter(a => a.dept === dept);

  const mine = inScope(alerts);
  const open = mine.filter(a => !a.resolved);
  const resolved = mine.filter(a => a.resolved);
  const count = (level: AlertItem['level']) =>
    open.filter(a => a.level === level).length;

  const history = alertHistory
    .map(day => ({ ...day, items: inScope(day.items) }))
    .filter(day => day.items.length);

  return (
    <FormScreen
      title="Alerts"
      footer={
        <Button
          label="Log new alert"
          iconLeft={Plus}
          onPress={() =>
            nav.navigate('RaiseAlert', dept === 'all' ? undefined : { dept })
          }
        />
      }>
      <DepartmentPicker allowAll value={dept} onChange={setDept} style={styles.picker} />

      <Card style={styles.summary}>
        <Stat value={count('red')} label="Action" tone={colors.red} style={styles.stat} />
        <View style={styles.rule} />
        <Stat value={count('amber')} label="Watch" tone={colors.amberInk} style={styles.stat} />
        <View style={styles.rule} />
        <Stat value={count('green')} label="Clear" tone={colors.greenInk} style={styles.stat} />
      </Card>

      {open.length === 0 ? (
        <EmptyState text="All clear. No active alerts today." />
      ) : null}

      {groups.map(g => {
        const list = open.filter(a => a.level === g.level);
        if (!list.length) {
          return null;
        }
        return (
          <View key={g.level}>
            <Eyebrow label={g.title} />
            <CardList inset={68}>
              {list.map(a => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  actions={
                    a.level === 'green' ? undefined : (
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
                            onPress={() => escalateAlert(a.id)}
                          />
                        ) : null}
                      </>
                    )
                  }
                />
              ))}
            </CardList>
          </View>
        );
      })}

      {resolved.length ? (
        <>
          <Eyebrow label={`Resolved today · ${resolved.length}`} />
          <CardList inset={14}>
            {resolved.map(a => (
              <ExpandRow
                key={a.id}
                dot={colors.green}
                title={a.title}
                detail={`${canSwitch ? `${a.area} · ` : ''}resolved ${a.resolvedAt} · ${a.resolvedBy}`}>
                <AppText variant="meta" color={colors.inkSoft}>
                  {a.resolutionNote ?? 'No resolution note was written.'}
                </AppText>
              </ExpandRow>
            ))}
          </CardList>
        </>
      ) : null}

      <Eyebrow label="Previous alert logs · last 14 days" />
      {history.length ? (
        <CardList inset={14}>
          {history.map(day => (
            <ExpandRow
              key={day.date}
              title={day.date}
              detail={`${day.items.length} ${day.items.length === 1 ? 'alert' : 'alerts'}`}
              dot={
                day.items.some(i => i.level === 'red')
                  ? colors.red
                  : day.items.some(i => i.level === 'amber')
                  ? colors.amber
                  : colors.green
              }>
              {day.items.map(i => (
                <View key={i.title} style={styles.log}>
                  <AppText variant="bodyRegular">{i.title}</AppText>
                  <AppText variant="meta" color={colors.inkMuted}>
                    {canSwitch ? `${i.area} · ` : ''}
                    {i.time} · {i.by}
                  </AppText>
                  <View style={styles.logTags}>
                    <Pill label={sevLabel[i.level]} tone={sevTone[i.level]} />
                    {i.level === 'green' ? null : (
                      <Pill
                        label={i.resolved ? 'Resolved' : 'Open'}
                        tone={i.resolved ? 'signed' : 'watch'}
                      />
                    )}
                    {i.escalated ? <Pill label="Escalated to CMD" tone="escalated" /> : null}
                  </View>
                </View>
              ))}
            </ExpandRow>
          ))}
        </CardList>
      ) : (
        <AppText variant="meta" color={colors.inkFaint}>
          No alerts were logged in the last 14 days.
        </AppText>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: vs(6) },
  summary: { flexDirection: 'row', marginTop: vs(6) },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
  rule: { width: hairline, backgroundColor: colors.line },
  log: { marginTop: vs(10) },
  logTags: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6), marginTop: vs(6) },
});
