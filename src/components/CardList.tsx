import React from 'react';
import { View, ViewStyle } from 'react-native';
import { s } from '../theme';
import { Card, Divider } from './Card';

type Props = {
  children: React.ReactNode;
  // Left gap of the divider line, so it starts under the text, not the icon.
  inset?: number;
  style?: ViewStyle;
};

export function CardList({ children, inset = 16, style }: Props) {
  const rows = React.Children.toArray(children);
  return (
    <Card style={style}>
      {rows.map((row, i) => (
        <View key={i}>
          {i > 0 ? (
            <Divider style={{ marginLeft: s(inset), marginRight: s(16) }} />
          ) : null}
          {row}
        </View>
      ))}
    </Card>
  );
}
