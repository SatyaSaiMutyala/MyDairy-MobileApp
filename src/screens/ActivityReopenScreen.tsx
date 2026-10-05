import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LockOpen } from 'lucide-react-native';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { TextArea } from '../components/TextArea';
import { errorMessage, fieldErrors } from '../store';
import { useReopenActivityMutation } from '../store/api/activityApi';
import { longDate } from '../utils/dates';
import { vs } from '../theme';

type Params = {
  id: number;
  name: string;
  date: string;
  signedOn: string | null;
};

// Admin and CMD: unlock a signed-off day so the person can change it.
export function ActivityReopenScreen() {
  const nav = useNavigation();
  const p = useRoute<any>().params as Params;
  const [reopen, call] = useReopenActivityMutation();
  const [reason, setReason] = useState('');

  const submit = async () => {
    try {
      await reopen({ id: p.id, reason: reason.trim() }).unwrap();
      nav.goBack();
    } catch {
      // Shown from the API's message below.
    }
  };

  return (
    <FormScreen
      title="Reopen activity log"
      footer={
        <Button
          label={call.isLoading ? 'Reopening…' : 'Reopen this day'}
          iconLeft={LockOpen}
          disabled={!reason.trim() || call.isLoading}
          onPress={submit}
        />
      }
    >
      <Notice
        tone="error"
        title="Reopening a signed log is an exception"
        text="State the reason. It is kept with the record, and the person is told."
        style={styles.notice}
      />
      {call.error && !fieldErrors(call.error).reason ? (
        <Notice
          tone="error"
          title={errorMessage(call.error)}
          style={styles.notice}
        />
      ) : null}
      <FormCard title={`${p.name} · ${longDate(p.date)}`}>
        <InfoRow label="Signed off" value={p.signedOn} />
        <TextArea
          label="Reason for reopening *"
          value={reason}
          onChangeText={setReason}
          maxLength={2000}
          placeholder="Why does this day need to change?"
          invalid={!!fieldErrors(call.error).reason}
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
