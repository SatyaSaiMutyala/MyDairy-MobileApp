import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, fieldGap, fieldHeight, hairline, labelGap, ms, radius, s, vs } from '../theme';
import { AnchoredPanel, useAnchor } from './AnchoredPanel';
import { AppText } from './AppText';
import { Pill } from './Pill';

export type DropdownOption = {
  id: string;
  label: string;
  detail?: string;
  tag?: string;
};

type Props = {
  options: DropdownOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  // Replace the standard field with your own trigger (e.g. on a teal panel).
  renderTrigger?: (selected: DropdownOption | undefined, open: boolean) => React.ReactNode;
  style?: ViewStyle;
};

// The list always opens directly under the field it belongs to.
export function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select',
  renderTrigger,
  style,
}: Props) {
  const { ref, anchor, open, show, hide } = useAnchor();
  const selected = options.find(o => o.id === value);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View style={[label ? styles.wrap : null, style]}>
      {label ? (
        <AppText variant="label" color={colors.inkSoft} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        ref={ref}
        onPress={show}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}>
        {renderTrigger ? (
          renderTrigger(selected, open)
        ) : (
          <View style={[styles.field, open && styles.fieldOpen]}>
            <AppText
              variant="bodyRegular"
              color={selected ? colors.ink : colors.inkFaint}
              style={styles.value}
              numberOfLines={1}>
              {selected?.label ?? placeholder}
            </AppText>
            <Chevron size={s(19)} color={colors.inkMuted} strokeWidth={2} />
          </View>
        )}
      </Pressable>

      <AnchoredPanel
        anchor={anchor}
        onClose={hide}
        needs={options.length * vs(options.some(o => o.detail) ? 58 : 44)}>
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}>
          {options.map((o, i) => {
            const on = o.id === value;
            return (
              <Pressable
                key={o.id}
                onPress={() => {
                  onChange(o.id);
                  hide();
                }}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [
                  styles.option,
                  i > 0 && styles.optionRule,
                  (on || pressed) && styles.optionOn,
                ]}>
                <View style={styles.optionText}>
                  <View style={styles.optionHead}>
                    <AppText variant="body">{o.label}</AppText>
                    {o.tag ? <Pill label={o.tag} tone={on ? 'yellow' : 'low'} /> : null}
                  </View>
                  {o.detail ? (
                    <AppText variant="meta" color={colors.inkMuted}>
                      {o.detail}
                    </AppText>
                  ) : null}
                </View>
                {on ? <Check size={s(18)} color={colors.teal} strokeWidth={2.5} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </AnchoredPanel>
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
  fieldOpen: { borderColor: colors.teal },
  value: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
  },
  optionRule: { borderTopWidth: hairline, borderTopColor: colors.lineSoft },
  optionOn: { backgroundColor: colors.tealTint },
  optionText: { flex: 1 },
  optionHead: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
});
