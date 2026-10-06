import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Lock, Mail } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Notice } from '../components/Notice';
import { ScreenScroll } from '../components/ScreenScroll';
import { StatusBarShade } from '../components/StatusBarShade';
import { TealHeader } from '../components/TealHeader';
import { TextField } from '../components/TextField';
import {
  errorMessage,
  fieldErrors,
  useAppDispatch,
  useAppSelector,
} from '../store';
import { useAppConfigQuery, useLoginMutation } from '../store/api/authApi';
import { signedIn } from '../store/slices/sessionSlice';
import { colors, fs, fonts, ms, radius, s, vs, space } from '../theme';

const HERO = vs(290);

export function SignInScreen({ onSignUp }: { onSignUp?: () => void }) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const endedBecause = useAppSelector(st => st.session.endedBecause);
  const [login, { isLoading, error, reset }] = useLoginMutation();
  // Hidden until the server says to show it.
  const showSignUp = useAppConfigQuery().data?.showSignUp ?? false;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      const reply = await login({
        email: email.trim(),
        password,
        device_name: `${Platform.OS === 'ios' ? 'iPhone' : 'Android'} app`,
      }).unwrap();
      dispatch(signedIn({ token: reply.token, user: reply.user }));
    } catch {
      // The message from the API is shown below.
    }
  };

  const fields = fieldErrors(error);
  const wrongLogin = (error as { status?: number } | undefined)?.status === 401;

  return (
    <View style={styles.root}>
      <StatusBarShade />
      <ScreenScroll
        bounces={false}
        padded={false}
        bottomGap={0}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scroll}
      >
        <TealHeader
          inTabs={false}
          rounded={false}
          topGap={28}
          arcHeight={HERO}
          style={styles.hero}
        >
          <View style={styles.brand}>
            <Logo size={46} />
            <View>
              <AppText style={styles.brandName}>Trust Diary</AppText>
              <AppText variant="metaStrong" color={colors.onTealSoft}>
                TrustLab Diagnostics
              </AppText>
            </View>
          </View>
          <AppText variant="display" color={colors.white} style={styles.title}>
            Sign in to{'\n'}start your shift
          </AppText>
          <AppText variant="bodyRegular" color={colors.onTealSoft}>
            Use your work email and password.
          </AppText>
        </TealHeader>

        <View style={styles.sheet}>
          {error ? (
            <Notice
              tone="error"
              title={
                wrongLogin
                  ? 'Email or password is incorrect'
                  : errorMessage(error)
              }
              text={
                wrongLogin
                  ? 'Check both and try again. Passwords are case-sensitive.'
                  : undefined
              }
              style={styles.alert}
            />
          ) : endedBecause ? (
            <Notice tone="info" title={endedBecause} style={styles.alert} />
          ) : null}

          <TextField
            label="Work email"
            icon={Mail}
            value={email}
            onChangeText={v => {
              setEmail(v);
              if (error) {
                reset();
              }
            }}
            placeholder="name@company.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            returnKeyType="next"
            error={fields.email}
          />
          <TextField
            label="Password"
            icon={Lock}
            secure
            value={password}
            onChangeText={v => {
              setPassword(v);
              if (error) {
                reset();
              }
            }}
            placeholder="Your password"
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            error={
              fields.password ??
              (wrongLogin ? 'Re-enter your password' : undefined)
            }
          />

          <Button
            label={isLoading ? 'Signing in…' : 'Sign in'}
            iconRight={ArrowRight}
            onPress={submit}
            disabled={!email || !password || isLoading}
            style={styles.cta}
          />

          {showSignUp && onSignUp ? (
            <Pressable
              onPress={onSignUp}
              hitSlop={s(8)}
              accessibilityRole="button"
              style={styles.signUp}
            >
              <AppText variant="bodyRegular" color={colors.inkMuted}>
                New organisation?{' '}
                <AppText variant="label" color={colors.teal}>
                  Create an account
                </AppText>
              </AppText>
            </Pressable>
          ) : null}

          <View style={[styles.grow, { paddingBottom: insets.bottom + vs(14) }]} />
        </View>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.teal },
  scroll: { flexGrow: 1 },
  hero: {
    minHeight: HERO,
    paddingHorizontal: space.gutter,
    paddingBottom: vs(50),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  brandName: {
    fontFamily: fonts.semibold,
    fontSize: fs(20),
    lineHeight: fs(26),
    color: colors.white,
  },
  title: { marginTop: vs(26), marginBottom: vs(8) },
  sheet: {
    flexGrow: 1,
    marginTop: -vs(30),
    paddingTop: vs(30),
    paddingHorizontal: space.gutter,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + ms(6),
    borderTopRightRadius: radius.xl + ms(6),
  },
  alert: { marginBottom: vs(18) },
  cta: { marginTop: vs(6) },
  signUp: { alignSelf: 'center', marginTop: vs(24) },
  grow: { flexGrow: 1, minHeight: vs(28) },
});
