import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Paperclip, Repeat } from 'lucide-react-native';
import type { Task } from '../tasks/model';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Checkbox } from './Checkbox';
import { IconText } from './IconText';
import { Pill, priorityTone } from './Pill';

type Props = {
  task: Task;
  checked: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  // Tasks that are with someone else cannot be ticked.
  readOnly?: boolean;
  // Show whose task it is (Admin and CMD see everyone's).
  showOwner?: boolean;
};

export function TaskRow({
  task,
  checked,
  onToggle,
  onOpen,
  readOnly = false,
  showOwner = false,
}: Props) {
  const late = task.overdue && !checked;
  return (
    <Pressable
      onPress={onOpen ?? onToggle}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {readOnly ? null : (
        <Checkbox checked={checked} onToggle={onToggle} label={task.title} />
      )}
      <View style={styles.body}>
        <AppText
          variant="body"
          color={checked ? colors.inkMuted : colors.ink}
          style={checked ? styles.struck : undefined}>
          {task.title}
        </AppText>
        {showOwner && !task.from && !task.escalatedTo ? (
          <AppText variant="meta" color={colors.inkMuted} style={styles.who}>
            {task.owner}
          </AppText>
        ) : null}
        {task.from ? (
          <AppText variant="meta" color={colors.blueInk} style={styles.who}>
            From {task.from} · {task.escalation?.reason}
          </AppText>
        ) : task.escalatedTo ? (
          <AppText variant="meta" color={colors.blueInk} style={styles.who}>
            With {task.escalatedTo} · {task.escalation?.reason}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <Pill label={task.priority} tone={priorityTone(task.priority)} />
          {task.returned && !checked ? <Pill label="Returned" tone="good" /> : null}
          {task.hard ? <Pill label="Hard" tone="escalated" /> : null}
          <AppText variant="meta" color={colors.inkMuted}>
            {task.area}
          </AppText>
          <AppText
            variant={late ? 'metaStrong' : 'meta'}
            color={late ? colors.redInk : colors.inkMuted}>
            {late ? `Overdue · ${task.due}` : task.due}
          </AppText>
          {task.repeat ? <IconText icon={Repeat} text={task.repeat} gap={4} /> : null}
          {task.attachments?.length ? (
            <IconText icon={Paperclip} text={String(task.attachments.length)} gap={3} />
          ) : null}
        </View>
      </View>
      {readOnly ? (
        <ChevronRight size={s(19)} color={colors.inkFaint} strokeWidth={2} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
  },
  pressed: { opacity: 0.7 },
  body: { flex: 1 },
  struck: { textDecorationLine: 'line-through' },
  who: { marginTop: vs(3) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: s(9),
    rowGap: vs(4),
    marginTop: vs(7),
  },
});
