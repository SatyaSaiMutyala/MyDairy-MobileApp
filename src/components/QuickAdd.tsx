import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, fieldHeight, fonts, fs, ms, radius, s, vs } from '../theme';

type Props = {
  placeholder: string;
  onAdd: (text: string) => void;
};

// One line to add something quickly: type, then press the plus or Return.
export function QuickAdd({ placeholder, onAdd }: Props) {
  const [text, setText] = useState('');
  const ready = !!text.trim();
  const submit = () => {
    if (ready) {
      onAdd(text.trim());
      setText('');
    }
  };
  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        allowFontScaling={false}
        returnKeyType="done"
        maxLength={255}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        selectionColor={colors.teal}
        style={styles.input}
      />
      <Pressable
        onPress={submit}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityLabel="Add"
        style={[styles.add, ready && styles.addOn]}>
        <Plus
          size={s(19)}
          color={ready ? colors.white : colors.inkFaint}
          strokeWidth={2.25}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    minHeight: fieldHeight,
    paddingLeft: s(14),
    paddingRight: s(5),
    marginBottom: vs(12),
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
  add: {
    width: s(30),
    height: s(30),
    borderRadius: radius.sm,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOn: { backgroundColor: colors.teal },
});
