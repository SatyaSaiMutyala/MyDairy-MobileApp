import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, type, TypeVariant } from '../theme';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
};

export function AppText({
  variant = 'body',
  color = colors.ink,
  style,
  ...rest
}: Props) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[type[variant], { color, includeFontPadding: false }, style]}
    />
  );
}
