import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowRight,
  Bell,
  Calendar,
  ClipboardCheck,
  Moon,
  Plus,
  Sun,
  TriangleAlert,
} from 'lucide-react-native';
import { AlertRow } from '../components/AlertRow';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { Eyebrow } from '../components/Eyebrow';
import { IconText } from '../components/IconText';
import { IconTile } from '../components/IconTile';
import { LogoMark } from '../components/Logo';
import { MeetingCard } from '../components/MeetingCard';
import { ScreenScroll } from '../components/ScreenScroll';
import { ShiftCard } from '../components/ShiftCard';
import { Stat } from '../components/Stat';
import { TaskRow } from '../components/TaskRow';
import { TealHeader } from '../components/TealHeader';
import { today } from '../data/mock';
import { currentUser, seesAllDepartments } from '../data/user';
import { dueBy, HOME_UNIT, Phase, TODAY } from '../data/labReadiness';
import { recordKey, summarise, useLab } from '../state/LabStore';
import { useStore } from '../state/Store';
import { useNextMeeting, useVisibleTasks } from '../state/views';
import { colors, fonts, fs, hairline, ms, radius, s, space, vs } from '../theme';

export function HomeScreen() {
  const nav = useNavigation<any>();
  const store = useStore();
  const lab = useLab();

  const shift = (phase: Phase) => {
    const record = lab.records[recordKey(HOME_UNIT, TODAY, phase)];
    const totals = summarise(phase, record);
    if (record?.signed) {
      return {
        signed: true,
        state: 'Signed',
        detail: `${record.signed.at} · ${record.signed.by}`,
      };
    }
    return record
      ? {
          signed: false,
          state: 'In progress',
          detail: `${totals.complete} of ${totals.total} complete`,
        }
      : { signed: false, state: 'Not started', detail: `Due by ${dueBy[phase]}` };
  };
  const opening = shift('opening');
  const closing = shift('closing');

  const meeting = useNextMeeting();
  const dueToday = useVisibleTasks().filter(
    t => t.bucket === 'today' && !t.from && !t.escalatedTo,
  );
  const overdue = dueToday.filter(t => t.overdue && !t.done).length;
  const remaining = dueToday.filter(t => !t.done).length;
  const alerts = store.alerts.filter(
    a => !a.resolved && (seesAllDepartments() || a.dept === currentUser.deptKey),
  );
  const redAlerts = alerts.filter(a => a.level === 'red').length;

  return (
    <View style={styles.root}>
      <ScreenScroll padded={false}>
        <TealHeader arcHeight={vs(330)} topGap={10} style={styles.header}>
          <View style={styles.topRow}>
            <IconTile size={40} bg={colors.white}>
              <LogoMark size={26} />
            </IconTile>
            <View style={styles.unit}>
              <AppText variant="meta" color={colors.onTealSoft}>
                {currentUser.unit}
              </AppText>
              <AppText variant="label" color={colors.white}>
                {currentUser.department}
              </AppText>
            </View>
            <Pressable
              accessibilityLabel={`Alerts, ${alerts.length} open`}
              onPress={() => nav.navigate('Alerts')}>
              <IconTile size={44} bg={colors.tealShade}>
                <Bell size={s(21)} color={colors.white} strokeWidth={1.75} />
              </IconTile>
              <View style={styles.bellCount}>
                <AppText style={styles.bellCountText}>{alerts.length}</AppText>
              </View>
            </Pressable>
            <Pressable
              onPress={() => nav.navigate('More')}
              accessibilityLabel="Your profile">
              <Avatar
                label={currentUser.initials}
                size={44}
                borderColor={colors.tealLine}
              />
            </Pressable>
          </View>

          <AppText variant="body" color={colors.onTealSoft} style={styles.greeting}>
            {today.greeting}
          </AppText>
          <AppText variant="title" color={colors.white} style={styles.name}>
            {currentUser.name}
          </AppText>
          <IconText
            icon={Calendar}
            text={today.long}
            variant="label"
            iconSize={16}
            gap={8}
            color={colors.white}
            iconColor={colors.onTealSoft}
            style={styles.date}
          />

          <AppText variant="eyebrow" color={colors.onTealSoft} style={styles.headEyebrow}>
            LAB CHECKLISTS TODAY
          </AppText>
          <View style={styles.shiftRow}>
            <ShiftCard
              icon={Sun}
              name="Opening"
              state={opening.state}
              detail={opening.detail}
              signed={opening.signed}
              onPress={() => nav.navigate('Lab', { shift: 'opening' })}
            />
            <ShiftCard
              icon={Moon}
              name="Closing"
              state={closing.state}
              detail={closing.detail}
              signed={closing.signed}
              onPress={() => nav.navigate('Lab', { shift: 'closing' })}
            />
          </View>
        </TealHeader>

        <View style={styles.content}>
          <Button
            label={
              opening.signed && closing.signed
                ? 'View lab checklist'
                : opening.state === 'Not started'
                ? 'Start lab checklist'
                : 'Continue lab checklist'
            }
            spread
            iconRight={ArrowRight}
            onPress={() =>
              nav.navigate('Lab', { shift: opening.signed ? 'closing' : 'opening' })
            }
            leading={
              <IconTile size={36} bg={colors.yellowInk}>
                <ClipboardCheck size={s(19)} color={colors.yellow} strokeWidth={1.9} />
              </IconTile>
            }
          />

          <View style={styles.pair}>
            <Button
              label="Raise alert"
              variant="outline"
              size="md"
              iconLeft={TriangleAlert}
              iconColor={colors.red}
              onPress={() => nav.navigate('RaiseAlert')}
              style={styles.pairItem}
            />
            <Button
              label="Add task"
              variant="outline"
              size="md"
              iconLeft={Plus}
              iconColor={colors.teal}
              onPress={() => nav.navigate('TaskForm')}
              style={styles.pairItem}
            />
          </View>

          <Eyebrow label="At a glance" />
          <Card style={styles.glance}>
            <Stat value={remaining} label="Due today" style={styles.stat} />
            <View style={styles.glanceRule} />
            <Stat
              value={overdue}
              label="Overdue"
              tone={overdue ? colors.red : colors.ink}
              style={styles.stat}
            />
            <View style={styles.glanceRule} />
            <Stat
              value={alerts.length}
              label={`Alerts · ${redAlerts} red`}
              style={styles.stat}
            />
          </Card>

          <MeetingCard
            meeting={meeting}
            onPress={() => meeting && nav.navigate('DiaryEntry', { id: meeting.id })}
          />

          <Eyebrow
            label="Due today"
            action={`See all ${dueToday.length}`}
            onAction={() => nav.navigate('Tasks')}
          />
          <CardList inset={54}>
            {dueToday.slice(0, 3).map(t => (
              <TaskRow
                key={t.id}
                task={t}
                checked={!!t.done}
                onToggle={() => store.toggleTask(t.id)}
                onOpen={() => nav.navigate('TaskDetail', { id: t.id })}
              />
            ))}
          </CardList>

          <Eyebrow
            label="Open alerts"
            action={`See all ${alerts.length}`}
            onAction={() => nav.navigate('Alerts')}
          />
          <CardList inset={68}>
            {alerts.slice(0, 3).map(a => (
              <AlertRow key={a.id} alert={a} />
            ))}
          </CardList>
        </View>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  header: { paddingBottom: vs(18) },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  unit: { flex: 1 },
  bellCount: {
    position: 'absolute',
    top: -vs(3),
    right: -s(3),
    minWidth: s(19),
    height: s(19),
    paddingHorizontal: s(4),
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
    borderWidth: ms(2, 0.2),
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCountText: {
    fontFamily: fonts.bold,
    fontSize: fs(10),
    lineHeight: fs(14),
    color: colors.yellowInk,
  },
  greeting: { marginTop: vs(14) },
  name: { fontSize: fs(27), lineHeight: fs(34) },
  date: { marginTop: vs(4) },
  headEyebrow: { marginTop: vs(16), marginBottom: vs(8) },
  shiftRow: { flexDirection: 'row', gap: s(10) },
  content: { paddingHorizontal: space.gutter, paddingTop: vs(14) },
  pair: { flexDirection: 'row', gap: s(12), marginTop: vs(10) },
  pairItem: { flex: 1 },
  glance: { flexDirection: 'row' },
  glanceRule: { width: hairline, backgroundColor: colors.line },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
});
