import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Bell,
  Calendar,
  Plus,
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
import { Stat } from '../components/Stat';
import { StatusBarShade } from '../components/StatusBarShade';
import { ShimmerRows } from '../components/Shimmer';
import { TaskRow } from '../components/TaskRow';
import { TealHeader } from '../components/TealHeader';
import { currentUser } from '../data/user';
import { errorMessage } from '../store';
import { GlanceCounts, useHomeSummaryQuery } from '../store/api/homeApi';
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
  'Diary',
  'Meetings',
  'Reminders',
  'Projects',
  'Notices',
] as const;

export function HomeScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const todayDate = todayIso();

  const { meeting } = useNextMeeting();
  const today = useTaskList({ box: 'mine', status: 'today' });
  const [toggleTask] = useToggleTaskMutation();
  const dueToday = today.rows;
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
  const glance = useHomeSummaryQuery().currentData;
  const openModule = (status: 'today' | 'overdue') => (box: keyof GlanceCounts) => {
    if (box === 'tasks') {
      nav.navigate('Tasks', { status });
    } else if (box === 'meetings') {
      nav.navigate('Meetings');
    } else if (box === 'reminders') {
      nav.navigate('Reminders');
    } else {
      nav.navigate('Projects');
    }
  };
  const openAlerts = useAlertList(HOME_ALERTS);
  const alerts = openAlerts.rows;
  const alertCount = openAlerts.counts?.open ?? 0;

  return (
    <View style={styles.root}>
      <StatusBarShade />
      <ScreenScroll padded={false} onRefresh={fresh}>
        <TealHeader arcHeight={vs(250)} topGap={10} style={styles.header}>
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
        </TealHeader>

        <View style={styles.content}>
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
          <GlanceStrip
            title="Due today"
            counts={glance?.dueToday}
            onOpen={openModule('today')}
          />
          <GlanceStrip
            title="Overdue"
            counts={glance?.overdue}
            alert
            onOpen={openModule('overdue')}
            style={styles.gap}
          />

          <MeetingCard
            meeting={meeting}
            onPress={() =>
              meeting && nav.navigate('DiaryEntry', { id: meeting.id })
            }
          />

          <Eyebrow
            label="Due today"
            action={`See all ${remaining}`}
            onAction={() => nav.navigate('Tasks', { status: 'today' })}
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

type StripProps = {
  title: string;
  counts: GlanceCounts | undefined;
  // Numbers above zero are shown in red.
  alert?: boolean;
  onOpen: (box: keyof GlanceCounts) => void;
  style?: object;
};

// One row of four numbers: tasks, meetings, alerts, projects.
function GlanceStrip({ title, counts, alert = false, onOpen, style }: StripProps) {
  const boxes: { key: keyof GlanceCounts; label: string }[] = [
    { key: 'tasks', label: 'Tasks' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'reminders', label: 'Reminders' },
    { key: 'projects', label: 'Projects' },
  ];
  return (
    <View style={style}>
      <AppText variant="metaStrong" color={colors.inkSoft} style={styles.stripTitle}>
        {title}
      </AppText>
      <Card style={styles.glance}>
        {boxes.map((b, i) => {
          const n = counts?.[b.key];
          return (
            <React.Fragment key={b.key}>
              {i ? <View style={styles.glanceRule} /> : null}
              <Pressable style={styles.stat} onPress={() => onOpen(b.key)}>
                <Stat
                  value={n ?? '–'}
                  label={b.label}
                  tone={alert && n ? colors.red : colors.ink}
                />
              </Pressable>
            </React.Fragment>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stripTitle: { marginBottom: vs(6) },
  gap: { marginTop: vs(14) },
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
  content: { paddingHorizontal: space.gutter, paddingTop: vs(14) },
  pair: { flexDirection: 'row', gap: s(12), marginTop: vs(10) },
  pairItem: { flex: 1 },
  glance: { flexDirection: 'row' },
  glanceRule: { width: hairline, backgroundColor: colors.line },
  stat: { flex: 1, paddingHorizontal: s(10), paddingVertical: vs(9) },
});
