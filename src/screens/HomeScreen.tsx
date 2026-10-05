import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ArrowRight,
  Bell,
  Calendar,
  ClipboardCheck,
  Moon,
  NotebookPen,
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
import { StatusBarShade } from '../components/StatusBarShade';
import { ShimmerRows } from '../components/Shimmer';
import { TaskRow } from '../components/TaskRow';
import { TealHeader } from '../components/TealHeader';
import { currentUser } from '../data/user';
import { dueBy, Phase } from '../lab/model';
import { useLabUnit } from '../lab/useLabUnit';
import { errorMessage, useAppSelector } from '../store';
import { useActivityDayQuery } from '../store/api/activityApi';
import { useLabStateQuery } from '../store/api/labApi';
import { todayIso } from '../store/slices/labSlice';
import { useNextMeeting } from '../diary/useDiary';
import { useToggleTaskMutation } from '../store/api/tasksApi';
import { useTaskList } from '../tasks/useTaskList';
import { useAlertList } from '../alerts/useAlertList';
import { useUnreadCountQuery } from '../store/api/notificationsApi';
import { fullDate, greeting } from '../utils/dates';
import { useFresh } from '../store/useFresh';
import {
  colors,
  fonts,
  fs,
  hairline,
  ms,
  radius,
  s,
  space,
  vs,
} from '../theme';

// Today's open alerts.
const HOME_ALERTS = { status: 'open' } as const;

// What this screen shows; fetched again when it comes back into view.
const FRESH = [
  'Tasks',
  'Alerts',
  'LabState',
  'Activity',
  'Diary',
  'Notices',
] as const;

export function HomeScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  // Older saved sign-ins have no flag yet: show the lab until the next sign-in.
  const lab = useAppSelector(st => st.session.user?.lab ?? true);
  const { unit } = useLabUnit();
  // Everyone else signs off a daily activity log; admin and CMD have both.
  const activity = useAppSelector(
    st => !(st.session.user?.lab ?? true) || !!st.session.user?.sees_all,
  );
  const activityDay = useActivityDayQuery({}, { skip: !activity });
  const activityState = activityDay.data?.state;
  const todayDate = todayIso();
  const openingState = useLabStateQuery(
    { unit: unit?.key ?? '', date: todayDate, phase: 'opening' },
    { skip: !unit || !lab },
  );
  const closingState = useLabStateQuery(
    { unit: unit?.key ?? '', date: todayDate, phase: 'closing' },
    { skip: !unit || !lab },
  );

  const shift = (phase: Phase) => {
    const data = phase === 'opening' ? openingState.data : closingState.data;
    if (data?.run?.signed) {
      return {
        signed: true,
        state: 'Signed',
        detail: `${data.run.signedAt?.split(', ')[1] ?? data.run.signedAt} · ${
          data.run.signedBy
        }`,
      };
    }
    if (data?.run) {
      const done = data.summary.total - data.summary.pending;
      return {
        signed: false,
        state: 'In progress',
        detail: `${done} of ${data.summary.total} complete`,
      };
    }
    return {
      signed: false,
      state: 'Not started',
      detail: `Due by ${dueBy[phase]}`,
    };
  };
  const opening = shift('opening');
  const closing = shift('closing');

  const { meeting } = useNextMeeting();
  const today = useTaskList({ box: 'mine', status: 'today' });
  const [toggleTask] = useToggleTaskMutation();
  const dueToday = today.rows;
  const overdue = today.counts?.overdue ?? 0;
  const remaining = today.counts?.today ?? 0;
  // The bell: asked again every minute, and whenever Home comes back in view.
  const notices = useUnreadCountQuery(undefined, { pollingInterval: 60000 });
  const unread = notices.data ?? 0;
  const refetchNotices = notices.refetch;
  useFocusEffect(
    useCallback(() => {
      refetchNotices();
    }, [refetchNotices]),
  );
  const openAlerts = useAlertList(HOME_ALERTS);
  const alerts = openAlerts.rows;
  const alertCount = openAlerts.counts?.open ?? 0;
  const redAlerts = openAlerts.counts?.red ?? 0;

  return (
    <View style={styles.root}>
      <StatusBarShade />
      <ScreenScroll padded={false} onRefresh={fresh}>
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
              accessibilityLabel={`Notifications, ${unread} unread`}
              onPress={() => nav.navigate('Notifications')}
            >
              <IconTile size={44} bg={colors.tealShade}>
                <Bell size={s(21)} color={colors.white} strokeWidth={1.75} />
              </IconTile>
              {unread ? (
                <View style={styles.bellCount}>
                  <AppText style={styles.bellCountText}>
                    {unread > 99 ? '99+' : unread}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => nav.navigate('More')}
              accessibilityLabel="Your profile"
            >
              <Avatar
                label={currentUser.initials}
                size={44}
                borderColor={colors.tealLine}
              />
            </Pressable>
          </View>

          <AppText
            variant="body"
            color={colors.onTealSoft}
            style={styles.greeting}
          >
            {greeting()}
          </AppText>
          <AppText variant="title" color={colors.white} style={styles.name}>
            {currentUser.name}
          </AppText>
          <IconText
            icon={Calendar}
            text={fullDate(todayDate)}
            variant="label"
            iconSize={16}
            gap={8}
            color={colors.white}
            iconColor={colors.onTealSoft}
            style={styles.date}
          />

          {lab ? (
            <>
              <AppText
                variant="eyebrow"
                color={colors.onTealSoft}
                style={styles.headEyebrow}
              >
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
            </>
          ) : null}
        </TealHeader>

        <View style={styles.content}>
          {lab ? (
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
                nav.navigate('Lab', {
                  shift: opening.signed ? 'closing' : 'opening',
                })
              }
              leading={
                <IconTile size={32} bg={colors.yellowInk}>
                  <ClipboardCheck
                    size={s(17)}
                    color={colors.yellow}
                    strokeWidth={1.9}
                  />
                </IconTile>
              }
            />
          ) : null}

          {activity ? (
            <Button
              label={
                activityState === 'signed' || activityState === 'late'
                  ? 'Activity log signed off'
                  : activityState === 'overdue'
                  ? 'Activity log overdue · sign off now'
                  : activityDay.data?.log
                  ? "Continue today's activity log"
                  : "Write today's activity log"
              }
              spread
              iconRight={ArrowRight}
              onPress={() => nav.navigate('Activity')}
              leading={
                <IconTile size={32} bg={colors.yellowInk}>
                  <NotebookPen
                    size={s(17)}
                    color={colors.yellow}
                    strokeWidth={1.9}
                  />
                </IconTile>
              }
              style={lab ? styles.second : undefined}
            />
          ) : null}

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
              value={alertCount}
              label={`Alerts · ${redAlerts} red`}
              style={styles.stat}
            />
          </Card>

          <MeetingCard
            meeting={meeting}
            onPress={() =>
              meeting && nav.navigate('DiaryEntry', { id: meeting.id })
            }
          />

          <Eyebrow
            label="Due today"
            action={`See all ${remaining}`}
            onAction={() => nav.navigate('Tasks')}
          />
          {today.firstLoad ? (
            <Card>
              <ShimmerRows rows={3} />
            </Card>
          ) : dueToday.length ? (
            <CardList inset={54}>
              {dueToday.slice(0, 3).map(t => (
                <TaskRow
                  key={t.id}
                  task={t}
                  checked={t.done}
                  onToggle={() => toggleTask(t.id)}
                  onOpen={() => nav.navigate('TaskDetail', { id: t.id })}
                />
              ))}
            </CardList>
          ) : (
            <Card style={styles.none}>
              <AppText variant="body" color={colors.inkMuted}>
                {today.failed
                  ? errorMessage(today.error)
                  : 'Nothing due today.'}
              </AppText>
            </Card>
          )}

          <Eyebrow
            label="Open alerts"
            action={`See all ${alertCount}`}
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
  none: { paddingHorizontal: s(16), paddingVertical: vs(16) },
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
  second: { marginTop: vs(10) },
  pairItem: { flex: 1 },
  glance: { flexDirection: 'row' },
  glanceRule: { width: hairline, backgroundColor: colors.line },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
});
