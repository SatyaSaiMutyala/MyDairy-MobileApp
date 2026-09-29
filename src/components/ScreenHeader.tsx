import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fs, s, vs } from '../theme';
import { AppText } from './AppText';
import { TealHeader } from './TealHeader';

type Props = {
  eyebrow: string;
  title: string;
  // Shown beside the small line, e.g. a "Today" link.
  eyebrowAction?: React.ReactNode;
  // Shown on the right of the title, e.g. an add button.
  right?: React.ReactNode;
  // The one row under the title. It always gets the same height.
  children?: React.ReactNode;
};

// Teal top band of the tab screens. Two rows of fixed height, so every tab
// screen has a header of exactly the same size.
export function ScreenHeader({ eyebrow, title, eyebrowAction, right, children }: Props) {
  return (
    <TealHeader topGap={8} arcHeight={vs(190)} style={styles.header}>
      <View style={styles.top}>
        <View style={styles.text}>
          <View style={styles.eyebrow}>
            <AppText
              variant="eyebrow"
              color={colors.onTealSoft}
              numberOfLines={1}
              style={styles.eyebrowText}>
              {eyebrow.toUpperCase()}
            </AppText>
            {eyebrowAction}
          </View>
          <AppText
            variant="heading"
            color={colors.white}
            numberOfLines={1}
            style={styles.title}>
            {title}
          </AppText>
        </View>
        {right}
      </View>
      <View style={styles.below}>{children}</View>
    </TealHeader>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: vs(12) },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    height: vs(42),
  },
  text: { flex: 1 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  // Long text gives way, so a link beside it is never pushed out of view.
  eyebrowText: { flexShrink: 1 },
  title: { fontSize: fs(20), lineHeight: fs(26) },
  below: { height: vs(52), marginTop: vs(10), justifyContent: 'center' },
});
