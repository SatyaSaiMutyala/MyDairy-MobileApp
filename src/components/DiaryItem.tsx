import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import type { DiaryKind } from '../data/mock';
import { currentUser } from '../data/user';
import type { DiaryLine } from '../state/views';
import { colors, hairline, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Dot } from './Dot';
import { IconText } from './IconText';
import { Pill, PillTone } from './Pill';

export const diaryKinds: Record<DiaryKind, { label: string; ink: string; tone: PillTone }> = {
  appointment: { label: 'Appointment', ink: colors.tealDeep, tone: 'teal' },
  focus: { label: 'Focus', ink: colors.greenInk, tone: 'good' },
  reminder: { label: 'Reminder', ink: colors.amberInk, tone: 'watch' },
  event: { label: 'Event', ink: colors.redInk, tone: 'critical' },
  meeting: { label: 'Meeting', ink: colors.blueInk, tone: 'info' },
};


type Props = {
  line: DiaryLine;
  last: boolean;
  onPress: () => void;
};

export function DiaryItem({ line, last, onPress }: Props) {
  const k = diaryKinds[line.kind];
  const waiting = line.invite === 'pending';
  return (
    <View style={styles.entry}>
      <View style={styles.rail}>
        <AppText variant="metaStrong" color={colors.inkSoft} style={styles.time}>
          {line.time}
        </AppText>
        <Dot color={k.ink} size={9} hollow={waiting} style={styles.node} />
        {last ? null : <View style={styles.thread} />}
      </View>
      <Pressable style={styles.press} onPress={onPress}>
        <Card style={[styles.card, waiting && styles.waiting]}>
          <View style={styles.tags}>
            <Pill label={k.label} tone={k.tone} />
            {waiting ? <Pill label="Awaiting your reply" tone="escalated" /> : null}
            {line.invite === 'tentative' ? <Pill label="Maybe" tone="watch" /> : null}
            {line.source ? <Pill label={line.source} tone="low" /> : null}
          </View>
          <AppText variant="body" style={styles.title}>
            {line.title}
          </AppText>
          {line.owner !== currentUser.name && !line.invite ? (
            <AppText variant="metaStrong" color={colors.inkSoft}>
              {line.owner}
            </AppText>
          ) : null}
          <AppText variant="meta" color={colors.inkMuted} numberOfLines={2}>
            {line.body}
          </AppText>
          {line.place || line.attendees?.length ? (
            <View style={styles.meta}>
              {line.place ? <IconText icon={MapPin} text={line.place} /> : null}
              {line.attendees?.length ? (
                <IconText icon={Users} text={String(line.attendees.length)} />
              ) : null}
            </View>
          ) : null}
        </Card>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: { flexDirection: 'row', gap: s(12) },
  rail: { width: s(48), alignItems: 'center', paddingTop: vs(14) },
  time: { textAlign: 'center' },
  node: { marginTop: vs(8) },
  thread: {
    flex: 1,
    width: hairline * 2,
    marginTop: vs(6),
    backgroundColor: colors.line,
  },
  press: { flex: 1 },
  card: { padding: s(14), marginBottom: vs(12) },
  waiting: { borderStyle: 'dashed', borderColor: colors.inkFaint },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  title: { marginTop: vs(8), marginBottom: vs(2) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(8),
  },
});
