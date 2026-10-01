import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import type { Invite, InviteResponse } from '../diary/model';
import { shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { IconText } from './IconText';
import { Pill, PillTone } from './Pill';

const answered: Record<
  Exclude<InviteResponse, 'pending'>,
  { label: string; tone: PillTone }
> = {
  accepted: { label: 'Accepted', tone: 'good' },
  tentative: { label: 'Maybe', tone: 'watch' },
  declined: { label: 'Declined', tone: 'critical' },
};

type Props = {
  invite: Invite;
  onRespond: (response: Exclude<InviteResponse, 'pending'>) => void;
  // True while an answer is being sent.
  busy?: boolean;
  onOpen?: () => void;
};

export function InviteCard({ invite, onRespond, busy = false, onOpen }: Props) {
  return (
    <Pressable onPress={onOpen} disabled={!onOpen}>
      <Card style={styles.card}>
        <View style={styles.head}>
          <AppText variant="body" style={styles.title}>
            {invite.title}
          </AppText>
          {invite.status !== 'pending' ? (
            <Pill
              label={answered[invite.status].label}
              tone={answered[invite.status].tone}
            />
          ) : null}
        </View>
        <View style={styles.meta}>
          <IconText icon={Calendar} text={shortDate(invite.date)} />
          <IconText icon={Clock} text={invite.time} />
          {invite.place ? <IconText icon={MapPin} text={invite.place} /> : null}
        </View>
        <AppText variant="meta" color={colors.inkMuted}>
          Invited by {invite.by}
        </AppText>
        {invite.status === 'pending' ? (
          <View style={styles.actions}>
            <Button
              label="Accept"
              size="sm"
              variant="secondary"
              style={styles.action}
              disabled={busy}
              onPress={() => onRespond('accepted')}
            />
            <Button
              label="Maybe"
              size="sm"
              variant="outline"
              style={styles.action}
              disabled={busy}
              onPress={() => onRespond('tentative')}
            />
            <Button
              label="Decline"
              size="sm"
              variant="outline"
              style={styles.action}
              disabled={busy}
              onPress={() => onRespond('declined')}
            />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(14), marginBottom: vs(10) },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  title: { flex: 1 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s(14),
    rowGap: vs(4),
    marginTop: vs(6),
    marginBottom: vs(6),
  },
  actions: { flexDirection: 'row', gap: s(8), marginTop: vs(12) },
  action: { flex: 1 },
});
