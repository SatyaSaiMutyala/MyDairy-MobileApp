import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { EscalationTrail } from '../components/EscalationTrail';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { errorMessage } from '../store';
import {
  useResolveTaskMutation,
  useTaskMetaQuery,
  useTaskQuery,
} from '../store/api/tasksApi';
import { toTask } from '../tasks/model';
import { vs } from '../theme';

export function ResolveTaskScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const query = useTaskQuery(id);
  const meta = useTaskMetaQuery();
  const [resolve, call] = useResolveTaskMutation();
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  const actions = useMemo(
    () => (meta.data?.actions ?? []).map(a => ({ id: a.key, label: a.label })),
    [meta.data],
  );

  const submit = async () => {
    try {
      await resolve({
        id,
        resolution_action: action,
        resolution_note: note.trim(),
      }).unwrap();
      nav.popTo('Tabs', { screen: 'Tasks' });
    } catch {
      // The API's message is shown at the top.
    }
  };

  const task = query.data ? toTask(query.data) : undefined;
  const failure = call.error ?? meta.error ?? query.error;

  return (
    <FormScreen
      title="Resolve escalation"
      footer={
        <Button
          label={
            call.isLoading
              ? 'Returning…'
              : task?.from
              ? `Return to ${task.from}`
              : 'Return'
          }
          iconLeft={Check}
          disabled={!action || !note.trim() || call.isLoading}
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
      {task ? <EscalationTrail task={task} /> : null}
      <FormCard title="Your answer">
        {!meta.data && !failure ? (
          <ShimmerRows rows={2} icon={false} />
        ) : (
          <>
            <Dropdown
              label="Action taken *"
              placeholder="Select action"
              options={actions}
              value={action}
              onChange={setAction}
            />
            <TextArea
              label="Resolution note *"
              value={note}
              onChangeText={setNote}
              placeholder="What did you decide or provide?"
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
