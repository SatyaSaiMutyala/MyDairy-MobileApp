import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Lock, Trash2 } from 'lucide-react-native';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { lastPushToken } from '../push/usePush';
import { errorMessage, fieldErrors, useAppDispatch } from '../store';
import { useDeleteAccountMutation } from '../store/api/authApi';
import { useForgetDeviceMutation } from '../store/api/notificationsApi';
import { sessionEnded } from '../store/slices/sessionSlice';
import { vs } from '../theme';

// The person's own request to delete their account. The server closes the
// account at once and tells the administrators; the phone is signed out.
export function DeleteAccountScreen() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [remove, call] = useDeleteAccountMutation();
  const [forgetDevice] = useForgetDeviceMutation();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const submit = async () => {
    const yes = await confirm({
      title: 'Delete your account?',
      text: 'You will be signed out now and will not be able to sign in again. Your administrator will erase your details.',
      confirmLabel: 'Delete my account',
      cancelLabel: 'Keep it',
      tone: 'danger',
    });
    if (!yes) {
      return;
    }
    try {
      const address = lastPushToken();
      if (address) {
        await forgetDevice(address)
          .unwrap()
          .catch(() => {});
      }
      const reply = await remove({
        password,
        reason: reason.trim() || undefined,
      }).unwrap();
      dispatch(sessionEnded(reply.message));
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);

  return (
    <FormScreen
      title="Delete my account"
      footer={
        <Button
          label={call.isLoading ? 'Deleting…' : 'Delete my account'}
          variant="danger"
          iconLeft={Trash2}
          disabled={!password || call.isLoading}
          onPress={submit}
        />
      }
    >
      <Notice
        tone="error"
        title="This cannot be undone"
        text="Your account is closed immediately. You lose access to your tasks, diary, checklists and reports in Trust Diary. Records you created for your organisation stay with the organisation."
        style={styles.notice}
      />
      {call.error && !errors.password ? (
        <Notice
          tone="error"
          title={errorMessage(call.error)}
          style={styles.notice}
        />
      ) : null}
      <FormCard title="Confirm it is you">
        <TextField
          label="Your password *"
          icon={Lock}
          secure
          value={password}
          onChangeText={setPassword}
          placeholder="Current password"
          autoCapitalize="none"
          textContentType="password"
          error={errors.password}
        />
        <TextArea
          label="Why are you leaving? (optional)"
          value={reason}
          onChangeText={setReason}
          maxLength={500}
          placeholder="Helps us improve Trust Diary"
          style={styles.field}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginTop: vs(10) },
});
