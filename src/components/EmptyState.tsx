import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, vs } from '../theme';
import { AppText } from './AppText';

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="body" color={colors.inkMuted}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: vs(52) },
});
