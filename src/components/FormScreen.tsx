import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { FooterBar } from './FooterBar';
import { KeyboardAvoider } from './KeyboardAvoider';
import { ScreenScroll } from './ScreenScroll';
import { TopBar } from './TopBar';

type Props = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  right?: React.ReactNode;
  // For paged lists: called when the person scrolls near the bottom.
  onEndReached?: () => void;
  onRefresh?: () => Promise<unknown> | void;
};

// Standard inner screen: top bar, scrolling body, action pinned at the bottom.
export function FormScreen({
  title,
  children,
  footer,
  right,
  onEndReached,
  onRefresh,
}: Props) {
  const nav = useNavigation();
  return (
    <KeyboardAvoider style={styles.root}>
      <TopBar
        title={title}
        right={right}
        onBack={() => nav.canGoBack() && nav.goBack()}
      />
      <ScreenScroll
        bottomGap={24}
        onEndReached={onEndReached}
        onRefresh={onRefresh}
      >
        {children}
      </ScreenScroll>
      {footer ? <FooterBar>{footer}</FooterBar> : null}
    </KeyboardAvoider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
});
