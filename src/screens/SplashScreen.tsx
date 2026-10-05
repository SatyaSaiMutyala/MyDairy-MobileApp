import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { ArcBackdrop } from '../components/ArcBackdrop';
import { AppText } from '../components/AppText';
import { Logo } from '../components/Logo';
import { colors, fs, fonts, radius, s, vs } from '../theme';

type Props = { onDone: () => void };

const TRACK = s(130);

export function SplashScreen({ onDone }: Props) {
  const { height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(progress, {
      toValue: 1,
      duration: 1700,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => finished && onDone());
  }, [onDone, progress, rise]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ArcBackdrop height={height} variant="splash" />

      <Animated.View
        style={[
          styles.centre,
          {
            opacity: rise,
            transform: [
              {
                translateY: rise.interpolate({
                  inputRange: [0, 1],
                  outputRange: [vs(14), 0],
                }),
              },
            ],
          },
        ]}
      >
        <Logo size={112} elevated />
        <AppText style={styles.name}>Trust Diary</AppText>
        <AppText style={styles.org}>TRUSTLAB DIAGNOSTICS</AppText>
      </Animated.View>

      <View style={styles.foot}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.bar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [TRACK * 0.12, TRACK],
                }),
              },
            ]}
          />
        </View>
        <AppText variant="body" color={colors.onTealSoft}>
          Preparing your day
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.teal },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: {
    fontFamily: fonts.semibold,
    fontSize: fs(44),
    lineHeight: fs(54),
    color: colors.white,
    marginTop: vs(26),
  },
  org: {
    fontFamily: fonts.medium,
    fontSize: fs(13),
    lineHeight: fs(18),
    letterSpacing: fs(3.2),
    color: colors.onTealSoft,
    marginTop: vs(2),
  },
  foot: { alignItems: 'center', paddingBottom: vs(64), gap: vs(14) },
  track: {
    width: TRACK,
    height: vs(4),
    borderRadius: radius.pill,
    backgroundColor: colors.tealShade,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
  },
});
