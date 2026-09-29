import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fs, fonts, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';

export type PillTone =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'escalated'
  | 'signed'
  | 'teal'
  | 'yellow'
  | 'watch'
  | 'good'
  | 'info';

const tones: Record<PillTone, { bg: string; ink: string; border?: string }> = {
  critical: { bg: colors.redTint, ink: colors.redInk },
  high: { bg: colors.amberTint, ink: colors.amberInk },
  medium: { bg: colors.tealTint, ink: colors.tealDeep },
  low: { bg: colors.fill, ink: colors.inkSoft },
  escalated: { bg: colors.surface, ink: colors.redInk, border: colors.red },
  signed: { bg: colors.teal, ink: colors.white },
  teal: { bg: colors.tealTint, ink: colors.tealDeep },
  yellow: { bg: colors.yellow, ink: colors.yellowInk },
  watch: { bg: colors.amberTint, ink: colors.amberInk },
  good: { bg: colors.greenTint, ink: colors.greenInk },
  info: { bg: colors.blueTint, ink: colors.blueInk },
};

type Props = {
  label: string;
  tone: PillTone;
  icon?: LucideIcon;
};

export function Pill({ label, tone, icon: Icon }: Props) {
  const t = tones[tone];
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: t.bg },
        t.border ? { borderWidth: ms(1.25, 0.2), borderColor: t.border } : null,
      ]}>
      {Icon ? <Icon size={s(12)} color={t.ink} strokeWidth={2} /> : null}
      <AppText style={[styles.text, { color: t.ink }]}>{label}</AppText>
    </View>
  );
}

export const priorityTone = (p: string): PillTone =>
  (({ Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' } as const)[
    p as 'Critical'
  ] ?? 'low');

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: s(4),
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: radius.xs,
  },
  text: { fontFamily: fonts.semibold, fontSize: fs(12), lineHeight: fs(17) },
});
