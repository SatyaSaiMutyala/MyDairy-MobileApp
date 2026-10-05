import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LockOpen } from 'lucide-react-native';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { SignerCard } from '../components/SignerCard';
import { TextArea } from '../components/TextArea';
import { phaseName } from '../lab/model';
import { errorMessage, fieldErrors } from '../store';
import {
  Target,
  useLabReopenMutation,
  useLabStateQuery,
} from '../store/api/labApi';
import { longDate } from '../utils/dates';
import { vs } from '../theme';

export function LabReopenScreen() {
  const nav = useNavigation();
  const target = useRoute<any>().params as Target;
  const state = useLabStateQuery(target);
  const [reopen, call] = useLabReopenMutation();
  const [reason, setReason] = useState('');
  const run = state.data?.run;

  const submit = async () => {
    try {
      await reopen({ ...target, reason: reason.trim() }).unwrap();
      nav.goBack();
    } catch {
      // Shown from the API's message below.
    }
  };

  return (
    <FormScreen
      title="Reopen record"
      footer={
        <Button
          label={call.isLoading ? 'Reopening…' : 'Reopen record'}
          iconLeft={LockOpen}
          disabled={!reason.trim() || call.isLoading}
          onPress={submit}
        />
      }
    >
      <Notice
        tone="error"
        title="Reopening a signed record is itself a deviation"
        text="State the reason. It is kept with the record, and the sign-off selfie is removed."
        style={styles.notice}
      />
      {call.error && !fieldErrors(call.error).reason ? (
        <Notice
          tone="error"
          title={errorMessage(call.error)}
          style={styles.notice}
        />
      ) : null}
      <FormCard
        title={`${state.data?.unit.name ?? ''} · ${phaseName(
          target.phase,
        )} · ${longDate(target.date)}`}
      >
        {run?.signed ? (
          <SignerCard
            name={run.signedBy ?? ''}
            role={run.signedRole ?? ''}
            note={`Signed at ${run.signedAt}`}
          />
        ) : null}
        <TextArea
          label="Reason for reopening *"
          value={reason}
          onChangeText={setReason}
          maxLength={2000}
          placeholder="Why does this record need to change?"
          invalid={!!fieldErrors(call.error).reason}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
