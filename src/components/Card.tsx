import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, hairline, radius, shadow } from '../theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function Divider({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: hairline,
    borderColor: colors.lineSoft,
    ...shadow.card,
  },
  divider: { height: hairline, backgroundColor: colors.line },
});
