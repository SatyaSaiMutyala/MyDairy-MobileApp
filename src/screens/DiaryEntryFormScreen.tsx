import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { PeopleField } from '../components/PeopleField';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { DiaryKind, DiaryLine, diaryTypes, toLine } from '../diary/model';
import { errorMessage, fieldErrors } from '../store';
import {
  useDiaryEntryQuery,
  useSaveDiaryEntryMutation,
} from '../store/api/diaryApi';
import { realToday } from '../utils/dates';
import { colors, s, vs } from '../theme';

// When editing, waits for the entry before drawing the form.
export function DiaryEntryFormScreen() {
  const params = useRoute<any>().params ?? {};
  const id: number | undefined = params.id;
  const query = useDiaryEntryQuery(id as number, { skip: !id });

  if (id && !query.data) {
    return (
      <FormScreen title="Edit entry">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : (
          <FormCard>
            <ShimmerRows rows={5} icon={false} lines={2} />
          </FormCard>
        )}
      </FormScreen>
    );
  }
  return (
    <EntryForm
      editing={query.data ? toLine(query.data) : undefined}
      day={params.date ?? realToday()}
    />
  );
}

function EntryForm({ editing, day }: { editing?: DiaryLine; day: string }) {
  const nav = useNavigation<any>();
  const [save, call] = useSaveDiaryEntryMutation();

  const [title, setTitle] = useState(editing?.title ?? '');
  const [type, setType] = useState<string>(editing?.kind ?? 'appointment');
  const [date, setDate] = useState<string>(editing?.date ?? day);
  const [allDay, setAllDay] = useState(editing?.time === 'All day');
  const [start, setStart] = useState(
    editing && editing.time.includes(':') ? editing.time : '',
  );
  const [end, setEnd] = useState(editing?.end ?? '');
  const [place, setPlace] = useState(editing?.place ?? '');
  const [people, setPeople] = useState<DropdownOption[]>(
    editing?.attendees.map(a => ({ id: String(a.id), label: a.name })) ?? [],
  );
  const [notes, setNotes] = useState(editing?.body ?? '');

  const submit = async () => {
    try {
      await save({
        id: editing?.id,
        body: {
          type: type as DiaryKind,
          title: title.trim(),
          date,
          all_day: allDay,
          start_time: allDay ? null : start || null,
          end_time: allDay ? null : end || null,
          location: place.trim() || null,
          notes: notes.trim() || null,
          invitees: people.map(p => Number(p.id)),
        },
      }).unwrap();
      nav.navigate('Tabs', { screen: 'Diary' });
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);

  return (
    <FormScreen
      title={editing ? 'Edit entry' : 'Write entry'}
      footer={
        <Button
          label={call.isLoading ? 'Saving…' : 'Save entry'}
          disabled={!title.trim() || !date || call.isLoading}
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
        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Call with Guntur centre"
          error={errors.title}
        />
        <Dropdown
          label="Type"
          options={diaryTypes}
          value={type}
          onChange={setType}
        />
        <DateField label="Date *" value={date} onChange={setDate} />
        <SwitchRow
          label="All day"
          detail="Turn off to set a start and end time."
          value={allDay}
          onChange={setAllDay}
        />
        {allDay ? null : (
          <View style={styles.pair}>
            <TimeField
              label="Start time"
              value={start}
              onChange={setStart}
              style={styles.half}
            />
            <TimeField
              label="End time"
              value={end}
              onChange={setEnd}
              style={styles.half}
            />
          </View>
        )}
        <TextField
          label="Location / link"
          value={place}
          onChangeText={setPlace}
          maxLength={255}
          placeholder="Room, branch or meeting link"
        />
        <TextArea
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          maxLength={5000}
          placeholder="Anything to remember"
        />
      </FormCard>

      <FormCard title="Tag people (optional)" style={styles.people}>
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          Each person gets an invitation in their diary.
        </AppText>
        <PeopleField people={people} onChange={setPeople} />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  hint: { marginBottom: vs(12) },
  people: { paddingBottom: vs(8) },
});
