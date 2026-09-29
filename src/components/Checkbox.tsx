import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, ms, radius, s } from '../theme';

type Props = {
  checked: boolean;
  onToggle?: () => void;
  label: string;
  disabled?: boolean;
};

export function Checkbox({ checked, onToggle, label, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      hitSlop={s(10)}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      style={[styles.box, checked && styles.on]}>
      {checked ? <Check size={s(15)} color={colors.white} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: s(24),
    height: s(24),
    borderRadius: radius.xs + ms(1),
    borderWidth: ms(2, 0.2),
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: colors.teal, borderColor: colors.teal },
});
