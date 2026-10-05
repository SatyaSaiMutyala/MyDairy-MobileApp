import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, ListChecks, Lock, Users } from 'lucide-react-native';
import { outcomeTone } from '../discussions/model';
import type { ApiDiscussion } from '../store/api/discussionsApi';
import { realToday, shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconText } from './IconText';
import { Pill } from './Pill';

type Props = { discussion: ApiDiscussion; onPress: () => void };

// One logged conversation in the list.
export function DiscussionRow({ discussion: d, onPress }: Props) {
  const open = d.followUps.filter(f => !f.done).length;
  const day = d.date ? (d.date === realToday() ? 'Today' : shortDate(d.date)) : '';
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.head}>
          <AppText variant="heading" style={styles.title}>
            {d.title}
          </AppText>
          <Pill label={d.outcomeLabel} tone={outcomeTone[d.outcome]} />
        </View>
        <AppText variant="meta" color={colors.inkMuted}>
          {d.typeLabel}
          {d.isOwner ? '' : ` · ${d.ownerName}`}
        </AppText>
        {d.summary ? (
          <AppText variant="bodyRegular" color={colors.inkSoft} numberOfLines={2} style={styles.summary}>
            {d.summary}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <IconText icon={Calendar} text={d.time ? `${day} · ${d.time}` : day} />
          {d.with.length ? (
            <IconText icon={Users} text={d.with.map(w => w.name).join(', ')} />
          ) : null}
          {open ? <IconText icon={ListChecks} text={`${open} to follow up`} color={colors.amberInk} /> : null}
          {d.privacy === 'private' ? <IconText icon={Lock} text="Private" /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(14), marginBottom: vs(12) },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  title: { flex: 1 },
  summary: { marginTop: vs(6) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(8),
  },
});
