import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Calendar,
  ClipboardPen,
  FlaskConical,
  House,
  LayoutGrid,
  SquareCheck,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { colors, fonts, hairline, radius, s, vs } from '../theme';

const icons: Record<string, LucideIcon> = {
  Home: House,
  Tasks: SquareCheck,
  Diary: Calendar,
  Lab: FlaskConical,
  Activity: ClipboardPen,
  More: LayoutGrid,
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, vs(8)) }]}>
      {state.routes.map((route, index) => {
        const on = state.index === index;
        const Icon = icons[route.name];
        const ink = on ? colors.teal : colors.inkSoft;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!on && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={route.name}
            style={styles.tab}>
            <View style={[styles.well, on && styles.wellOn]}>
              <Icon size={s(22)} color={ink} strokeWidth={on ? 2 : 1.75} />
            </View>
            <AppText
              variant="tab"
              color={ink}
              style={on ? styles.labelOn : undefined}>
              {route.name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: vs(8),
    paddingHorizontal: s(6),
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.line,
  },
  tab: { flex: 1, alignItems: 'center', gap: vs(3) },
  well: {
    width: s(54),
    height: vs(30),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellOn: { backgroundColor: colors.tealTint },
  labelOn: { fontFamily: fonts.semibold },
});
