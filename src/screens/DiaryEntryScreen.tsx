import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { AttendeeList } from '../components/AttendeeList';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { diaryKinds } from '../components/DiaryItem';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import { ShimmerRows } from '../components/Shimmer';
import { InviteResponse, toLine } from '../diary/model';
import { errorMessage } from '../store';
import {
  useDeleteDiaryEntryMutation,
  useDiaryEntryQuery,
  useRespondInviteMutation,
} from '../store/api/diaryApi';
import { longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

const replyText: Record<InviteResponse, string> = {
  pending: 'You have not replied yet',
  accepted: 'You accepted this invitation',
  tentative: 'You replied "Maybe"',
  declined: 'You declined this invitation',
};

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['DiaryEntry'] as const;

export function DiaryEntryScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const query = useDiaryEntryQuery(id);
  const [respond, responding] = useRespondInviteMutation();
  const [destroy, deleting] = useDeleteDiaryEntryMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Entry">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : (
          <FormCard style={styles.notice}>
            <ShimmerRows rows={3} icon={false} lines={2} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const entry = toLine(query.data);
  const k = diaryKinds[entry.kind] ?? diaryKinds.appointment;
  const invited = entry.invite !== undefined && entry.inviteId !== undefined;
  const failure = responding.error ?? deleting.error;

  const reply = (response: Exclude<InviteResponse, 'pending'>) =>
    respond({ inviteId: entry.inviteId!, response })
      .unwrap()
      .then(() => {
        // A declined entry leaves the calendar.
        if (response === 'declined') {
          nav.goBack();
        }
      })
      .catch(() => {});

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this entry?',
      text: entry.attendees.length
        ? 'It cannot be brought back. It also leaves the diaries of the people you tagged.'
        : 'It cannot be brought back.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(entry.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  return (
    <FormScreen
      title={invited ? 'Invitation' : 'Entry'}
      onRefresh={fresh}
      footer={
        invited ? (
          <View style={styles.actions}>
            <Button
              label="Yes"
              variant={entry.invite === 'accepted' ? 'secondary' : 'outline'}
              style={styles.action}
              disabled={responding.isLoading}
              onPress={() => reply('accepted')}
            />
            <Button
              label="Maybe"
              variant={entry.invite === 'tentative' ? 'secondary' : 'outline'}
              style={styles.action}
              disabled={responding.isLoading}
              onPress={() => reply('tentative')}
            />
            <Button
              label="No"
              variant="outline"
              style={styles.action}
              disabled={responding.isLoading}
              onPress={() => reply('declined')}
            />
          </View>
        ) : entry.canEdit ? (
          <View style={styles.actions}>
            <Button
              label="Delete"
              variant="outline"
              iconLeft={Trash2}
              iconColor={colors.red}
              style={styles.action}
              disabled={deleting.isLoading}
              onPress={remove}
            />
            <Button
              label="Edit"
              iconLeft={Pencil}
              style={styles.action}
              onPress={() => nav.navigate('DiaryEntryForm', { id: entry.id })}
            />
          </View>
        ) : (
          <Notice
            tone="locked"
            title={
              entry.source
                ? `This entry comes from ${entry.source}`
                : `This entry belongs to ${entry.owner}`
            }
            text={
              entry.source
                ? 'Change it there; it updates here by itself.'
                : 'Only the owner or an admin can change it.'
            }
          />
        )
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.notice}
        />
      ) : null}
      {invited ? (
        <Notice
          tone={entry.invite === 'pending' ? 'info' : 'success'}
          title={replyText[entry.invite!]}
          text={
            entry.invite === 'pending'
              ? 'It stays dashed on your calendar until you answer.'
              : 'You can change your answer below.'
          }
          style={styles.notice}
        />
      ) : null}

      <FormCard style={styles.card}>
        <View style={styles.tags}>
          <Pill label={k.label} tone={k.tone} />
          {entry.source ? <Pill label={entry.source} tone="low" /> : null}
        </View>
        <AppText variant="heading" style={styles.title}>
          {entry.title}
        </AppText>
        <InfoRow
          label="Organised by"
          value={entry.mine ? undefined : entry.owner}
        />
        <InfoRow label="Date" value={longDate(entry.date)} />
        <InfoRow
          label="Time"
          value={entry.end ? `${entry.time} – ${entry.end}` : entry.time}
        />
        <InfoRow label="Location" value={entry.place} />
        <InfoRow label="Notes" value={entry.body || undefined} />
      </FormCard>

      {entry.agenda.length ? (
        <FormCard title="Agenda" style={styles.card}>
          {entry.agenda.map((a, i) => (
            <InfoRow
              key={`${i}-${a.title}`}
              label={
                a.duration
                  ? `Item ${i + 1} · ${a.duration} min`
                  : `Item ${i + 1}`
              }
              value={a.owner ? `${a.title} (${a.owner})` : a.title}
            />
          ))}
        </FormCard>
      ) : null}

      {entry.attendees.length ? (
        <FormCard title="Attendance" style={styles.card}>
          <AttendeeList people={entry.attendees} />
        </FormCard>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: s(10) },
  action: { flex: 1 },
  notice: { marginTop: vs(10) },
  card: { paddingBottom: vs(6) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  title: { marginTop: vs(10), marginBottom: vs(12) },
});
