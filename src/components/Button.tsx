import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fonts, fs, ms, radius, s, shadow, vs } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'outline';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  iconColor?: string;
  // A custom piece in front of the label, e.g. an icon tile.
  leading?: React.ReactNode;
  // Label on the left, right icon pushed to the far edge.
  spread?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; ink: string; border?: string }> = {
  primary: { bg: colors.yellow, ink: colors.yellowInk },
  secondary: { bg: colors.teal, ink: colors.white },
  outline: { bg: colors.surface, ink: colors.ink, border: colors.line },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  iconColor,
  leading,
  spread = false,
  accessibilityLabel,
  style,
}: Props) {
  const tone = palette[variant];
  const ink = disabled ? colors.disabledInk : tone.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        leading ? styles.withLeading : null,
        { backgroundColor: disabled ? colors.disabled : tone.bg },
        tone.border && !disabled
          ? { borderWidth: ms(1.5, 0.2), borderColor: tone.border }
          : null,
        variant === 'primary' && !disabled ? shadow.action : null,
        pressed && styles.pressed,
        style,
      ]}>
      <View style={[styles.row, spread && styles.spread]}>
        {leading}
        {IconLeft ? (
          <IconLeft size={s(18)} color={iconColor ?? ink} strokeWidth={1.9} />
        ) : null}
        <AppText
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            spread && styles.labelSpread,
            { color: ink },
          ]}>
          {label}
        </AppText>
        {IconRight ? (
          <IconRight size={s(18)} color={ink} strokeWidth={2} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(16),
  },
  lg: { minHeight: vs(44), borderRadius: radius.md + ms(2) },
  md: { minHeight: vs(38), borderRadius: radius.md },
  sm: { minHeight: vs(30), borderRadius: radius.sm, paddingHorizontal: s(12) },
  withLeading: { paddingLeft: s(8), paddingVertical: vs(6) },
  row: { flexDirection: 'row', alignItems: 'center', gap: s(9) },
  spread: { alignSelf: 'stretch' },
  label: { fontFamily: fonts.semibold, fontSize: fs(15), lineHeight: fs(21) },
  labelSm: { fontSize: fs(13), lineHeight: fs(18) },
  labelSpread: { flex: 1 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
