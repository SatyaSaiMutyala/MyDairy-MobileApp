import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Task } from '../tasks/model';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = { task: Task };

// Who escalated a task, why, and what came back.
export function EscalationTrail({ task }: Props) {
  const e = task.escalation;
  if (!e) {
    return null;
  }
  const heading = task.from
    ? `Escalated to you by ${task.from}`
    : task.returned
    ? `You escalated this to ${task.returned.by}`
    : `Escalated to ${task.escalatedTo}`;

  return (
    <View>
      <View style={[styles.box, styles.ask]}>
        <AppText variant="label" color={colors.blueInk}>
          {heading}
        </AppText>
        <AppText variant="meta" color={colors.blueInk}>
          {e.on} · {e.reason}
        </AppText>
        {e.note ? (
          <AppText variant="bodyRegular" color={colors.inkSoft} style={styles.note}>
            {e.note}
          </AppText>
        ) : null}
        {e.expectedBy ? (
          <AppText variant="meta" color={colors.inkMuted} style={styles.note}>
            Expected by {e.expectedBy}
          </AppText>
        ) : null}
      </View>
      {task.returned ? (
        <View style={[styles.box, styles.answer]}>
          <AppText variant="label" color={colors.greenInk}>
            Returned by {task.returned.by}
          </AppText>
          <AppText variant="meta" color={colors.greenInk}>
            {task.returned.on} · {task.returned.action}
          </AppText>
          <AppText variant="bodyRegular" color={colors.inkSoft} style={styles.note}>
            {task.returned.note}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: vs(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    borderRadius: radius.md,
  },
  ask: { backgroundColor: colors.blueTint },
  answer: { backgroundColor: colors.greenTint },
  note: { marginTop: vs(6) },
});
