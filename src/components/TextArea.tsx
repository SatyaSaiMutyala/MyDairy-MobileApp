import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fieldGap, fonts, fs, labelGap, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = TextInputProps & { label?: string; invalid?: boolean };

export function TextArea({ label, invalid = false, style, ...rest }: Props) {
  const input = (
    <TextInput
      multiline
      allowFontScaling={false}
      placeholderTextColor={colors.inkFaint}
      selectionColor={colors.teal}
      textAlignVertical="top"
      {...rest}
      style={[styles.input, invalid && styles.bad, label ? null : style]}
    />
  );
  if (!label) {
    return input;
  }
  return (
    <View style={[styles.wrap, style]}>
      <AppText variant="label" color={colors.inkSoft} style={styles.label}>
        {label}
      </AppText>
      {input}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: fieldGap },
  label: { marginBottom: labelGap },
  input: {
    minHeight: vs(44),
    paddingHorizontal: s(12),
    paddingTop: vs(6),
    paddingBottom: vs(6),
    borderRadius: radius.sm,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.ground,
    fontFamily: fonts.regular,
    fontSize: fs(14),
    lineHeight: fs(21),
    color: colors.ink,
    includeFontPadding: false,
  },
  bad: { borderColor: colors.red, backgroundColor: colors.redWash },
});
