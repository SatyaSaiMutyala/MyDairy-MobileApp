import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Dot } from './Dot';

type Props = {
  title: string;
  detail?: string;
  value?: string;
  dot?: string;
  children?: React.ReactNode;
};

// A row that opens to show more, used for past submissions and logs.
export function ExpandRow({ title, detail, value, dot, children }: Props) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <View>
      <Pressable
        onPress={() => setOpen(v => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.row}>
        {dot ? <Dot color={dot} size={9} /> : null}
        <View style={styles.text}>
          <AppText variant="body">{title}</AppText>
          {detail ? (
            <AppText variant="meta" color={colors.inkMuted}>
              {detail}
            </AppText>
          ) : null}
        </View>
        {value ? (
          <AppText variant="label" color={colors.inkSoft}>
            {value}
          </AppText>
        ) : null}
        <Chevron size={s(18)} color={colors.inkFaint} strokeWidth={2} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
  },
  text: { flex: 1 },
  body: { paddingHorizontal: s(14), paddingBottom: vs(14) },
});
