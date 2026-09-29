import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { AlertRow } from '../components/AlertRow';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { TextArea } from '../components/TextArea';
import { useStore } from '../state/Store';
import { vs } from '../theme';

export function ResolveAlertScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { alerts, resolveAlert } = useStore();
  const alert = alerts.find(a => a.id === route.params?.id);
  const [note, setNote] = useState('');

  if (!alert) {
    return (
      <FormScreen title="Resolve alert">
        <EmptyState text="This alert is no longer available." />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title="Resolve alert"
      footer={
        <Button
          label="Mark as resolved"
          iconLeft={Check}
          onPress={() => {
            resolveAlert(alert.id, note);
            nav.goBack();
          }}
        />
      }>
      <Card style={styles.alert}>
        <AlertRow alert={alert} />
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
