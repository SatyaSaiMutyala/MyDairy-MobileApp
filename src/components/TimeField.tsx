import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors, hairline, radius, s, vs } from '../theme';
import { AnchoredPanel, useAnchor } from './AnchoredPanel';
import { AppText } from './AppText';
import { Button } from './Button';
import { PickerField } from './PickerField';

type Props = {
  value: string; // 'HH:MM', or '' when nothing is chosen
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  style?: ViewStyle;
};

const pad = (n: number) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

// A time field. Hours and minutes open directly under it.
export function TimeField({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  style,
}: Props) {
  const { ref, anchor, open, show, hide } = useAnchor();
  const [hour, minute] = value ? value.split(':') : ['', ''];

  const column = (
    title: string,
    list: string[],
    chosen: string,
    pick: (v: string) => void,
  ) => (
    <View style={styles.column}>
      <AppText variant="eyebrow" color={colors.inkMuted} style={styles.heading}>
        {title}
      </AppText>
      <ScrollView
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        style={styles.list}>
        {list.map(v => {
          const on = v === chosen;
          return (
            <Pressable
              key={v}
              onPress={() => pick(v)}
              accessibilityState={{ selected: on }}
              style={[styles.cell, on && styles.on]}>
              <AppText variant="body" color={on ? colors.white : colors.ink}>
                {v}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <>
      <PickerField
        label={label}
        icon={Clock}
        text={value || undefined}
        placeholder={placeholder}
        open={open}
        onPress={show}
        fieldRef={ref}
        style={style}
      />
      <AnchoredPanel
        anchor={anchor}
        onClose={hide}
        maxHeight={vs(320)}
        needs={vs(290)}
        minWidth={s(200)}>
        <View style={styles.columns}>
          {column('HOUR', HOURS, hour, h => onChange(`${h}:${minute || '00'}`))}
          <View style={styles.rule} />
          {column('MINUTE', MINUTES, minute, m => onChange(`${hour || '09'}:${m}`))}
        </View>
        <View style={styles.foot}>
          <Button
            label="Clear"
            size="sm"
            variant="outline"
            style={styles.footBtn}
            onPress={() => {
              onChange('');
              hide();
            }}
          />
          <Button
            label="Done"
            size="sm"
            variant="secondary"
            style={styles.footBtn}
            onPress={hide}
          />
        </View>
      </AnchoredPanel>
    </>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row' },
  column: { flex: 1, paddingHorizontal: s(8), paddingTop: vs(10) },
  heading: { textAlign: 'center', marginBottom: vs(6) },
  list: { height: vs(190) },
  rule: { width: hairline, backgroundColor: colors.line },
  cell: {
    alignItems: 'center',
    paddingVertical: vs(7),
    borderRadius: radius.sm,
  },
  on: { backgroundColor: colors.teal },
  foot: {
    flexDirection: 'row',
    gap: s(8),
    padding: s(10),
    borderTopWidth: hairline,
    borderTopColor: colors.line,
  },
  footBtn: { flex: 1 },
});
