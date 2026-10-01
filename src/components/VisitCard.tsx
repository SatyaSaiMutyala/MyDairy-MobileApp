import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { assessments, Visit, visitTypes } from '../visits/model';
import { longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconText } from './IconText';
import { PhotoChip } from './PhotoChip';
import { Pill, PillTone } from './Pill';

export const visitStatus: Record<
  Visit['status'],
  { label: string; tone: PillTone }
> = {
  draft: { label: 'Draft', tone: 'low' },
  submitted: { label: 'Submitted', tone: 'teal' },
  reviewed: { label: 'Reviewed', tone: 'signed' },
  closed: { label: 'Closed', tone: 'signed' },
};

export const labelOf = (list: { id: string; label: string }[], id?: string) =>
  list.find(x => x.id === id)?.label;

export const visitCounts = (visit: Visit) => {
  const count = (...cats: string[]) =>
    visit.observations.filter(o => cats.includes(o.category)).length;
  return {
    positive: count('positive'),
    concerns: count('concern', 'improvement', 'recommendation'),
    ncs: count('nc_minor', 'nc_major'),
    openActions: visit.actions.filter(a => !a.done).length,
  };
};

type Props = { visit: Visit; onPress?: () => void };

export function VisitCard({ visit, onPress }: Props) {
  const st = visitStatus[visit.status];
  const n = visitCounts(visit);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.head}>
          <AppText variant="heading" style={styles.title}>
            {visit.title}
          </AppText>
          <Pill label={st.label} tone={st.tone} />
        </View>
        <AppText variant="meta" color={colors.inkMuted}>
          {[labelOf(visitTypes, visit.type), visit.org]
            .filter(Boolean)
            .join(' · ')}
        </AppText>

        <View style={styles.meta}>
          <IconText icon={Calendar} text={longDate(visit.date)} />
          {visit.city ? <IconText icon={MapPin} text={visit.city} /> : null}
          {visit.timeIn ? (
            <IconText
              icon={Clock}
              text={
                visit.timeOut
                  ? `${visit.timeIn}–${visit.timeOut}`
                  : visit.timeIn
              }
            />
          ) : null}
          {visit.team.length ? (
            <IconText
              icon={Users}
              text={visit.team.map(m => m.name).join(', ')}
            />
          ) : null}
        </View>

        {visit.summary || visit.purpose ? (
          <AppText
            variant="bodyRegular"
            color={colors.inkSoft}
            numberOfLines={2}
          >
            {visit.summary ?? visit.purpose}
          </AppText>
        ) : null}

        <View style={styles.tags}>
          {visit.assessment ? (
            <Pill label={labelOf(assessments, visit.assessment)!} tone="info" />
          ) : null}
          {n.positive ? (
            <Pill label={`${n.positive} positive`} tone="good" />
          ) : null}
          {n.concerns ? (
            <Pill label={`${n.concerns} concerns`} tone="watch" />
          ) : null}
          {n.ncs ? <Pill label={`${n.ncs} NC`} tone="critical" /> : null}
          {n.openActions ? (
            <Pill label={`${n.openActions} open actions`} tone="high" />
          ) : null}
          {visit.photos.length ? (
            <PhotoChip count={visit.photos.length} disabled />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(14), marginBottom: vs(12) },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  title: { flex: 1 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(10),
  },
});
