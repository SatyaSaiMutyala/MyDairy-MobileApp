import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import { ShimmerRows } from '../components/Shimmer';
import { statusTone, whenLabel } from '../reminders/model';
import { errorMessage } from '../store';
import {
  useDeleteReminderMutation,
  useReminderQuery,
} from '../store/api/remindersApi';
import { useFresh } from '../store/useFresh';
import { longDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const FRESH = ['Reminder'] as const;

export function ReminderDetailScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const fresh = useFresh(FRESH);
  const query = useReminderQuery(id);
  const [destroy, deleting] = useDeleteReminderMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Reminder">
        {query.error ? (
          <Notice tone="error" title={errorMessage(query.error)} style={styles.notice} />
        ) : (
          <FormCard style={styles.card}>
            <ShimmerRows rows={3} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const r = query.data;

  const remove = async () => {
    const yes = await confirm({
      title: r.status === 'sent' ? 'Delete this reminder?' : 'Cancel this reminder?',
      text:
        r.status === 'sent'
          ? 'It has already been sent; only the record is removed.'
          : 'Nobody will be reminded.',
      confirmLabel: r.status === 'sent' ? 'Delete' : 'Cancel reminder',
      cancelLabel: 'Keep it',
      tone: 'danger',
    });
    if (yes) {
      destroy(r.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  return (
    <FormScreen
      title="Reminder"
      onRefresh={fresh}
      right={
        r.mine ? (
          <IconButton
            icon={Trash2}
            label="Delete reminder"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }
      footer={
        r.mineToEdit ? (
          <Button
            label="Edit"
            iconLeft={Pencil}
            onPress={() => nav.navigate('ReminderForm', { id: r.id })}
          />
        ) : (
          <Notice
            tone={r.status === 'sent' ? 'success' : 'locked'}
            title={
              r.status === 'sent'
                ? `Sent ${r.sentAt ? `at ${r.sentAt.slice(11)}` : ''}`
                : `Set by ${r.creatorName}`
            }
            text={
              r.status === 'sent'
                ? 'Everyone chosen has been notified.'
                : 'Only the person who set it can change it.'
            }
          />
        )
      }
    >
      {deleting.error ? (
        <Notice tone="error" title={errorMessage(deleting.error)} style={styles.notice} />
      ) : null}

      <FormCard style={styles.card}>
        <View style={styles.pills}>
          <Pill
            label={r.late ? 'Due now' : r.statusLabel}
            tone={r.late ? 'watch' : statusTone[r.status]}
          />
          {r.forMe ? <Pill label="For you" tone="teal" /> : null}
        </View>
        <AppText variant="title" style={styles.title}>
          {r.title}
        </AppText>
        <InfoRow label="When" value={`${whenLabel(r)} · ${longDate(r.date)}`} />
        <InfoRow label="Set by" value={r.mine ? 'You' : r.creatorName} />
        <InfoRow label="Note" value={r.note} />
      </FormCard>

      <FormCard title={`Who gets it · ${r.recipients.length}`}>
        {r.recipients.map(p => (
          <View key={p.userId} style={styles.person}>
            <AppText variant="body">{p.name}</AppText>
            {p.userId === r.creatorId ? (
              <AppText variant="meta" color={colors.inkMuted}>
                set it
              </AppText>
            ) : null}
          </View>
        ))}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  card: { marginTop: vs(12) },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  title: { marginTop: vs(10), marginBottom: vs(6) },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(8),
  },
});
