import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowUpRight,
  Check,
  Clock,
  MapPin,
  Pencil,
  Repeat,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { AttachmentList } from '../components/AttachmentList';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { EscalationTrail } from '../components/EscalationTrail';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { IconText } from '../components/IconText';
import { Notice } from '../components/Notice';
import { Pill, priorityTone } from '../components/Pill';
import { ShimmerRows } from '../components/Shimmer';
import { errorMessage } from '../store';
import {
  useDeleteTaskMutation,
  useTaskQuery,
  useToggleTaskMutation,
} from '../store/api/tasksApi';
import { toTask } from '../tasks/model';
import { describe } from '../utils/recur';
import { colors, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Task'] as const;

export function TaskDetailScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const query = useTaskQuery(route.params?.id);
  const [toggle, toggling] = useToggleTaskMutation();
  const [destroy, deleting] = useDeleteTaskMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Task">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.card}
          />
        ) : (
          <FormCard style={styles.card}>
            <ShimmerRows rows={3} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const task = toTask(query.data);
  const late = task.overdue && !task.done;
  const inbox = task.box === 'inbox';
  const out = task.box === 'out';
  const mine = task.box === 'mine';
  const own =
    mine && !task.from && query.data.ownerId === query.data.assigneeId;
  const place = task.place;
  const failure = toggling.error ?? deleting.error;
  const busy = toggling.isLoading || deleting.isLoading;

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this task?',
      text: 'It cannot be brought back.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(task.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  return (
    <FormScreen
      title="Task"
      onRefresh={fresh}
      right={
        task.canEdit || task.canDelete ? (
          <View style={styles.tools}>
            {task.canEdit ? (
              <IconButton
                icon={Pencil}
                label="Edit task"
                iconSize={20}
                onPress={() => nav.navigate('TaskForm', { id: task.id })}
              />
            ) : null}
            {task.canDelete ? (
              <IconButton
                icon={Trash2}
                label="Delete task"
                iconSize={20}
                color={colors.red}
                onPress={remove}
              />
            ) : null}
          </View>
        ) : undefined
      }
      footer={
        inbox ? (
          <Button
            label="Resolve and return"
            iconLeft={Check}
            onPress={() => nav.navigate('ResolveTask', { id: task.id })}
          />
        ) : out ? (
          <Notice
            tone="locked"
            title={`Waiting for ${task.escalatedTo}`}
            text="You can work on it again once they return it."
          />
        ) : (
          <View style={styles.actions}>
            {task.done ? null : (
              <Button
                label="Escalate"
                variant="outline"
                iconLeft={ArrowUpRight}
                style={styles.action}
                onPress={() => nav.navigate('EscalateTask', { id: task.id })}
              />
            )}
            <Button
              label={
                task.done
                  ? 'Mark as not done'
                  : task.repeat
                  ? 'Done for now'
                  : 'Mark as done'
              }
              variant={task.done ? 'outline' : 'primary'}
              iconLeft={task.done ? RotateCcw : Check}
              style={styles.action}
              disabled={busy}
              onPress={() =>
                toggle(task.id)
                  .unwrap()
                  .then(() => nav.goBack())
                  .catch(() => {})
              }
            />
          </View>
        )
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.error}
        />
      ) : null}
      <FormCard style={styles.card}>
        <View style={styles.tags}>
          <Pill label={task.priority} tone={priorityTone(task.priority)} />
          {task.done ? <Pill label="Done" tone="signed" /> : null}
          {task.returned && !task.done ? (
            <Pill label="Returned — action required" tone="good" />
          ) : null}
          {task.hard ? <Pill label="Hard deadline" tone="escalated" /> : null}
        </View>
        <AppText variant="heading" style={styles.title}>
          {task.title}
        </AppText>
        {task.description ? (
          <AppText
            variant="bodyRegular"
            color={colors.inkSoft}
            style={styles.text}
          >
            {task.description}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <AppText variant="meta" color={colors.inkMuted}>
            {own ? task.area : `${task.owner} · ${task.area}`}
          </AppText>
          <IconText
            icon={Clock}
            text={late ? `Overdue · ${task.due}` : task.due}
            variant={late ? 'metaStrong' : 'meta'}
            color={late ? colors.redInk : colors.inkMuted}
          />
          {task.repeat ? (
            <IconText
              icon={Repeat}
              text={task.recurring ? describe(task.recurring) : task.repeat}
            />
          ) : null}
          {place ? <IconText icon={MapPin} text={place} /> : null}
        </View>
        {task.lastDone ? (
          <AppText variant="meta" color={colors.greenInk} style={styles.text}>
            Last occurrence ticked {task.lastDone}
          </AppText>
        ) : null}
        {task.tags.length ? (
          <View style={[styles.tags, styles.text]}>
            {task.tags.map(tag => (
              <Pill key={tag} label={`#${tag}`} tone="low" />
            ))}
          </View>
        ) : null}
      </FormCard>

      {task.attachments.length ? (
        <FormCard
          title={`Attachments · ${task.attachments.length}`}
          style={styles.card}
        >
          <AttachmentList files={task.attachments} />
        </FormCard>
      ) : null}

      <EscalationTrail task={task} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: 'row' },
  error: { marginTop: vs(10) },
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  card: { paddingBottom: vs(14) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: s(6) },
  title: { marginTop: vs(10) },
  text: { marginTop: vs(8) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(12),
  },
});
