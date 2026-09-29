import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { addMonths, longDate, monthTitle, TODAY_ISO } from '../utils/dates';
import { s, vs } from '../theme';
import { AnchoredPanel, panelMinWidth, useAnchor } from './AnchoredPanel';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { MonthGrid } from './MonthGrid';
import { PickerField } from './PickerField';

type Props = {
  value: string; // 'YYYY-MM-DD', or '' when nothing is chosen
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
  // Show a Clear button, for optional dates and filters.
  clearable?: boolean;
  // Replace the standard field, e.g. on a teal panel.
  renderTrigger?: (open: boolean) => React.ReactNode;
  style?: ViewStyle;
};

// A date field. The calendar opens directly under it.
export function DateField({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  clearable = false,
  renderTrigger,
  style,
}: Props) {
  const { ref, anchor, open, show, hide } = useAnchor();
  const [month, setMonth] = useState(value || TODAY_ISO);

  useEffect(() => {
    if (open) {
      setMonth(value || TODAY_ISO);
    }
  }, [open, value]);

  const choose = (iso: string) => {
    onChange(iso);
    hide();
  };

  return (
    <>
      {renderTrigger ? (
        <Pressable
          ref={ref}
          onPress={show}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          style={style}
        >
          {renderTrigger(open)}
        </Pressable>
      ) : (
        <PickerField
          label={label}
          icon={Calendar}
          text={value ? longDate(value) : undefined}
          placeholder={placeholder}
          open={open}
          onPress={show}
          fieldRef={ref}
          style={style}
        />
      )}

      <AnchoredPanel
        anchor={anchor}
        onClose={hide}
        maxHeight={vs(400)}
        needs={vs(360)}
        minWidth={panelMinWidth}
      >
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.head}>
            <IconButton
              icon={ChevronLeft}
              label="Previous month"
              size={36}
              strokeWidth={2}
              onPress={() => setMonth(m => addMonths(m, -1))}
            />
            <AppText variant="label" style={styles.title}>
              {monthTitle(month)}
            </AppText>
            <IconButton
              icon={ChevronRight}
              label="Next month"
              size={36}
              strokeWidth={2}
              onPress={() => setMonth(m => addMonths(m, 1))}
            />
          </View>
          <MonthGrid
            bare
            month={month}
            selected={value}
            onSelect={choose}
            counts={{}}
          />
          <View style={styles.foot}>
            {clearable ? (
              <Button
                label="Clear"
                size="sm"
                variant="outline"
                style={styles.footBtn}
                onPress={() => choose('')}
              />
            ) : null}
            <Button
              label="Today"
              size="sm"
              variant="secondary"
              style={styles.footBtn}
              onPress={() => choose(TODAY_ISO)}
            />
          </View>
        </ScrollView>
      </AnchoredPanel>
    </>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(6),
    paddingTop: vs(6),
  },
  title: { flex: 1, textAlign: 'center' },
  foot: {
    flexDirection: 'row',
    gap: s(8),
    paddingHorizontal: s(10),
    paddingBottom: vs(10),
    paddingTop: vs(4),
  },
  footBtn: { flex: 1 },
});
