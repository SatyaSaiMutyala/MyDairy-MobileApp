import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import type { AlertItem } from '../alerts/model';
import { colors, fs, fonts, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconTile } from './IconTile';
import { Pill } from './Pill';

const levels = {
  red: { bg: colors.red, border: colors.red, ink: colors.white, area: colors.redInk },
  amber: { bg: colors.amberTint, border: colors.amber, ink: colors.amberInk, area: colors.amberInk },
  green: { bg: colors.greenTint, border: colors.green, ink: colors.greenInk, area: colors.greenInk },
} as const;

type Props = {
  alert: AlertItem;
  // Buttons shown under the alert, e.g. Resolve or Escalate.
  actions?: React.ReactNode;
};

export function AlertRow({ alert, actions }: Props) {
  const l = levels[alert.level];
  return (
    <View style={styles.row}>
      <IconTile size={38} bg={l.bg} borderColor={l.border}>
        {alert.level === 'red' ? (
          <AppText style={styles.bang}>!</AppText>
        ) : alert.level === 'amber' ? (
          <Clock size={s(18)} color={l.ink} strokeWidth={2} />
        ) : (
          <Check size={s(18)} color={l.ink} strokeWidth={2.25} />
        )}
      </IconTile>
      <View style={styles.body}>
        <View style={styles.head}>
          <AppText variant="metaStrong" color={l.area}>
            {alert.area}
          </AppText>
          {alert.escalated ? <Pill label="Escalated" tone="escalated" /> : null}
        </View>
        <AppText variant="body" style={styles.title}>
          {alert.title}
        </AppText>
        <AppText variant="meta" color={colors.inkMuted}>
          {alert.by} · {alert.time}
        </AppText>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: s(14),
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
  },
  bang: {
    fontFamily: fonts.bold,
    fontSize: fs(17),
    lineHeight: fs(22),
    color: colors.white,
  },
  body: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginTop: vs(10) },
  head: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  title: { marginTop: vs(3), marginBottom: vs(3) },
});
