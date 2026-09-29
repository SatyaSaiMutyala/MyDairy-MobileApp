import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  height: number;
  variant?: 'header' | 'splash';
};

// The broad leaf-like sweep behind every teal surface.
// Drawn in a 390-wide box and stretched to the device, so it needs no scaling.
export function ArcBackdrop({ height, variant = 'header' }: Props) {
  const { width } = useWindowDimensions();
  const vbHeight = (height / width) * 390;

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      viewBox={`0 0 390 ${vbHeight}`}
      preserveAspectRatio="xMidYMin slice">
      {variant === 'splash' ? (
        <>
          <Path
            d="M50 290 C50 120 170 -10 340 -60"
            stroke={colors.tealLift}
            strokeWidth={96}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M56 340 C86 250 150 185 251 170"
            stroke={colors.lime}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M-60 ${vbHeight * 0.69} C120 ${vbHeight * 0.74} 230 ${
              vbHeight * 0.86
            } 270 ${vbHeight + 60}`}
            stroke={colors.tealShade}
            strokeWidth={104}
            fill="none"
          />
        </>
      ) : (
        <Path
          d="M120 250 C120 120 210 10 360 -50"
          stroke={colors.tealLift}
          strokeWidth={84}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </Svg>
  );
}
