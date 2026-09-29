import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fieldGap, fieldHeight, labelGap, ms, radius, s } from '../theme';
import { AppText } from './AppText';

type Props = {
  label?: string;
  icon: LucideIcon;
  text: string | undefined;
  placeholder: string;
  open: boolean;
  onPress: () => void;
  fieldRef: React.Ref<React.ComponentRef<typeof View>>;
  style?: ViewStyle;
};

// The closed look of the date and time fields.
export function PickerField({
  label,
  icon: Icon,
  text,
  placeholder,
  open,
  onPress,
  fieldRef,
  style,
}: Props) {
  return (
    <View style={[label ? styles.wrap : null, style]}>
      {label ? (
        <AppText variant="label" color={colors.inkSoft} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        ref={fieldRef}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[styles.field, open && styles.open]}>
        <Icon size={s(18)} color={colors.inkMuted} strokeWidth={1.75} />
        <AppText
          variant="bodyRegular"
          color={text ? colors.ink : colors.inkFaint}
          style={styles.value}
          numberOfLines={1}>
          {text ?? placeholder}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: fieldGap },
  label: { marginBottom: labelGap },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    minHeight: fieldHeight,
    paddingHorizontal: s(14),
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  open: { borderColor: colors.teal },
  value: { flex: 1 },
});
