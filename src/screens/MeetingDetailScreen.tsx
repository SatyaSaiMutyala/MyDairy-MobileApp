import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Pencil, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Divider } from '../components/Card';
import { useConfirm } from '../components/ConfirmDialog';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill, priorityTone } from '../components/Pill';
import { ShimmerRows } from '../components/Shimmer';
import {
  agendaTone,
  attendanceTone,
  minutesLabel,
  statusTone,
  whenLabel,
} from '../meetings/model';
import { priorityLabel } from '../projects/model';
import { errorMessage } from '../store';
import {
  useCompleteMeetingMutation,
  useDeleteMeetingMutation,
  useFinishMeetingActionMutation,
  useMeetingQuery,
} from '../store/api/meetingsApi';
import { useFresh } from '../store/useFresh';
import { describe } from '../utils/recur';
import { longDate, shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const FRESH = ['Meeting'] as const;

export function MeetingDetailScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const fresh = useFresh(FRESH);
  const query = useMeetingQuery(id);
  const [complete, completing] = useCompleteMeetingMutation();
  const [destroy, deleting] = useDeleteMeetingMutation();
  const [finish, finishing] = useFinishMeetingActionMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Meeting">
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

  const m = query.data;
  const failure = completing.error ?? deleting.error ?? finishing.error;

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this meeting?',
      text: "Its agenda, minutes and action items go with it, and it leaves the attendees' diaries.",
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(m.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  const close = async () => {
    const owed = m.actions.filter(a => a.assigneeId && !a.taskId).length;
    const yes = await confirm({
      title: 'Mark this meeting complete?',
      text:
        (owed
          ? `${owed} action ${
              owed === 1 ? 'item goes' : 'items go'
            } to the assignees' My Tasks. `
          : '') +
        (m.recurring ? 'The next meeting in the series is booked.' : ''),
      confirmLabel: 'Complete',
    });
    if (yes) {
      complete(m.id);
    }
  };

  return (
    <FormScreen
      title="Meeting"
      onRefresh={fresh}
      right={
        m.mineToEdit ? (
          <IconButton
            icon={Trash2}
            label="Delete meeting"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }
      footer={
        m.mineToEdit ? (
          <View style={styles.actions}>
            <Button
              label={m.status === 'completed' ? 'Edit minutes' : 'Edit'}
              variant={m.mineToComplete ? 'outline' : 'primary'}
              iconLeft={Pencil}
              style={styles.action}
              onPress={() => nav.navigate('MeetingForm', { id: m.id })}
            />
            {m.mineToComplete ? (
              <Button
                label={completing.isLoading ? 'Saving…' : 'Complete'}
                iconLeft={Check}
                style={styles.action}
                disabled={completing.isLoading}
                onPress={close}
              />
            ) : null}
          </View>
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
          <Pill label={m.statusLabel} tone={statusTone[m.status]} />
          <Pill label={m.typeLabel} tone="low" />
          {m.recurring ? (
            <Pill label={describe(m.recurring)} tone="teal" />
          ) : null}
        </View>
        <AppText variant="heading" style={styles.title}>
          {m.title}
        </AppText>
        <InfoRow label="Organiser" value={m.organiserName} />
        <InfoRow label="When" value={whenLabel(m)} />
        <InfoRow label="Duration" value={minutesLabel(m.duration)} />
        <InfoRow
          label="Where"
          value={
            m.location ? `${m.location} · ${m.locationType}` : m.locationType
          }
        />
        <InfoRow label="Context" value={m.context} />
        <InfoRow label="Quorum" value={m.quorum} />
        <InfoRow label="Recorded by" value={m.recordedBy} />
        {m.completedAt ? (
          <InfoRow label="Completed" value={m.completedAt} />
        ) : null}
      </FormCard>

      <FormCard title={`Attendees · ${m.attendees.length}`} style={styles.card}>
        {m.attendees.length ? (
          m.attendees.map(a => (
            <View key={a.id} style={styles.person}>
              <View style={styles.personText}>
                <AppText variant="bodyRegular">{a.name}</AppText>
                {a.role ? (
                  <AppText variant="meta" color={colors.inkMuted}>
                    {a.role}
                  </AppText>
                ) : null}
              </View>
              <Pill label={a.attendance} tone={attendanceTone[a.attendance]} />
            </View>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            Nobody added yet.
          </AppText>
        )}
      </FormCard>

      <FormCard title={`Agenda · ${m.agenda.length}`} style={styles.card}>
        {m.agenda.length ? (
          m.agenda.map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider style={styles.rule} /> : null}
              <View style={styles.tags}>
                <Pill label={a.typeLabel} tone={agendaTone[a.type] ?? 'low'} />
                <AppText variant="meta" color={colors.inkMuted}>
                  {[a.owner, a.duration ? minutesLabel(a.duration) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </AppText>
              </View>
              <AppText variant="body" style={styles.line}>
                {i + 1}. {a.title}
              </AppText>
              {a.notes ? (
                <AppText
                  variant="meta"
                  color={colors.inkSoft}
                  style={styles.line}
                >
                  {a.notes}
                </AppText>
              ) : null}
              {a.minutesNotes ? (
                <AppText
                  variant="meta"
                  color={colors.tealDeep}
                  style={styles.line}
                >
                  Minutes: {a.minutesNotes}
                </AppText>
              ) : null}
            </View>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No agenda items.
          </AppText>
        )}
      </FormCard>

      {m.decisions.length ? (
        <FormCard title="Decisions" style={styles.card}>
          {m.decisions.map((d, i) => (
            <AppText key={i} variant="bodyRegular" style={styles.line}>
              • {d}
            </AppText>
          ))}
        </FormCard>
      ) : null}

      <FormCard
        title={`Action items · ${m.actions.length}`}
        style={styles.card}
      >
        {m.actions.length ? (
          m.actions.map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider style={styles.rule} /> : null}
              <AppText variant="body">{a.text}</AppText>
              <View style={[styles.tags, styles.line]}>
                <Pill
                  label={priorityLabel(a.priority)}
                  tone={priorityTone(priorityLabel(a.priority))}
                />
                <Pill
                  label={a.done ? 'Done' : 'Open'}
                  tone={a.done ? 'signed' : 'watch'}
                />
                {a.taskId ? <Pill label="In My Tasks" tone="teal" /> : null}
              </View>
              <AppText
                variant="meta"
                color={colors.inkMuted}
                style={styles.line}
              >
                {a.assignee || 'Not assigned'}
                {a.due ? ` · due ${shortDate(a.due)}` : ''}
              </AppText>
              {a.mineToFinish ? (
                <Button
                  label="Mark done"
                  size="sm"
                  variant="secondary"
                  disabled={finishing.isLoading}
                  onPress={() => finish(a.id)}
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

      {m.parkingLot.length ? (
        <FormCard title="Parking lot" style={styles.card}>
          {m.parkingLot.map((p, i) => (
            <AppText key={i} variant="bodyRegular" style={styles.line}>
              • {p}
            </AppText>
          ))}
        </FormCard>
      ) : null}

      {m.nextMeeting.date || m.nextMeeting.agenda || m.remarks ? (
        <FormCard title="Next meeting & remarks" style={styles.card}>
          <InfoRow
            label="Next meeting"
            value={
              m.nextMeeting.date
                ? `${longDate(m.nextMeeting.date)}${
                    m.nextMeeting.time ? ` · ${m.nextMeeting.time}` : ''
                  }`
                : undefined
            }
          />
          <InfoRow label="Agenda" value={m.nextMeeting.agenda} />
          <InfoRow label="Remarks" value={m.remarks} />
        </FormCard>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  card: { paddingBottom: vs(14) },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
  },
  title: { marginTop: vs(10), marginBottom: vs(12) },
  rule: { marginVertical: vs(12) },
  line: { marginTop: vs(6) },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: vs(8),
  },
  personText: { flex: 1 },
  done: { alignSelf: 'flex-start', marginTop: vs(8) },
});
