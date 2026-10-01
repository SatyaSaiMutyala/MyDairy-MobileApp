import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { AlertRow } from '../components/AlertRow';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { toAlert } from '../alerts/model';
import { errorMessage } from '../store';
import { useAlertQuery, useResolveAlertMutation } from '../store/api/alertsApi';
import { vs } from '../theme';

export function ResolveAlertScreen() {
  const nav = useNavigation();
  const id: number = useRoute<any>().params?.id;
  const query = useAlertQuery(id);
  const [resolve, call] = useResolveAlertMutation();
  const [note, setNote] = useState('');

  const submit = async () => {
    try {
      await resolve({ id, note: note.trim() || undefined }).unwrap();
      nav.goBack();
    } catch {
      // The API's message is shown at the top.
    }
  };
  const failure = call.error ?? query.error;

  return (
    <FormScreen
      title="Resolve alert"
      footer={
        <Button
          label={call.isLoading ? 'Saving…' : 'Mark as resolved'}
          iconLeft={Check}
          disabled={!query.data || call.isLoading}
          onPress={submit}
        />
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.alert}
        />
      ) : null}
      <Card style={styles.alert}>
        {query.data ? (
          <AlertRow alert={toAlert(query.data)} />
        ) : query.error ? null : (
          <ShimmerRows rows={1} />
        )}
      </Card>
      <FormCard title="How was it fixed?">
        <TextArea
          label="Resolution note (optional)"
          value={note}
          onChangeText={setNote}
          maxLength={5000}
          placeholder="e.g. Door seal replaced, freezer back to −20 °C at 11:40"
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  alert: { marginTop: vs(10) },
});
