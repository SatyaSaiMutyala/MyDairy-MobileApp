import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AttachmentList } from '../components/AttachmentList';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { PriorityPicker } from '../components/PriorityPicker';
import { RepeatFields } from '../components/RepeatFields';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import type { Priority } from '../data/mock';
import { errorMessage, fieldErrors } from '../store';
import {
  TaskMeta,
  useSaveTaskMutation,
  useTaskMetaQuery,
  useTaskQuery,
} from '../store/api/tasksApi';
import { savedId, Task, taskForm, toTask } from '../tasks/model';
import type { PickedFile } from '../utils/files';
import { realToday } from '../utils/dates';
import { Recurring, WEEKDAYS } from '../utils/recur';
import { s, vs } from '../theme';

const NO_PLACE = 'none';

// Waits for the choices (and, when editing, the task) before drawing the form.
export function TaskFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const meta = useTaskMetaQuery();
  const task = useTaskQuery(id as number, { skip: !id });
  const failure = meta.error ?? task.error;
  const title = id ? 'Edit task' : 'Add task';

  if (!meta.data || (id && !task.data)) {
    return (
      <FormScreen title={title}>
        {failure ? (
          <Notice
            tone="error"
            title={errorMessage(failure)}
            style={styles.notice}
          />
        ) : (
          <FormCard>
            <ShimmerRows rows={5} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }
  return (
    <TaskForm
      title={title}
      meta={meta.data}
      editing={task.data ? toTask(task.data) : undefined}
    />
  );
}

type FormProps = { title: string; meta: TaskMeta; editing?: Task };

function TaskForm({ title: heading, meta, editing }: FormProps) {
  const nav = useNavigation();
  const [save, call] = useSaveTaskMutation();
  const today = realToday();

  const categories = useMemo(
    () => meta.categories.map(c => ({ id: c.key, label: c.label })),
    [meta],
  );
  const places = useMemo(
    () => [
      { id: NO_PLACE, label: 'No location' },
      ...meta.locations.map(l => ({ id: l.key, label: l.label })),
    ],
    [meta],
  );

  const [kind, setKind] = useState<'once' | 'recurring'>(
    editing?.recurring ? 'recurring' : 'once',
  );
  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [priority, setPriority] = useState<Priority>(
    editing?.priority ?? 'Medium',
  );
  const [dept, setDept] = useState(editing?.category ?? meta.defaultCategory);
  const [place, setPlace] = useState(editing?.location ?? NO_PLACE);
  const [tags, setTags] = useState(editing?.tags.join(', ') ?? '');
  const [files, setFiles] = useState<PickedFile[]>(editing?.attachments ?? []);
  const [removed, setRemoved] = useState<number[]>([]);
  const [date, setDate] = useState(editing ? editing.dueDate ?? '' : today);
  const [time, setTime] = useState(editing?.dueTime ?? '');
  const [hard, setHard] = useState(!!editing?.hard);
  const [repeat, setRepeat] = useState<Recurring>(
    editing?.recurring ?? { freq: 'weekly', days: WEEKDAYS },
  );
  const recurring = kind === 'recurring';

  const removeFile = (fileId: string) => {
    const file = files.find(x => x.id === fileId);
    const saved = file ? savedId(file) : null;
    if (saved) {
      setRemoved(list => [...list, saved]);
    }
    setFiles(list => list.filter(x => x.id !== fileId));
  };

  const submit = async () => {
    try {
      await save({
        id: editing?.id,
        form: taskForm({
          title,
          description,
          priority,
          category: dept,
          location: place === NO_PLACE ? '' : place,
          tags: tags
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),
          hard,
          dueDate: date,
          dueTime: time,
          recurring: recurring ? repeat : undefined,
          newFiles: files.filter(x => savedId(x) === null),
          removedFileIds: removed,
        }),
      }).unwrap();
      nav.goBack();
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);

  return (
    <FormScreen
      title={heading}
      footer={
        <Button
          label={call.isLoading ? 'Saving…' : 'Save task'}
          disabled={!title.trim() || call.isLoading}
          onPress={submit}
        />
      }
    >
      {call.error ? (
        <Notice
          tone="error"
          title={errorMessage(call.error)}
          style={styles.notice}
        />
      ) : null}
      <FormCard>
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
        <TextField
          label="Task title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="What needs to be done?"
          error={errors.title}
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
          options={categories}
          value={dept}
          onChange={setDept}
        />
        <Dropdown
          label="Location"
          options={places}
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
              clearable
              label="Due date"
              placeholder="No date"
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
          onRemove={removeFile}
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginBottom: vs(12) },
  pair: { flexDirection: 'row', gap: s(12) },
  date: { flex: 1.5 },
  time: { flex: 1 },
  files: { paddingBottom: vs(14) },
});
