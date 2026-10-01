import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  ListChecks,
  MapPinned,
  TriangleAlert,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ApiNotice, NoticeLink } from '../store/api/notificationsApi';
import { stamp } from '../tasks/model';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Dot } from './Dot';

const icons: Record<NoticeLink['type'], LucideIcon> = {
  task: ListChecks,
  alert: TriangleAlert,
  diary: CalendarDays,
  visit: MapPinned,
  lab: FlaskConical,
  preops: ClipboardList,
  report: ClipboardCheck,
};

type Props = { notice: ApiNotice; onPress: () => void };

// One notification: what happened, a second line, and when. Unread ones are
// bold and carry a dot.
export function NotificationRow({ notice, onPress }: Props) {
  const Icon = (notice.link && icons[notice.link.type]) || Bell;
  const red = notice.kind.startsWith('alert.red');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon
        size={s(21)}
        color={red ? colors.red : colors.tealDeep}
        strokeWidth={1.75}
        style={styles.icon}
      />
      <View style={styles.body}>
        <AppText
          variant={notice.read ? 'bodyRegular' : 'body'}
          color={notice.read ? colors.inkSoft : colors.ink}
        >
          {notice.title}
        </AppText>
        {notice.body ? (
          <AppText
            variant="meta"
            color={colors.inkMuted}
            numberOfLines={2}
            style={styles.text}
          >
            {notice.body}
          </AppText>
        ) : null}
        <AppText variant="meta" color={colors.inkFaint} style={styles.text}>
          {stamp(notice.at)}
        </AppText>
      </View>
      {notice.read ? null : (
        <Dot color={colors.teal} size={9} style={styles.dot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: s(12),
    paddingHorizontal: s(16),
    paddingVertical: vs(13),
  },
  pressed: { opacity: 0.7 },
  icon: { marginTop: vs(2) },
  body: { flex: 1 },
  text: { marginTop: vs(3) },
  dot: { marginTop: vs(7) },
});
