import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { KeyboardAvoider } from '../components/KeyboardAvoider';
import { Logo } from '../components/Logo';
import { ScreenScroll } from '../components/ScreenScroll';
import { StatusBarShade } from '../components/StatusBarShade';
import { TealHeader } from '../components/TealHeader';
import { TextField } from '../components/TextField';
import { colors, fs, fonts, ms, radius, s, vs, space } from '../theme';

const HERO = vs(250);
const MIN_PASSWORD = 8;

// Create an account for a new organisation. Static for now: the details are
// checked on the phone and a confirmation is shown; nothing is sent anywhere.
export function SignUpScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [tried, setTried] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const errors = {
    company: company.trim() ? undefined : 'Enter your organisation name',
    name: name.trim() ? undefined : 'Enter your name',
    email: emailOk ? undefined : 'Enter a valid work email',
    password:
      password.length >= MIN_PASSWORD
        ? undefined
        : `Use at least ${MIN_PASSWORD} characters`,
    again: again === password ? undefined : 'Passwords do not match',
  };
  const ready = !Object.values(errors).some(Boolean);

  const submit = async () => {
    setTried(true);
    if (!ready) {
      return;
    }
    await confirm({
      tone: 'success',
      single: true,
      title: 'Account request received',
      text: `Thanks, ${name.trim()}. We will set up the workspace for ${company.trim()} and email ${email.trim()} with the sign-in details.`,
      confirmLabel: 'Back to sign in',
    });
    onDone();
  };

  const show = (key: keyof typeof errors) => (tried ? errors[key] : undefined);

  return (
    <KeyboardAvoider style={styles.root}>
      <StatusBarShade />
      <ScreenScroll
        bounces={false}
        padded={false}
        bottomGap={0}
        contentContainerStyle={styles.scroll}
      >
        <TealHeader
          inTabs={false}
          rounded={false}
          topGap={28}
          arcHeight={HERO}
          style={styles.hero}
        >
          <Pressable
            onPress={onDone}
            hitSlop={s(10)}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            style={styles.back}
          >
            <ChevronLeft size={s(22)} color={colors.white} strokeWidth={2} />
            <AppText variant="label" color={colors.white}>
              Sign in
            </AppText>
          </Pressable>
          <View style={styles.brand}>
            <Logo size={40} />
            <AppText style={styles.brandName}>Trust Diary</AppText>
          </View>
          <AppText variant="display" color={colors.white} style={styles.title}>
            Create an account
          </AppText>
          <AppText variant="bodyRegular" color={colors.onTealSoft}>
            Set up a workspace for your organisation.
          </AppText>
        </TealHeader>

        <View style={styles.sheet}>
          <TextField
            label="Organisation name"
            icon={Building2}
            value={company}
            onChangeText={setCompany}
            placeholder="e.g. Sunrise Diagnostics"
            autoCapitalize="words"
            returnKeyType="next"
            error={show('company')}
          />
          <TextField
            label="Your name"
            icon={UserRound}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            autoCapitalize="words"
            textContentType="name"
            returnKeyType="next"
            error={show('name')}
          />
          <TextField
            label="Work email"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="name@company.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            error={show('email')}
          />
          <TextField
            label="Phone (optional)"
            icon={Phone}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            returnKeyType="next"
          />
          <TextField
            label="Password"
            icon={Lock}
            secure
            value={password}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            autoCapitalize="none"
            textContentType="newPassword"
            returnKeyType="next"
            error={show('password')}
          />
          <TextField
            label="Confirm password"
            icon={Lock}
            secure
            value={again}
            onChangeText={setAgain}
            placeholder="Type it again"
            autoCapitalize="none"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
            error={show('again')}
          />

          <Button
            label="Create account"
            iconRight={ArrowRight}
            onPress={submit}
            style={styles.cta}
          />

          <AppText
            variant="meta"
            color={colors.inkMuted}
            style={styles.terms}
          >
            By creating an account you agree to keep your sign-in details
            private and use Trust Diary only for your organisation's work.
          </AppText>

          <View style={styles.grow} />
          <AppText
            variant="meta"
            color={colors.inkMuted}
            style={[styles.legal, { paddingBottom: insets.bottom + vs(14) }]}
          >
            Already have an account?{' '}
            <AppText variant="metaStrong" color={colors.teal} onPress={onDone}>
              Sign in
            </AppText>
          </AppText>
        </View>
      </ScreenScroll>
    </KeyboardAvoider>
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
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
    alignSelf: 'flex-start',
    marginLeft: -s(6),
    marginBottom: vs(14),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  brandName: {
    fontFamily: fonts.semibold,
    fontSize: fs(18),
    lineHeight: fs(24),
    color: colors.white,
  },
  title: { marginTop: vs(18), marginBottom: vs(6) },
  sheet: {
    flexGrow: 1,
    marginTop: -vs(30),
    paddingTop: vs(30),
    paddingHorizontal: space.gutter,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + ms(6),
    borderTopRightRadius: radius.xl + ms(6),
  },
  cta: { marginTop: vs(6) },
  terms: { textAlign: 'center', marginTop: vs(16), paddingHorizontal: s(16) },
  grow: { flexGrow: 1, minHeight: vs(24) },
  legal: { textAlign: 'center' },
});
