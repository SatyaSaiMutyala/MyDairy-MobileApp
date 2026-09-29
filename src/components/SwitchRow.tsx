import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Checkbox } from './Checkbox';

type Props = {
  label: string;
  detail?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

// A tick box with a label and a short explanation.
export function SwitchRow({ label, detail, value, onChange }: Props) {
  return (
    <Pressable style={styles.row} onPress={() => onChange(!value)}>
      <Checkbox checked={value} label={label} onToggle={() => onChange(!value)} />
      <View style={styles.text}>
        <AppText variant="body">{label}</AppText>
        {detail ? (
          <AppText variant="meta" color={colors.inkMuted}>
            {detail}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: s(12), marginBottom: vs(12) },
  text: { flex: 1 },
});
