import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CircleAlert, CircleCheck, Info, Lock } from 'lucide-react-native';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Tone = 'error' | 'success' | 'info' | 'locked';

type Props = {
  tone: Tone;
  title: string;
  text?: string;
  style?: ViewStyle;
};

const tones = {
  error: { bg: colors.redTint, ink: colors.redInk, icon: colors.red, Icon: CircleAlert },
  success: { bg: colors.greenTint, ink: colors.greenInk, icon: colors.green, Icon: CircleCheck },
  info: { bg: colors.blueTint, ink: colors.blueInk, icon: colors.blue, Icon: Info },
  locked: { bg: colors.tealTint, ink: colors.tealDeep, icon: colors.teal, Icon: Lock },
} as const;

// Coloured message box: errors, confirmations and locked states.
export function Notice({ tone, title, text, style }: Props) {
  const t = tones[tone];
  return (
    <View
      accessibilityRole="alert"
      style={[styles.box, { backgroundColor: t.bg }, style]}>
      <t.Icon size={s(19)} color={t.icon} strokeWidth={2} />
      <View style={styles.text}>
        <AppText variant="label" color={t.ink}>
          {title}
        </AppText>
        {text ? (
          <AppText variant="meta" color={t.ink}>
            {text}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: s(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    borderRadius: radius.md,
  },
  text: { flex: 1 },
});
