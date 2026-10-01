import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { DiaryLine } from '../diary/model';
import { realToday, shortDate } from '../utils/dates';
import { colors, fonts, fs, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { Dot } from './Dot';

type Props = {
  meeting: DiaryLine | undefined;
  onPress?: () => void;
};

const tints = [colors.sand, colors.tealTint, colors.fill];
const initials = (name: string) =>
  name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// The next meeting, shown on Home.
export function MeetingCard({ meeting, onPress }: Props) {
  if (!meeting) {
    return (
      <Card style={styles.card}>
        <View style={styles.body}>
          <AppText variant="metaStrong" color={colors.blueInk}>
            Next meeting
          </AppText>
          <AppText variant="body" color={colors.inkMuted} style={styles.title}>
            No meetings coming up.
          </AppText>
        </View>
      </Card>
    );
  }

  const names = [meeting.owner, ...(meeting.attendees.map(a => a.name))];
  const shown = names.slice(0, 2);
  const extra = names.length - shown.length;
  const others = names.length - 1;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.slot}>
          <AppText style={styles.time}>{meeting.time}</AppText>
          <AppText variant="metaStrong" color={colors.blueInk}>
            {meeting.end ? `to ${meeting.end}` : ' '}
          </AppText>
        </View>
        <View style={styles.body}>
          <View style={styles.tag}>
            <Dot color={colors.blue} size={7} />
            <AppText variant="metaStrong" color={colors.blueInk}>
              Next meeting ·{' '}
              {meeting.date === realToday() ? 'today' : shortDate(meeting.date)}
            </AppText>
          </View>
          <AppText variant="heading" style={styles.title}>
            {meeting.title}
          </AppText>
          {meeting.place ? (
            <AppText variant="meta" color={colors.inkMuted}>
              {meeting.place}
            </AppText>
          ) : null}
          <View style={styles.people}>
            {shown.map((n, i) => (
              <Avatar
                key={n}
                label={initials(n)}
                size={24}
                ink={colors.inkSoft}
                bg={tints[i % tints.length]}
                borderColor={colors.surface}
                style={i > 0 ? styles.overlap : undefined}
              />
            ))}
            {extra > 0 ? (
              <Avatar
                label={`+${extra}`}
                size={24}
                ink={colors.inkSoft}
                bg={tints[2]}
                borderColor={colors.surface}
                style={styles.overlap}
              />
            ) : null}
            <AppText
              variant="meta"
              color={colors.inkMuted}
              numberOfLines={1}
              style={styles.names}>
              {others > 0
                ? `${names[0]} and ${others} ${others === 1 ? 'other' : 'others'}`
                : names[0]}
            </AppText>
          </View>
          {meeting.invite === 'pending' ? (
            <AppText variant="metaStrong" color={colors.redInk} style={styles.reply}>
              Awaiting your reply
            </AppText>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    padding: s(10),
    marginTop: vs(10),
  },
  slot: {
    width: s(64),
    alignSelf: 'stretch',
    borderRadius: radius.sm + s(2),
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(6),
  },
  time: {
    fontFamily: fonts.semibold,
    fontSize: fs(17),
    lineHeight: fs(22),
    color: colors.blueInk,
  },
  body: { flex: 1 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  title: { marginTop: vs(1) },
  people: { flexDirection: 'row', alignItems: 'center', marginTop: vs(6) },
  overlap: { marginLeft: -s(8) },
  names: { marginLeft: s(8), flex: 1 },
  reply: { marginTop: vs(4) },
});
