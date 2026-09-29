import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { AttendeeList } from '../components/AttendeeList';
import { Button } from '../components/Button';
import { diaryKinds } from '../components/DiaryItem';
import { EmptyState } from '../components/EmptyState';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import type { InviteResponse } from '../data/mock';
import { currentUser, seesAllDepartments } from '../data/user';
import { useStore } from '../state/Store';
import { longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const replyText: Record<InviteResponse, string> = {
  pending: 'You have not replied yet',
  accepted: 'You accepted this invitation',
  tentative: 'You replied "Maybe"',
  declined: 'You declined this invitation',
};

export function DiaryEntryScreen() {
  const nav = useNavigation<any>();
  const id: string = useRoute<any>().params?.id ?? '';
  const store = useStore();

  const invite = id.startsWith('invite:')
    ? store.invites.find(i => `invite:${i.id}` === id)
    : undefined;
  const entry = store.entries.find(e => e.id === id);

  if (invite) {
    const reply = (r: InviteResponse) => {
      store.respondInvite(invite.id, r);
      if (r === 'declined') {
        nav.goBack();
      }
    };
    return (
      <FormScreen
        title="Invitation"
        footer={
          <View style={styles.actions}>
            <Button label="Yes" variant="secondary" style={styles.action} onPress={() => reply('accepted')} />
            <Button label="Maybe" variant="outline" style={styles.action} onPress={() => reply('tentative')} />
            <Button label="No" variant="outline" style={styles.action} onPress={() => reply('declined')} />
          </View>
        }>
        <Notice
          tone={invite.status === 'pending' ? 'info' : 'success'}
          title={replyText[invite.status]}
          text={
            invite.status === 'pending'
              ? 'It stays dashed on your calendar until you answer.'
              : 'You can change your answer below.'
          }
          style={styles.notice}
        />
        <FormCard style={styles.card}>
          <Pill label="Meeting" tone="info" />
          <AppText variant="heading" style={styles.title}>
            {invite.title}
          </AppText>
          <InfoRow label="Organised by" value={invite.by} />
          <InfoRow label="Date" value={longDate(invite.date)} />
          <InfoRow
            label="Time"
            value={invite.end ? `${invite.time} – ${invite.end}` : invite.time}
          />
          <InfoRow label="Location" value={invite.place} />
        </FormCard>
        {invite.agenda?.length ? (
          <FormCard title="Agenda" style={styles.card}>
            {invite.agenda.map((a, i) => (
              <InfoRow key={a} label={`Item ${i + 1}`} value={a} />
            ))}
          </FormCard>
        ) : null}
      </FormScreen>
    );
  }

  if (!entry) {
    return (
      <FormScreen title="Entry">
        <EmptyState text="This entry is no longer available." />
      </FormScreen>
    );
  }

  const k = diaryKinds[entry.kind];
  const remove = () =>
    Alert.alert('Delete this entry?', 'It cannot be brought back.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          store.deleteEntry(entry.id);
          nav.goBack();
        },
      },
    ]);

  return (
    <FormScreen
      title="Entry"
      footer={
        entry.source ||
        (entry.owner !== currentUser.name && !seesAllDepartments()) ? (
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
        ) : (
          <View style={styles.actions}>
            <Button
              label="Delete"
              variant="outline"
              iconLeft={Trash2}
              iconColor={colors.red}
              style={styles.action}
              onPress={remove}
            />
            <Button
              label="Edit"
              iconLeft={Pencil}
              style={styles.action}
              onPress={() => nav.navigate('DiaryEntryForm', { id: entry.id })}
            />
          </View>
        )
      }>
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
          value={entry.owner === currentUser.name ? undefined : entry.owner}
        />
        <InfoRow label="Date" value={longDate(entry.date)} />
        <InfoRow
          label="Time"
          value={entry.end ? `${entry.time} – ${entry.end}` : entry.time}
        />
        <InfoRow label="Location" value={entry.place} />
        <InfoRow label="Notes" value={entry.body} />
      </FormCard>

      {entry.attendees?.length ? (
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
