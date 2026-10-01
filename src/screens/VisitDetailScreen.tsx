import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Pencil, Send, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { Divider } from '../components/Card';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { PhotoStrip } from '../components/PhotoStrip';
import { Pill, PillTone, priorityTone } from '../components/Pill';
import { StarRating } from '../components/StarRating';
import { labelOf, visitStatus } from '../components/VisitCard';
import { ShimmerRows } from '../components/Shimmer';
import { errorMessage } from '../store';
import {
  useDeleteVisitMutation,
  useFinishVisitActionMutation,
  useReviewVisitMutation,
  useSubmitVisitMutation,
  useVisitQuery,
} from '../store/api/visitsApi';
import {
  assessments,
  followUps,
  observationCategories,
  ratingAreas,
  toVisit,
  visitTypes,
} from '../visits/model';
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

export function VisitDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const query = useVisitQuery(route.params?.id);
  const [submitCall, submitting] = useSubmitVisitMutation();
  const [reviewCall, reviewing] = useReviewVisitMutation();
  const [destroy, deleting] = useDeleteVisitMutation();
  const [finish, finishing] = useFinishVisitActionMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Visit">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : (
          <FormCard style={styles.card}>
            <ShimmerRows rows={4} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const visit = toVisit(query.data);
  const failure =
    submitting.error ?? reviewing.error ?? deleting.error ?? finishing.error;
  const st = visitStatus[visit.status];
  const rated = ratingAreas.filter(a => visit.ratings[a.id]);

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this visit permanently?',
      text: 'Its observations, photos and action items go with it.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(visit.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  const submit = async () => {
    const yes = await confirm({
      title: 'Submit this visit report?',
      text: 'Action items with assignees will be pushed to their My Tasks. After submitting, the report cannot be edited.',
      confirmLabel: 'Submit',
    });
    if (yes) {
      submitCall(visit.id);
    }
  };

  const footer = visit.canEdit ? (
    <View style={styles.actions}>
      <Button
        label="Continue"
        variant="outline"
        iconLeft={Pencil}
        style={styles.action}
        onPress={() => nav.navigate('VisitForm', { id: visit.id })}
      />
      <Button
        label={submitting.isLoading ? 'Submitting…' : 'Submit'}
        iconLeft={Send}
        style={styles.action}
        disabled={submitting.isLoading}
        onPress={submit}
      />
    </View>
  ) : visit.canReview ? (
    <Button
      label={reviewing.isLoading ? 'Saving…' : 'Mark reviewed'}
      iconLeft={Check}
      disabled={reviewing.isLoading}
      onPress={() => reviewCall(visit.id)}
    />
  ) : undefined;

  return (
    <FormScreen
      title="Visit"
      footer={footer}
      right={
        visit.canDelete ? (
          <IconButton
            icon={Trash2}
            label="Delete visit"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.notice}
        />
      ) : null}
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
        <InfoRow
          label="City"
          value={[visit.city, visit.state].filter(Boolean).join(', ')}
        />
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
              key={m.key}
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
        {visit.tags.length ? (
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
            <StarRating
              key={a.id}
              label={a.label}
              value={visit.ratings[a.id]}
            />
          ))}
        </FormCard>
      ) : null}

      <FormCard
        title={`Observations · ${visit.observations.length}`}
        style={styles.card}
      >
        {visit.observations.length ? (
          visit.observations.map((o, i) => (
            <View key={o.key}>
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
          <PhotoStrip
            photos={visit.photos}
            max={20}
            locked
            caption={visit.title}
          />
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No photographs attached.
          </AppText>
        )}
      </FormCard>

      <FormCard
        title={`Action items · ${visit.actions.length}`}
        style={styles.card}
      >
        {visit.actions.length ? (
          visit.actions.map((a, i) => (
            <View key={a.key}>
              {i > 0 ? <Divider style={styles.rule} /> : null}
              <AppText variant="body">{a.text}</AppText>
              <View style={[styles.tags, styles.obs]}>
                <Pill label={a.priority} tone={priorityTone(a.priority)} />
                <Pill
                  label={a.done ? 'Done' : 'Open'}
                  tone={a.done ? 'signed' : 'watch'}
                />
                {a.taskId ? <Pill label="In My Tasks" tone="teal" /> : null}
              </View>
              <AppText
                variant="meta"
                color={colors.inkMuted}
                style={styles.obs}
              >
                {a.assignee || 'Not assigned'}
                {a.due ? ` · due ${shortDate(a.due)}` : ''}
              </AppText>
              {!a.done && a.serverId && visit.status !== 'draft' ? (
                <Button
                  label="Mark done"
                  size="sm"
                  variant="secondary"
                  disabled={finishing.isLoading}
                  onPress={() => finish(a.serverId!)}
                  style={styles.done}
                />
              ) : null}
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
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  card: { paddingBottom: vs(14) },
  notice: { marginTop: vs(14) },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
  },
  gapBelow: { marginBottom: vs(10) },
  title: { marginTop: vs(10) },
  sub: { marginBottom: vs(12) },
  rule: { marginVertical: vs(12) },
  obs: { marginTop: vs(6) },
  done: { alignSelf: 'flex-start', marginTop: vs(8) },
});
