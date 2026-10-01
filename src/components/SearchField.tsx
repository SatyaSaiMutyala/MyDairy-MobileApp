import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, fieldHeight, fonts, fs, ms, radius, s, vs } from '../theme';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
};

// One line to search a list. The screen decides when to ask the server.
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      <Search size={s(17)} color={colors.inkMuted} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        allowFontScaling={false}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        maxLength={100}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.teal}
        style={styles.input}
      />
      {value ? (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={s(10)}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={s(17)} color={colors.inkSoft} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    minHeight: fieldHeight,
    paddingHorizontal: s(12),
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fs(15),
    color: colors.ink,
    paddingVertical: vs(3),
    includeFontPadding: false,
  },
});
