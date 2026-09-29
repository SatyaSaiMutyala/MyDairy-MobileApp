import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyRound, Lock } from 'lucide-react-native';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextField } from '../components/TextField';
import { DEMO_PASSWORD } from '../data/mock';
import { vs } from '../theme';

export function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  const errors = {
    current:
      current !== DEMO_PASSWORD ? 'Your current password is incorrect.' : undefined,
    next:
      next.length < 8
        ? 'Use at least 8 characters.'
        : next === current
        ? 'Choose a password different from the current one.'
        : undefined,
    confirm: confirm !== next ? 'The two passwords do not match.' : undefined,
  };
  const valid = !errors.current && !errors.next && !errors.confirm;

  const submit = () => {
    setTried(true);
    if (valid) {
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTried(false);
    }
  };

  return (
    <FormScreen
      title="Change password"
      footer={
        <Button
          label="Update password"
          disabled={!current || !next || !confirm}
          onPress={submit}
        />
      }>
      {done ? (
        <Notice
          tone="success"
          title="Password updated"
          text="Use the new password the next time you sign in."
          style={styles.notice}
        />
      ) : null}
      <FormCard>
        <TextField
          label="Current password"
          icon={Lock}
          secure
          value={current}
          onChangeText={v => {
            setCurrent(v);
            setDone(false);
          }}
          autoCapitalize="none"
          error={tried ? errors.current : undefined}
        />
        <TextField
          label="New password"
          icon={KeyRound}
          secure
          value={next}
          onChangeText={setNext}
          autoCapitalize="none"
          placeholder="At least 8 characters"
          error={tried ? errors.next : undefined}
        />
        <TextField
          label="Confirm new password"
          icon={KeyRound}
          secure
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="none"
          error={tried ? errors.confirm : undefined}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
