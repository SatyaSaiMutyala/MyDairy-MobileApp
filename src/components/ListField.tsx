import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { colors, fieldGap, fieldHeight, fonts, fs, hairline, labelGap, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  maxLength?: number;
};

// A list of short lines the person adds one at a time: decisions, key
// points, KPIs. Type, press the plus (or Return), remove with the cross.
export function ListField({ label, items, onChange, placeholder = 'Add a line', maxLength = 1000 }: Props) {
  const [text, setText] = useState('');
  const ready = !!text.trim();
  const add = () => {
    if (ready) {
      onChange([...items, text.trim()]);
      setText('');
    }
  };
  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={colors.inkSoft} style={styles.label}>
        {label}
      </AppText>
      {items.map((item, i) => (
        <View key={`${i}-${item}`} style={styles.row}>
          <AppText variant="bodyRegular" style={styles.text}>
            {item}
          </AppText>
          <IconButton
            icon={X}
            label={`Remove ${item}`}
            size={28}
            iconSize={16}
            strokeWidth={2.25}
            color={colors.inkSoft}
            onPress={() => onChange(items.filter((_, n) => n !== i))}
          />
        </View>
      ))}
      <View style={styles.input}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          allowFontScaling={false}
          returnKeyType="done"
          blurOnSubmit={false}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.teal}
          style={styles.box}
        />
        <IconButton
          icon={Plus}
          label="Add"
          size={30}
          iconSize={18}
          strokeWidth={2.25}
          color={ready ? colors.white : colors.inkFaint}
          style={[styles.add, ready && styles.addOn]}
          onPress={add}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: fieldGap },
  label: { marginBottom: labelGap },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingVertical: vs(4),
    paddingLeft: s(12),
    paddingRight: s(2),
    marginBottom: vs(6),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  text: { flex: 1 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    minHeight: fieldHeight,
    paddingLeft: s(14),
    paddingRight: s(4),
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  box: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fs(15),
    color: colors.ink,
    paddingVertical: vs(3),
    includeFontPadding: false,
  },
  add: { borderRadius: radius.sm, backgroundColor: colors.fill },
  addOn: { backgroundColor: colors.teal },
});
