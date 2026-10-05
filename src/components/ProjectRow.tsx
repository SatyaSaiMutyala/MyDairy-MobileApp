import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, Flag, Users } from 'lucide-react-native';
import { priorityLabel, progressColor, projectTone } from '../projects/model';
import type { ApiProject } from '../store/api/projectsApi';
import { shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconText } from './IconText';
import { Pill, priorityTone } from './Pill';
import { ProgressBar } from './ProgressBar';

type Props = { project: ApiProject; onPress: () => void };

// One project in the list, with its progress bar.
export function ProjectRow({ project: p, onPress }: Props) {
  const c = p.milestoneCounts;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.head}>
          <AppText variant="heading" style={styles.title}>
            {p.title}
          </AppText>
          <Pill label={p.statusLabel} tone={projectTone[p.status]} />
        </View>
        <AppText variant="meta" color={colors.inkMuted}>
          {p.categoryLabel} · {p.ownerName}
        </AppText>
        <View style={styles.bar}>
          <ProgressBar value={p.progress} color={progressColor(p.status)} style={styles.track} />
          <AppText variant="metaStrong" color={colors.inkSoft}>
            {p.progress}%
          </AppText>
        </View>
        <View style={styles.meta}>
          <Pill label={priorityLabel(p.priority)} tone={priorityTone(priorityLabel(p.priority))} />
          {p.targetEndDate ? <IconText icon={Calendar} text={`Due ${shortDate(p.targetEndDate)}`} /> : null}
          <IconText icon={Flag} text={`${c.done}/${c.total} milestones`} />
          {c.overdue ? <IconText icon={Flag} text={`${c.overdue} late`} color={colors.redInk} /> : null}
          {p.team.length ? <IconText icon={Users} text={String(p.team.length)} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(14), marginBottom: vs(12) },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  title: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: s(10), marginTop: vs(10) },
  track: { flex: 1 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: s(12),
    rowGap: vs(4),
    marginTop: vs(10),
  },
});
