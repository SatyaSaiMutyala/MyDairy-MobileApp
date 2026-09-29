import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Pencil, Send, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Divider } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { PhotoStrip } from '../components/PhotoStrip';
import { Pill, PillTone, priorityTone } from '../components/Pill';
import { StarRating } from '../components/StarRating';
import { labelOf, visitStatus } from '../components/VisitCard';
import {
  assessments,
  colleagues,
  followUps,
  observationCategories,
  ratingAreas,
  visitTypes,
} from '../data/mock';
import { currentUser, seesAllDepartments } from '../data/user';
import { useStore } from '../state/Store';
import { longDate, shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const categoryTone: Record<string, PillTone> = {
  positive: 'good',
  concern: 'watch',
  nc_minor: 'high',
  nc_major: 'critical',
  recommendation: 'info',
  improvement: 'teal',
};

export const assigneeName = (id: string) =>
  id === 'me' ? currentUser.name : colleagues.find(c => c.id === id)?.label;

export function VisitDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { visits, submitVisit, reviewVisit, deleteVisit } = useStore();
  const visit = visits.find(v => v.id === route.params?.id);

  if (!visit) {
    return (
      <FormScreen title="Visit">
        <EmptyState text="This visit is no longer available." />
      </FormScreen>
    );
  }

  const admin = seesAllDepartments();
  const owner = visit.owner === currentUser.name || admin;
  const onTeam = visit.team.some(m => m.name === currentUser.name);
  const st = visitStatus[visit.status];
  const rated = ratingAreas.filter(a => visit.ratings[a.id]);

  const remove = () =>
    Alert.alert('Delete this visit permanently?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteVisit(visit.id);
          nav.goBack();
        },
      },
    ]);

  const submit = () =>
    Alert.alert(
      'Submit this visit report?',
      'Action items with assignees will be pushed to their My Tasks. After submitting, the report cannot be edited.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => submitVisit(visit.id) },
      ],
    );

  const footer =
    visit.status === 'draft' && owner ? (
      <View style={styles.actions}>
        <Button
          label="Continue"
          variant="outline"
          iconLeft={Pencil}
          style={styles.action}
          onPress={() => nav.navigate('VisitForm', { id: visit.id })}
        />
        <Button label="Submit" iconLeft={Send} style={styles.action} onPress={submit} />
      </View>
    ) : visit.status === 'submitted' && (owner || onTeam) ? (
      <Button label="Mark reviewed" iconLeft={Check} onPress={() => reviewVisit(visit.id)} />
    ) : undefined;

  return (
    <FormScreen
      title="Visit"
      footer={footer}
      right={
        owner ? (
          <IconButton
            icon={Trash2}
            label="Delete visit"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }>
      <FormCard style={styles.card}>
        <View style={styles.tags}>
          <Pill label={st.label} tone={st.tone} />
          {visit.assessment ? (
            <Pill label={labelOf(assessments, visit.assessment)!} tone="info" />
          ) : null}
        </View>
        <AppText variant="heading" style={styles.title}>
          {visit.title}
        </AppText>
        <AppText variant="meta" color={colors.inkMuted} style={styles.sub}>
          {labelOf(visitTypes, visit.type)} · by {visit.owner}
        </AppText>
        <InfoRow label="Date" value={longDate(visit.date)} />
        <InfoRow
          label="Time"
          value={
            visit.timeIn
              ? visit.timeOut
                ? `${visit.timeIn} – ${visit.timeOut}`
                : `In ${visit.timeIn}`
              : undefined
          }
        />
        <InfoRow label="Submitted" value={visit.submittedOn} />
        <InfoRow label="Reviewed by" value={visit.reviewedBy} />
      </FormCard>

      {visit.status !== 'draft' ? (
        <Notice
          tone="locked"
          title="This report is locked"
          text="Only drafts can be edited."
          style={styles.notice}
        />
      ) : null}

      <FormCard title="Location" style={styles.card}>
        <InfoRow label="Organisation" value={visit.org} />
        <InfoRow label="Branch" value={visit.branch} />
        <InfoRow label="Address" value={visit.address} />
        <InfoRow label="City" value={[visit.city, visit.state].filter(Boolean).join(', ')} />
        <InfoRow label="GPS link" value={visit.gps} />
        <InfoRow
          label="Host"
          value={[visit.hostName, visit.hostTitle].filter(Boolean).join(' · ')}
        />
        <InfoRow label="Host phone" value={visit.hostPhone} />
        <InfoRow label="Host email" value={visit.hostEmail} />
      </FormCard>

      <FormCard title="Team" style={styles.card}>
        <View style={[styles.tags, styles.gapBelow]}>
          {visit.team.map(m => (
            <Pill
              key={m.id}
              label={m.lead ? `${m.name} · lead` : m.name}
              tone={m.lead ? 'teal' : 'low'}
            />
          ))}
        </View>
        <InfoRow label="External" value={visit.external} />
      </FormCard>

      <FormCard title="Purpose & scope" style={styles.card}>
        <InfoRow label="Purpose" value={visit.purpose} />
        <InfoRow label="Scope" value={visit.scope} />
        <InfoRow label="References" value={visit.refs} />
        <InfoRow label="Summary" value={visit.summary} />
        {visit.tags?.length ? (
          <View style={[styles.tags, styles.gapBelow]}>
            {visit.tags.map(tag => (
              <Pill key={tag} label={`#${tag}`} tone="low" />
            ))}
          </View>
        ) : null}
      </FormCard>

      {rated.length ? (
        <FormCard title="Area ratings">
          {rated.map(a => (
            <StarRating key={a.id} label={a.label} value={visit.ratings[a.id]} />
          ))}
        </FormCard>
      ) : null}

      <FormCard title={`Observations · ${visit.observations.length}`} style={styles.card}>
        {visit.observations.length ? (
          visit.observations.map((o, i) => (
            <View key={o.id}>
              {i > 0 ? <Divider style={styles.rule} /> : null}
              <Pill
                label={labelOf(observationCategories, o.category) ?? o.category}
                tone={categoryTone[o.category] ?? 'low'}
              />
              <AppText variant="bodyRegular" style={styles.obs}>
                {o.text}
              </AppText>
              {o.evidence ? (
                <AppText variant="meta" color={colors.inkMuted}>
                  Evidence: {o.evidence}
                </AppText>
              ) : null}
            </View>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No observations recorded.
          </AppText>
        )}
      </FormCard>

      <FormCard title={`Photos · ${visit.photos.length}`} style={styles.card}>
        {visit.photos.length ? (
          <PhotoStrip photos={visit.photos} max={20} locked caption={visit.title} />
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No photographs attached.
          </AppText>
        )}
      </FormCard>

      <FormCard title={`Action items · ${visit.actions.length}`} style={styles.card}>
        {visit.actions.length ? (
          visit.actions.map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider style={styles.rule} /> : null}
              <AppText variant="body">{a.text}</AppText>
              <View style={[styles.tags, styles.obs]}>
                <Pill label={a.priority} tone={priorityTone(a.priority)} />
                <Pill label={a.done ? 'Done' : 'Open'} tone={a.done ? 'signed' : 'watch'} />
                {a.assignee && visit.status !== 'draft' ? (
                  <Pill label="In My Tasks" tone="teal" />
                ) : null}
              </View>
              <AppText variant="meta" color={colors.inkMuted} style={styles.obs}>
                {assigneeName(a.assignee) ?? 'Not assigned'}
                {a.due ? ` · due ${shortDate(a.due)}` : ''}
              </AppText>
            </View>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No action items.
          </AppText>
        )}
      </FormCard>

      <FormCard title="Follow-up" style={styles.card}>
        <InfoRow label="Follow-up" value={labelOf(followUps, visit.followUp)} />
        <InfoRow
          label="Next visit"
          value={visit.nextVisit ? longDate(visit.nextVisit) : undefined}
        />
        <InfoRow label="Remarks" value={visit.remarks} />
        {!visit.followUp && !visit.nextVisit && !visit.remarks ? (
          <AppText variant="meta" color={colors.inkMuted}>
            Nothing recorded.
          </AppText>
        ) : null}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  card: { paddingBottom: vs(14) },
  notice: { marginTop: vs(14) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: s(6) },
  gapBelow: { marginBottom: vs(10) },
  title: { marginTop: vs(10) },
  sub: { marginBottom: vs(12) },
  rule: { marginVertical: vs(12) },
  obs: { marginTop: vs(6) },
});
