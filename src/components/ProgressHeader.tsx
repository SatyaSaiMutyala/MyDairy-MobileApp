import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors, fonts, fs, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconText } from './IconText';

export type ProgressPart = { count: number; color: string };

type Props = {
  done: number;
  total: number;
  unit: string;
  due?: string;
  eyebrow?: string;
  caption?: string;
  // Split the bar into coloured parts. Defaults to done vs remaining.
  parts?: ProgressPart[];
};

// Big "18 of 26" figure with a bar under it.
export function ProgressHeader({
  done,
  total,
  unit,
  due,
  eyebrow,
  caption,
  parts,
}: Props) {
  const bar = parts ?? [
    { count: done, color: colors.teal },
    { count: total - done, color: colors.line },
  ];
  return (
    <View>
      {eyebrow ? (
        <AppText variant="eyebrow" color={colors.inkMuted} style={styles.eyebrow}>
          {eyebrow.toUpperCase()}
        </AppText>
      ) : null}
      <View style={styles.head}>
        <AppText style={styles.figure}>{done}</AppText>
        <AppText variant="body" color={colors.inkSoft} style={styles.of}>
          of {total} {unit}
        </AppText>
        {due ? (
          <IconText
            icon={Clock}
            text={`Due ${due}`}
            variant="metaStrong"
            color={colors.inkSoft}
            style={styles.due}
          />
        ) : null}
      </View>
      <View style={styles.track}>
        {bar.map((b, i) =>
          b.count > 0 ? (
            <View key={i} style={{ flex: b.count, backgroundColor: b.color }} />
          ) : null,
        )}
      </View>
      {caption ? (
        <AppText variant="meta" color={colors.inkMuted} style={styles.caption}>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: vs(8) },
  head: { flexDirection: 'row', alignItems: 'flex-end', marginTop: vs(10) },
  figure: {
    fontFamily: fonts.semibold,
    fontSize: fs(44),
    lineHeight: fs(50),
    color: colors.ink,
  },
  of: { flex: 1, marginLeft: s(8), marginBottom: vs(7) },
  due: {
    marginBottom: vs(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: radius.sm,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  track: {
    flexDirection: 'row',
    gap: s(3),
    height: vs(10),
    marginTop: vs(8),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  caption: { marginTop: vs(8) },
});
