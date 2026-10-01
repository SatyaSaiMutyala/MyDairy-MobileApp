import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowUpRight } from 'lucide-react-native';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { PersonPicker } from '../components/PersonPicker';
import { ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { errorMessage } from '../store';
import {
  useEscalateTaskMutation,
  useTaskMetaQuery,
  useTaskQuery,
} from '../store/api/tasksApi';
import { toTask } from '../tasks/model';
import { vs } from '../theme';

export function EscalateTaskScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const query = useTaskQuery(id);
  const meta = useTaskMetaQuery();
  const [escalate, call] = useEscalateTaskMutation();

  const [to, setTo] = useState<DropdownOption>();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [by, setBy] = useState('');

  const reasons = useMemo(
    () => (meta.data?.reasons ?? []).map(r => ({ id: r.key, label: r.label })),
    [meta.data],
  );

  const submit = async () => {
    try {
      await escalate({
        id,
        to_user_id: Number(to?.id),
        reason,
        note: note.trim() || undefined,
        expected_resolution_by: by || undefined,
      }).unwrap();
      nav.navigate('Tabs', { screen: 'Tasks' });
    } catch {
      // The API's message is shown at the top.
    }
  };

  const task = query.data ? toTask(query.data) : undefined;
  const loading = !meta.data;
  const failure = call.error ?? meta.error ?? query.error;

  return (
    <FormScreen
      title="Escalate task"
      footer={
        <Button
          label={call.isLoading ? 'Escalating…' : 'Escalate'}
          iconLeft={ArrowUpRight}
          disabled={!to || !reason || call.isLoading}
          onPress={submit}
        />
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.notice}
        />
      ) : null}
      {task ? (
        <Notice
          tone="info"
          title={task.title}
          text={`${task.area} · due ${task.due}`}
          style={styles.notice}
        />
      ) : null}
      <FormCard>
        {loading && !failure ? (
          <ShimmerRows rows={3} icon={false} />
        ) : (
          <>
            <PersonPicker
              excludeMe
              label="Escalate to *"
              placeholder="Select user"
              value={to}
              onChange={setTo}
            />
            <Dropdown
              label="Escalation reason *"
              placeholder="Select reason"
              options={reasons}
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
          </>
        )}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
});
