import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowUpRight } from 'lucide-react-native';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextArea } from '../components/TextArea';
import { colleagues, escalationReasons } from '../data/mock';
import { shortDate } from '../utils/dates';
import { clockNow, useStore } from '../state/Store';
import { StyleSheet } from 'react-native';
import { vs } from '../theme';

export function EscalateTaskScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, escalateTask } = useStore();
  const task = tasks.find(t => t.id === route.params?.id);

  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [by, setBy] = useState('');

  const submit = () => {
    if (task) {
      escalateTask(task.id, colleagues.find(c => c.id === to)!.label, {
        reason: escalationReasons.find(r => r.id === reason)!.label,
        note: note.trim() || undefined,
        expectedBy: by ? shortDate(by) : undefined,
        on: `Today, ${clockNow()}`,
      });
    }
    nav.navigate('Tabs', { screen: 'Tasks' });
  };

  return (
    <FormScreen
      title="Escalate task"
      footer={
        <Button
          label="Escalate"
          iconLeft={ArrowUpRight}
          disabled={!to || !reason}
          onPress={submit}
        />
      }>
      {task ? (
        <Notice tone="info" title={task.title} text={`${task.area} · due ${task.due}`} style={styles.notice} />
      ) : null}
      <FormCard>
        <Dropdown
          label="Escalate to *"
          placeholder="Select user"
          options={colleagues}
          value={to}
          onChange={setTo}
        />
        <Dropdown
          label="Escalation reason *"
          placeholder="Select reason"
          options={escalationReasons}
          value={reason}
          onChange={setReason}
        />
        <TextArea
          label="Notes to escalatee"
          value={note}
          onChangeText={setNote}
          placeholder="What do you need from them?"
        />
        <DateField
          clearable
          label="Expected resolution by"
          value={by}
          onChange={setBy}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
