import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, ms, s, shadow } from '../theme';

const mark = require('../../assets/images/logo.png');
const RATIO = 363 / 444;

type Props = {
  size?: number;
  elevated?: boolean;
};

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Image
      source={mark}
      resizeMode="contain"
      accessibilityLabel="TrustLab"
      style={{ width: s(size), height: s(size * RATIO) }}
    />
  );
}

export function Logo({ size = 48, elevated = false }: Props) {
  return (
    <View
      style={[
        styles.tile,
        {
          width: s(size),
          height: s(size),
          borderRadius: ms(size * 0.3, 1),
        },
        elevated && styles.elevated,
      ]}>
      <LogoMark size={size * 0.68} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevated: {
    ...shadow.card,
    shadowOpacity: 0.22,
    shadowRadius: ms(24),
    elevation: 10,
  },
});
