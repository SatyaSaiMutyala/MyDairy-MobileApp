import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { FooterBar } from './FooterBar';
import { ScreenScroll } from './ScreenScroll';
import { TopBar } from './TopBar';

type Props = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  right?: React.ReactNode;
};

// Standard inner screen: top bar, scrolling body, action pinned at the bottom.
export function FormScreen({ title, children, footer, right }: Props) {
  const nav = useNavigation();
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar title={title} right={right} onBack={() => nav.canGoBack() && nav.goBack()} />
      <ScreenScroll bottomGap={24}>{children}</ScreenScroll>
      {footer ? <FooterBar>{footer}</FooterBar> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
});
