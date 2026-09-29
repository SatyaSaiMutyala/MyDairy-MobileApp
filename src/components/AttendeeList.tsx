import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Attendee, InviteResponse } from '../data/mock';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Pill, PillTone } from './Pill';

const replies: Record<InviteResponse, { label: string; tone: PillTone }> = {
  accepted: { label: 'Yes', tone: 'good' },
  tentative: { label: 'Maybe', tone: 'watch' },
  declined: { label: 'No', tone: 'critical' },
  pending: { label: 'Awaiting', tone: 'low' },
};

export function AttendeeList({ people }: { people: Attendee[] }) {
  const count = (st: InviteResponse) => people.filter(p => p.status === st).length;
  return (
    <View>
      <AppText variant="meta" color={colors.inkMuted} style={styles.tally}>
        {count('accepted')} yes · {count('declined')} no · {count('tentative')} maybe ·{' '}
        {count('pending')} awaiting
      </AppText>
      {people.map(p => (
        <View key={p.name} style={styles.row}>
          <AppText variant="bodyRegular" style={styles.name}>
            {p.name}
          </AppText>
          <Pill label={replies[p.status].label} tone={replies[p.status].tone} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tally: { marginBottom: vs(8) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: vs(8),
  },
  name: { flex: 1 },
});
