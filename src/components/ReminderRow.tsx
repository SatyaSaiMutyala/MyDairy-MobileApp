import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AlarmClock, UserRound, Users } from 'lucide-react-native';
import { forLabel, statusTone, whenLabel } from '../reminders/model';
import type { ApiReminder } from '../store/api/remindersApi';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconText } from './IconText';
import { Pill } from './Pill';

type Props = { reminder: ApiReminder; onPress: () => void };

// One reminder in the list: what, when, and for whom.
export function ReminderRow({ reminder: r, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.head}>
          <AppText variant="heading" style={styles.title}>
            {r.title}
          </AppText>
          <Pill
            label={r.late ? 'Due now' : r.statusLabel}
            tone={r.late ? 'watch' : statusTone[r.status]}
          />
        </View>
        {r.note ? (
          <AppText
            variant="bodyRegular"
            color={colors.inkSoft}
            numberOfLines={2}
            style={styles.note}
          >
            {r.note}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <IconText
            icon={AlarmClock}
            text={whenLabel(r)}
            color={r.status === 'scheduled' ? colors.tealDeep : colors.inkMuted}
          />
          <IconText
            icon={r.recipients.length > 1 ? Users : UserRound}
            text={forLabel(r)}
          />
          {!r.mine ? <IconText icon={UserRound} text={`Set by ${r.creatorName}`} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(14), marginBottom: vs(12) },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  title: { flex: 1 },
  note: { marginTop: vs(6) },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(8),
  },
});
