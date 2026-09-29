import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import type { Invite, InviteResponse } from '../data/mock';
import { shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { IconText } from './IconText';
import { Pill, PillTone } from './Pill';

const answered: Record<Exclude<InviteResponse, 'pending'>, { label: string; tone: PillTone }> = {
  accepted: { label: 'Accepted', tone: 'good' },
  tentative: { label: 'Maybe', tone: 'watch' },
  declined: { label: 'Declined', tone: 'critical' },
};

type Props = {
  invite: Invite;
  onRespond: (response: InviteResponse) => void;
};

export function InviteCard({ invite, onRespond }: Props) {
  return (
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
        <IconText icon={MapPin} text={invite.place} />
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
            onPress={() => onRespond('accepted')}
          />
          <Button
            label="Maybe"
            size="sm"
            variant="outline"
            style={styles.action}
            onPress={() => onRespond('tentative')}
          />
          <Button
            label="Decline"
            size="sm"
            variant="outline"
            style={styles.action}
            onPress={() => onRespond('declined')}
          />
        </View>
      ) : null}
    </Card>
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
