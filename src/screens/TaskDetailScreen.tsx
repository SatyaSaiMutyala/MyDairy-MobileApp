import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
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
import { EmptyState } from '../components/EmptyState';
import { EscalationTrail } from '../components/EscalationTrail';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { IconText } from '../components/IconText';
import { Notice } from '../components/Notice';
import { Pill, priorityTone } from '../components/Pill';
import { locations } from '../data/mock';
import { currentUser } from '../data/user';
import { useStore } from '../state/Store';
import { describe } from '../utils/recur';
import { colors, s, vs } from '../theme';

export function TaskDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, toggleTask, deleteTask } = useStore();
  const task = tasks.find(t => t.id === route.params?.id);

  if (!task) {
    return (
      <FormScreen title="Task">
        <EmptyState text="This task is no longer available." />
      </FormScreen>
    );
  }

  const late = task.overdue && !task.done;
  const own = task.owner === currentUser.name;
  const inbox = !!task.from && !own;
  const out = !!task.escalatedTo;
  const mine = !inbox && !out;
  const place = locations.find(l => l.id === task.location)?.label;

  const remove = () =>
    Alert.alert('Delete this task?', 'It cannot be brought back.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          nav.goBack();
        },
      },
    ]);

  return (
    <FormScreen
      title="Task"
      right={
        mine ? (
          <View style={styles.tools}>
            <IconButton
              icon={Pencil}
              label="Edit task"
              iconSize={20}
              onPress={() => nav.navigate('TaskForm', { id: task.id })}
            />
            <IconButton
              icon={Trash2}
              label="Delete task"
              iconSize={20}
              color={colors.red}
              onPress={remove}
            />
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
              onPress={() => {
                toggleTask(task.id);
                nav.goBack();
              }}
            />
          </View>
        )
      }>
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
          <AppText variant="bodyRegular" color={colors.inkSoft} style={styles.text}>
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
        {task.tags?.length ? (
          <View style={[styles.tags, styles.text]}>
            {task.tags.map(tag => (
              <Pill key={tag} label={`#${tag}`} tone="low" />
            ))}
          </View>
        ) : null}
      </FormCard>

      {task.attachments?.length ? (
        <FormCard title={`Attachments · ${task.attachments.length}`} style={styles.card}>
          <AttachmentList files={task.attachments} />
        </FormCard>
      ) : null}

      <EscalationTrail task={task} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: 'row' },
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
