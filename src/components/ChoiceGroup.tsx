import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fonts, fs, labelGap, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';

export type ChoiceTone = 'teal' | 'amber' | 'slate' | 'red' | 'green';

export type Choice<K extends string> = {
  key: K;
  label: string;
  icon?: LucideIcon;
  tone?: ChoiceTone;
};

type Props<K extends string> = {
  options: Choice<K>[];
  value: K | null;
  onChange: (key: K | null) => void;
  label?: string;
  disabled?: boolean;
  // Tapping the chosen option again clears it.
  clearable?: boolean;
  style?: ViewStyle;
};

const tones: Record<ChoiceTone, { bg: string; ink: string; border: string }> = {
  teal: { bg: colors.teal, ink: colors.white, border: colors.teal },
  slate: { bg: colors.slate, ink: colors.white, border: colors.slate },
  amber: { bg: colors.amberTint, ink: colors.amberInk, border: colors.amber },
  red: { bg: colors.redTint, ink: colors.redInk, border: colors.red },
  green: { bg: colors.greenTint, ink: colors.greenInk, border: colors.green },
};

// Pick one of a few options, shown side by side on a light surface.
export function ChoiceGroup<K extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  clearable = false,
  style,
}: Props<K>) {
  return (
    <View style={style}>
      {label ? (
        <AppText variant="label" color={colors.inkSoft} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.track}>
        {options.map(o => {
          const on = o.key === value;
          const tone = tones[o.tone ?? 'teal'];
          const ink = on ? tone.ink : colors.inkSoft;
          const Icon = o.icon;
          return (
            <Pressable
              key={o.key}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(on && clearable ? null : o.key)}
              style={[
                styles.option,
                on && { backgroundColor: tone.bg, borderColor: tone.border },
              ]}>
              {Icon ? (
                <Icon size={s(14)} color={ink} strokeWidth={on ? 2.4 : 1.9} />
              ) : null}
              <AppText style={[styles.text, { color: ink }]}>{o.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: labelGap },
  track: {
    flexDirection: 'row',
    gap: s(4),
    padding: s(4),
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  option: {
    flex: 1,
    minHeight: vs(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(5),
    borderRadius: radius.sm,
    borderWidth: ms(1.5, 0.2),
    borderColor: 'transparent',
  },
  text: { fontFamily: fonts.semibold, fontSize: fs(13), lineHeight: fs(18) },
});
