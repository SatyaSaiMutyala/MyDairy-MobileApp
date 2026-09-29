import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { s, vs } from '../theme';
import { Card } from './Card';
import { Eyebrow } from './Eyebrow';

type Props = {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

// A titled white card that holds a group of form fields.
export function FormCard({ title, children, style }: Props) {
  return (
    <View>
      {title ? <Eyebrow label={title} /> : <View style={styles.gap} />}
      <Card style={[styles.card, style]}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { height: vs(14) },
  card: { paddingHorizontal: s(14), paddingTop: vs(14), paddingBottom: vs(2) },
});
