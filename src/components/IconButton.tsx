import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, s } from '../theme';

type Props = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  color?: string;
  size?: number;
  iconSize?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

// A bare icon you can tap (back arrow, history, show password).
export function IconButton({
  icon: Icon,
  label,
  onPress,
  color = colors.ink,
  size = 40,
  iconSize = 22,
  strokeWidth = 1.75,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={s(10)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { width: s(size), height: s(size) },
        pressed && styles.pressed,
        style,
      ]}>
      <Icon size={s(iconSize)} color={color} strokeWidth={strokeWidth} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
