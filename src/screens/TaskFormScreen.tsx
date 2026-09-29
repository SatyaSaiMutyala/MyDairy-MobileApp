import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AttachmentList } from '../components/AttachmentList';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { PriorityPicker } from '../components/PriorityPicker';
import { RepeatFields } from '../components/RepeatFields';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { departments } from '../data/departments';
import { locations, Priority } from '../data/mock';
import { currentUser } from '../data/user';
import { useStore } from '../state/Store';
import type { PickedFile } from '../utils/files';
import { shortDate, TODAY_ISO } from '../utils/dates';
import {
  freqLabels,
  occurrenceFrom,
  Recurring,
  WEEKDAYS,
} from '../utils/recur';
import { s, vs } from '../theme';

export function TaskFormScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { tasks, addTask, updateTask } = useStore();
  const editing = tasks.find(t => t.id === route.params?.id);

  const [kind, setKind] = useState<'once' | 'recurring'>(
    editing?.repeat ? 'recurring' : 'once',
  );
  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [priority, setPriority] = useState<Priority>(
    editing?.priority ?? 'Medium',
  );
  const [dept, setDept] = useState(
    departments.find(d => d.label === editing?.area)?.id ?? currentUser.deptKey,
  );
  const [place, setPlace] = useState(editing?.location ?? 'none');
  const [tags, setTags] = useState(editing?.tags?.join(', ') ?? '');
  const [files, setFiles] = useState<PickedFile[]>(editing?.attachments ?? []);
  const [date, setDate] = useState(editing?.dueDate ?? TODAY_ISO);
  const [time, setTime] = useState(editing?.dueTime ?? '');
  const [hard, setHard] = useState(!!editing?.hard);
  const [repeat, setRepeat] = useState<Recurring>(
    editing?.recurring ?? { freq: 'weekly', days: WEEKDAYS, start: TODAY_ISO },
  );
  const recurring = kind === 'recurring';

  const save = () => {
    const tagList = tags
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    // A recurring task has no deadline of its own: it is due on its next
    // occurrence, at the time of day chosen under Repeat.
    const day = recurring
      ? occurrenceFrom(repeat, TODAY_ISO) ?? TODAY_ISO
      : date || TODAY_ISO;
    const at = recurring ? repeat.time ?? '' : time;
    const isToday = day === TODAY_ISO;
    const task = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      area: departments.find(d => d.id === dept)!.label,
      location: place === 'none' ? undefined : place,
      tags: tagList.length ? tagList : undefined,
      attachments: files.length ? files : undefined,
      hard,
      dueDate: day,
      dueTime: at || undefined,
      due: isToday ? at || 'Today' : shortDate(day),
      repeat: recurring ? freqLabels[repeat.freq] : undefined,
      recurring: recurring ? repeat : undefined,
      bucket: day <= TODAY_ISO ? ('today' as const) : ('upcoming' as const),
      overdue: day < TODAY_ISO,
    };
    if (editing) {
      updateTask(editing.id, task);
    } else {
      addTask({ ...task, owner: currentUser.name });
    }
    nav.goBack();
  };

  return (
    <FormScreen
      title={editing ? 'Edit task' : 'Add task'}
      footer={
        <Button label="Save task" disabled={!title.trim()} onPress={save} />
      }
    >
      <FormCard>
        {
          <ChoiceGroup
            label="Task type"
            style={styles.field}
            value={kind}
            onChange={k => k && setKind(k)}
            options={[
              { key: 'once', label: 'One-time' },
              { key: 'recurring', label: 'Recurring' },
            ]}
          />
        }
        <TextField
          label="Task title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="What needs to be done?"
        />
        <TextArea
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details if needed"
        />
        <PriorityPicker
          value={priority}
          onChange={setPriority}
          style={styles.field}
        />
        <Dropdown
          label="Category"
          options={departments}
          value={dept}
          onChange={setDept}
        />
        <Dropdown
          label="Location"
          options={locations}
          value={place}
          onChange={setPlace}
        />
        <TextField
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
          placeholder="e.g. audit, nabl"
        />
      </FormCard>

      {recurring ? (
        <FormCard title="Repeat">
          <RepeatFields value={repeat} onChange={setRepeat} />
          <SwitchRow
            label="Hard deadline"
            detail="Mark this when the date cannot move."
            value={hard}
            onChange={setHard}
          />
        </FormCard>
      ) : (
        <FormCard title="Deadline">
          <View style={styles.pair}>
            <DateField
              label="Due date"
              value={date}
              onChange={setDate}
              style={styles.date}
            />
            <TimeField
              label="Time"
              placeholder="Any time"
              value={time}
              onChange={setTime}
              style={styles.time}
            />
          </View>
          <SwitchRow
            label="Hard deadline"
            detail="Mark this when the date cannot move."
            value={hard}
            onChange={setHard}
          />
        </FormCard>
      )}

      <FormCard title="Attachments" style={styles.files}>
        <AttachmentList
          files={files}
          onAdd={added => setFiles(list => [...list, ...added])}
          onRemove={id => setFiles(list => list.filter(f => f.id !== id))}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: vs(12) },
  pair: { flexDirection: 'row', gap: s(12) },
  date: { flex: 1.5 },
  time: { flex: 1 },
  files: { paddingBottom: vs(14) },
});
