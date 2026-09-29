import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { s, vs } from '../theme';
import { AppText } from './AppText';
import { FocusStatusBar } from './FocusStatusBar';
import { IconButton } from './IconButton';

type Props = {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
};

// Plain top bar for inner screens: back arrow, title, optional action.
export function TopBar({ title, onBack, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + vs(6) }]}>
      <FocusStatusBar tone="dark" />
      <IconButton
        icon={ChevronLeft}
        label="Back"
        iconSize={24}
        strokeWidth={2}
        onPress={onBack}
      />
      <AppText variant="heading" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    // The back arrow has a wide touch area; this lines its drawing up with
    // the content below.
    paddingHorizontal: s(5),
    paddingBottom: vs(8),
  },
  title: { flex: 1, marginLeft: s(4) },
  spacer: { width: s(40) },
});
