import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Copy, Pencil, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { useConfirm } from '../components/ConfirmDialog';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import { ShimmerRows } from '../components/Shimmer';
import { outcomeTone } from '../discussions/model';
import { errorMessage } from '../store';
import {
  useDeleteDiscussionMutation,
  useDiscussionQuery,
  useDuplicateDiscussionMutation,
  useToggleFollowUpMutation,
} from '../store/api/discussionsApi';
import { useFresh } from '../store/useFresh';
import { longDate, shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const FRESH = ['Discussion'] as const;

export function DiscussionDetailScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const fresh = useFresh(FRESH);
  const query = useDiscussionQuery(id);
  const [destroy, deleting] = useDeleteDiscussionMutation();
  const [duplicate, duplicating] = useDuplicateDiscussionMutation();
  const [toggle, toggling] = useToggleFollowUpMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Discussion">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : (
          <FormCard style={styles.card}>
            <ShimmerRows rows={3} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const d = query.data;
  const failure = deleting.error ?? duplicating.error ?? toggling.error;

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this log?',
      text: 'It cannot be brought back.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(d.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  const copy = async () => {
    const yes = await confirm({
      title: 'Log this again today?',
      text: 'A copy dated today is made, with the same people. Follow-ups are not copied.',
      confirmLabel: 'Make a copy',
    });
    if (yes) {
      duplicate(d.id)
        .unwrap()
        .then(made => nav.replace('DiscussionDetail', { id: made.id }))
        .catch(() => {});
    }
  };

  return (
    <FormScreen
      title="Discussion"
      onRefresh={fresh}
      right={
        <View style={styles.tools}>
          <IconButton
            icon={Copy}
            label="Log again today"
            iconSize={20}
            onPress={copy}
          />
          {d.mineToEdit ? (
            <IconButton
              icon={Trash2}
              label="Delete log"
              iconSize={20}
              color={colors.red}
              onPress={remove}
            />
          ) : null}
        </View>
      }
      footer={
        d.mineToEdit ? (
          <Button
            label="Edit"
            iconLeft={Pencil}
            onPress={() => nav.navigate('DiscussionForm', { id: d.id })}
          />
        ) : (
          <Notice
            tone="locked"
            title={`Logged by ${d.ownerName}`}
            text="Only the person who logged it can change it."
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

      <FormCard style={styles.card}>
        <View style={styles.tags}>
          <Pill label={d.outcomeLabel} tone={outcomeTone[d.outcome]} />
          <Pill label={d.typeLabel} tone="low" />
          <Pill
            label={d.privacy === 'team' ? 'Team' : 'Private'}
            tone={d.privacy === 'team' ? 'teal' : 'low'}
          />
        </View>
        <AppText variant="heading" style={styles.title}>
          {d.title}
        </AppText>
        <InfoRow
          label="Logged by"
          value={d.isOwner ? undefined : d.ownerName}
        />
        <InfoRow
          label="When"
          value={
            d.date
              ? `${longDate(d.date)}${d.time ? ` · ${d.time}` : ''}`
              : undefined
          }
        />
        <InfoRow label="How long" value={d.duration} />
        <InfoRow label="Summary" value={d.summary} />
        {d.tags.length ? (
          <View style={styles.tags}>
            {d.tags.map(tag => (
              <Pill key={tag} label={`#${tag}`} tone="low" />
            ))}
          </View>
        ) : null}
      </FormCard>

      <FormCard title={`With · ${d.with.length}`} style={styles.card}>
        {d.with.length ? (
          d.with.map(w => (
            <View key={w.id} style={styles.person}>
              <AppText variant="bodyRegular" style={styles.personName}>
                {w.name}
                {w.org ? ` · ${w.org}` : ''}
              </AppText>
              <Pill
                label={w.isInternal ? 'TrustLab' : 'Outside'}
                tone={w.isInternal ? 'teal' : 'low'}
              />
            </View>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            Nobody recorded.
          </AppText>
        )}
      </FormCard>

      {d.keyPoints.length ? (
        <FormCard title="Key points" style={styles.card}>
          {d.keyPoints.map((k, i) => (
            <AppText key={i} variant="bodyRegular" style={styles.line}>
              • {k}
            </AppText>
          ))}
        </FormCard>
      ) : null}

      <FormCard
        title={`Follow-ups · ${d.followUps.length}`}
        style={styles.card}
      >
        {d.followUps.length ? (
          d.followUps.map(f => (
            <Pressable
              key={f.id}
              disabled={!d.mineToEdit || toggling.isLoading}
              onPress={() => toggle(f.id)}
              style={styles.followUp}
            >
              <Checkbox
                checked={f.done}
                label={f.text}
                disabled={!d.mineToEdit}
                onToggle={() => toggle(f.id)}
              />
              <View style={styles.followText}>
                <AppText
                  variant="bodyRegular"
                  color={f.done ? colors.inkMuted : colors.ink}
                  style={f.done ? styles.struck : undefined}
                >
                  {f.text}
                </AppText>
                <AppText variant="meta" color={colors.inkMuted}>
                  {f.due ? `Due ${shortDate(f.due)}` : 'No date'}
                  {f.taskId ? ' · In My Tasks' : ''}
                </AppText>
              </View>
            </Pressable>
          ))
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            Nothing to follow up.
          </AppText>
        )}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  tools: { flexDirection: 'row' },
  card: { paddingBottom: vs(14) },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
  },
  title: { marginTop: vs(10), marginBottom: vs(12) },
  line: { marginTop: vs(6) },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: vs(8),
  },
  personName: { flex: 1 },
  followUp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
    marginBottom: vs(10),
  },
  followText: { flex: 1 },
  struck: { textDecorationLine: 'line-through' },
});
