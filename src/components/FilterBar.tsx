import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SlidersHorizontal, X } from 'lucide-react-native';
import {
  colors,
  fieldHeight,
  fonts,
  fs,
  hairline,
  ms,
  radius,
  s,
  vs,
} from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconButton } from './IconButton';

type ButtonProps = {
  // How many filters are switched on.
  active: number;
  open: boolean;
  onPress: () => void;
};

// The square button that opens the filters. Sits beside a search field and
// shows how many filters are on.
export function FilterButton({ active, open, onPress }: ButtonProps) {
  const on = open || active > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={active ? `Filters, ${active} on` : 'Filters'}
      accessibilityState={{ expanded: open }}
      style={[styles.button, on && styles.buttonOn]}
    >
      <SlidersHorizontal
        size={s(17)}
        color={on ? colors.tealDeep : colors.inkSoft}
        strokeWidth={2}
      />
      {active ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{active}</AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  active: number;
  onClear: () => void;
  // Label of the button that closes the drawer, e.g. "Show tasks".
  doneLabel?: string;
  children: React.ReactNode;
};

// The filter fields, in a drawer that slides in from the right edge. The
// list underneath updates as each filter is changed.
export function FilterBar({
  open,
  onClose,
  active,
  onClear,
  doneLabel = 'Show results',
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panel = Math.min(width * 0.86, s(340));
  const slide = useRef(new Animated.Value(0)).current;
  // Stays mounted while the drawer slides back out.
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setShown(true);
    }
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: open ? 240 : 190,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) {
        setShown(false);
      }
    });
  }, [open, slide]);

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={shown}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.veil, { opacity: slide }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close filters"
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            width: panel,
            paddingTop: insets.top + vs(6),
            paddingBottom: insets.bottom + vs(10),
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [panel, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.head}>
          <AppText variant="heading">Filters</AppText>
          <IconButton
            icon={X}
            label="Close filters"
            iconSize={20}
            onPress={onClose}
          />
        </View>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.fields}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <View style={styles.foot}>
          <Button
            label="Clear all"
            variant="outline"
            size="md"
            disabled={!active}
            onPress={onClear}
            style={styles.footButton}
          />
          <Button
            label={doneLabel}
            size="md"
            onPress={onClose}
            style={styles.footButton}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: fieldHeight,
    height: fieldHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buttonOn: { backgroundColor: colors.tealTint, borderColor: colors.tealLine },
  badge: {
    position: 'absolute',
    top: -s(5),
    right: -s(5),
    minWidth: s(16),
    height: s(16),
    paddingHorizontal: s(3),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: fs(10),
    lineHeight: fs(13),
    color: colors.white,
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.veil,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ground,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: s(16),
    paddingRight: s(8),
    paddingBottom: vs(8),
    borderBottomWidth: hairline,
    borderBottomColor: colors.line,
  },
  body: { flex: 1 },
  fields: { paddingHorizontal: s(16), paddingTop: vs(14) },
  foot: {
    flexDirection: 'row',
    gap: s(10),
    paddingHorizontal: s(16),
    paddingTop: vs(10),
    borderTopWidth: hairline,
    borderTopColor: colors.line,
  },
  footButton: { flex: 1 },
});
