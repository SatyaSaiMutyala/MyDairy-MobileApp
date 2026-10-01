import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyRound, Lock } from 'lucide-react-native';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextField } from '../components/TextField';
import { errorMessage, fieldErrors } from '../store';
import { useChangePasswordMutation } from '../store/api/authApi';
import { vs } from '../theme';

export function ChangePasswordScreen() {
  const [change, { isLoading, error, isSuccess, reset }] = useChangePasswordMutation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [local, setLocal] = useState<string>();

  const submit = async () => {
    // The API checks everything again; this only saves a round trip.
    if (confirm !== next) {
      setLocal('The new password and confirmation do not match.');
      return;
    }
    setLocal(undefined);
    try {
      await change({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      }).unwrap();
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      // Shown from the API's message below.
    }
  };

  const fields = fieldErrors(error);
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setLocal(undefined);
    if (error || isSuccess) {
      reset();
    }
  };

  return (
    <FormScreen
      title="Change password"
      footer={
        <Button
          label={isLoading ? 'Updating…' : 'Update password'}
          disabled={!current || !next || !confirm || isLoading}
          onPress={submit}
        />
      }>
      {isSuccess ? (
        <Notice
          tone="success"
          title="Password updated"
          text="Use the new password the next time you sign in."
          style={styles.notice}
        />
      ) : null}
      {error && !fields.current_password && !fields.password ? (
        <Notice tone="error" title={errorMessage(error)} style={styles.notice} />
      ) : null}
      <FormCard>
        <TextField
          label="Current password"
          icon={Lock}
          secure
          value={current}
          onChangeText={edit(setCurrent)}
          autoCapitalize="none"
          error={fields.current_password}
        />
        <TextField
          label="New password"
          icon={KeyRound}
          secure
          value={next}
          onChangeText={edit(setNext)}
          autoCapitalize="none"
          placeholder="At least 8 characters"
          error={fields.password}
        />
        <TextField
          label="Confirm new password"
          icon={KeyRound}
          secure
          value={confirm}
          onChangeText={edit(setConfirm)}
          autoCapitalize="none"
          error={local}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
