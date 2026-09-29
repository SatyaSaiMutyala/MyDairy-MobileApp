import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ms, radius, s } from '../theme';

type Props = {
  color: string;
  size?: number;
  hollow?: boolean;
  style?: ViewStyle;
};

export function Dot({ color, size = 8, hollow = false, style }: Props) {
  return (
    <View
      style={[
        { width: s(size), height: s(size), borderRadius: radius.pill },
        hollow
          ? { borderWidth: ms(1.5, 0.2), borderColor: color }
          : { backgroundColor: color },
        style,
      ]}
    />
  );
}
