import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';

type Props = {
  name: string;
  role: string;
  note?: string;
};

const initials = (name: string) =>
  name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Who is signing. The name comes from the login and cannot be typed.
export function SignerCard({ name, role, note }: Props) {
  return (
    <View style={styles.card}>
      <Avatar label={initials(name)} size={44} />
      <View style={styles.text}>
        <AppText variant="body">{name}</AppText>
        <AppText variant="meta" color={colors.inkMuted}>
          {role}
        </AppText>
        {note ? (
          <AppText variant="meta" color={colors.inkFaint}>
            {note}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: vs(14),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  text: { flex: 1 },
});
