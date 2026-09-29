import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { EscalationTrail } from '../components/EscalationTrail';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { TextArea } from '../components/TextArea';
import { resolutionActions } from '../data/mock';
import { useStore } from '../state/Store';

export function ResolveTaskScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, resolveTask } = useStore();
  const task = tasks.find(t => t.id === route.params?.id);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  return (
    <FormScreen
      title="Resolve escalation"
      footer={
        <Button
          label={task?.from ? `Return to ${task.from}` : 'Return'}
          iconLeft={Check}
          disabled={!action || !note.trim()}
          onPress={() => {
            if (task) {
              resolveTask(task.id);
            }
            nav.navigate('Tabs', { screen: 'Tasks' });
          }}
        />
      }>
      {task ? <EscalationTrail task={task} /> : null}
      <FormCard title="Your answer">
        <Dropdown
          label="Action taken *"
          placeholder="Select action"
          options={resolutionActions}
          value={action}
          onChange={setAction}
        />
        <TextArea
          label="Resolution note *"
          value={note}
          onChangeText={setNote}
          placeholder="What did you decide or provide?"
        />
      </FormCard>
    </FormScreen>
  );
}
