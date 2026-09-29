import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  dayNumber,
  monthGrid,
  sameMonth,
  TODAY_ISO,
  weekDayNames,
} from '../utils/dates';
import { colors, fonts, fs, ms, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Dot } from './Dot';

type Props = {
  month: string; // any day inside the month
  selected: string;
  onSelect: (iso: string) => void;
  // How many things each day has.
  counts: Record<string, number>;
  // Without the white card around it, for use inside a panel.
  bare?: boolean;
};

export function MonthGrid({
  month,
  selected,
  onSelect,
  counts,
  bare = false,
}: Props) {
  const Frame = bare ? View : Card;
  return (
    <Frame style={styles.card}>
      <View style={styles.row}>
        {weekDayNames.map(d => (
          <AppText
            key={d}
            variant="meta"
            color={colors.inkMuted}
            style={styles.head}
          >
            {d}
          </AppText>
        ))}
      </View>
      {monthGrid(month).map(week => (
        <View key={week[0]} style={styles.row}>
          {week.map(iso => {
            const inMonth = sameMonth(iso, month);
            const on = iso === selected;
            const today = iso === TODAY_ISO;
            const n = counts[iso] ?? 0;
            return (
              <Pressable
                key={iso}
                onPress={() => onSelect(iso)}
                accessibilityState={{ selected: on }}
                style={[
                  styles.cell,
                  bare && styles.compact,
                  today && styles.today,
                  on && styles.on,
                ]}
              >
                <AppText
                  style={[
                    styles.num,
                    {
                      color: on
                        ? colors.white
                        : inMonth
                        ? colors.ink
                        : colors.inkFaint,
                    },
                  ]}
                >
                  {dayNumber(iso)}
                </AppText>
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(n, 3) }, (_, i) => (
                    <Dot
                      key={i}
                      size={4}
                      color={on ? colors.yellow : colors.teal}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </Frame>
  );
}

const styles = StyleSheet.create({
  card: { padding: s(8) },
  row: { flexDirection: 'row' },
  head: { flex: 1, textAlign: 'center', paddingVertical: vs(6) },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(6),
    margin: s(1.5),
    borderRadius: radius.sm,
    borderWidth: ms(1.5, 0.2),
    borderColor: 'transparent',
  },
  // Shorter rows, so the whole month fits inside a picker panel.
  compact: { paddingVertical: vs(2) },
  today: { borderColor: colors.tealLine },
  on: { backgroundColor: colors.teal, borderColor: colors.teal },
  num: { fontFamily: fonts.medium, fontSize: fs(14), lineHeight: fs(20) },
  dots: { flexDirection: 'row', gap: s(2), height: vs(6), marginTop: vs(2) },
});
