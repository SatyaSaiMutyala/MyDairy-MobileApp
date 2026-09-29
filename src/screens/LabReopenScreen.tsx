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
import { dateLabel, Phase, units } from '../data/labReadiness';
import { recordKey, useLab } from '../state/LabStore';
import { vs } from '../theme';

export function LabReopenScreen() {
  const nav = useNavigation();
  const { unitId, date, phase } = useRoute<any>().params as {
    unitId: string;
    date: string;
    phase: Phase;
  };
  const lab = useLab();
  const record = lab.records[recordKey(unitId, date, phase)];
  const unit = units.find(u => u.id === unitId);
  const [reason, setReason] = useState('');

  return (
    <FormScreen
      title="Reopen record"
      footer={
        <Button
          label="Reopen record"
          iconLeft={LockOpen}
          disabled={!reason.trim()}
          onPress={() => {
            lab.reopen(unitId, date, phase, reason.trim());
            nav.goBack();
          }}
        />
      }>
      <Notice
        tone="error"
        title="Reopening a signed record is itself a deviation"
        text="State the reason. It is kept with the record, and the sign-off selfie is removed."
        style={styles.notice}
      />
      <FormCard title={`${unit?.name} · ${phase} · ${dateLabel(date)}`}>
        {record?.signed ? (
          <SignerCard
            name={record.signed.by}
            role={record.signed.role}
            note={`Signed at ${record.signed.at}`}
          />
        ) : null}
        <TextArea
          label="Reason for reopening *"
          value={reason}
          onChangeText={setReason}
          maxLength={2000}
          placeholder="Why does this record need to change?"
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
