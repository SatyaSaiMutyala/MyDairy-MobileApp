import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fieldGap, fieldHeight, fonts, fs, labelGap, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { inputFocused } from './KeyboardAvoider';

type Props = TextInputProps & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  invalid?: boolean;
  secure?: boolean;
};

export function TextField({
  label,
  icon: Icon,
  error,
  invalid = false,
  secure = false,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const bad = invalid || !!error;

  const borderColor = bad ? colors.red : focused ? colors.teal : colors.line;

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={colors.inkSoft} style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.field,
          { borderColor },
          bad && styles.fieldBad,
        ]}>
        {Icon ? (
          <Icon
            size={s(18)}
            color={bad ? colors.red : colors.inkMuted}
            strokeWidth={1.75}
          />
        ) : null}
        <TextInput
          {...rest}
          allowFontScaling={false}
          secureTextEntry={hidden}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.teal}
          onFocus={e => {
            setFocused(true);
            inputFocused();
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
        {secure ? (
          <IconButton
            icon={hidden ? Eye : EyeOff}
            label={hidden ? 'Show password' : 'Hide password'}
            color={colors.teal}
            size={28}
            iconSize={19}
            onPress={() => setHidden(v => !v)}
          />
        ) : null}
      </View>
      {error ? (
        <AppText variant="label" color={colors.redInk} style={styles.error}>
          {error}
        </AppText>
      ) : null}
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
  },
  fieldBad: { backgroundColor: colors.redWash },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fs(15),
    color: colors.ink,
    paddingVertical: vs(3),
    includeFontPadding: false,
  },
  error: { marginTop: vs(4) },
});
