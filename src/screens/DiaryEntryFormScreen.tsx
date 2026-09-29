import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { colleagues, DiaryKind, diaryTypes } from '../data/mock';
import { currentUser } from '../data/user';
import { useStore } from '../state/Store';
import { TODAY_ISO } from '../utils/dates';
import { colors, s, vs } from '../theme';

export function DiaryEntryFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { entries, saveEntry } = useStore();
  const editing = entries.find(e => e.id === route.params?.id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [type, setType] = useState<string>(editing?.kind ?? 'appointment');
  const [date, setDate] = useState<string>(
    editing?.date ?? route.params?.date ?? TODAY_ISO,
  );
  const [allDay, setAllDay] = useState(editing?.time === 'All day');
  const [start, setStart] = useState(
    editing && editing.time !== 'All day' ? editing.time : '',
  );
  const [end, setEnd] = useState(editing?.end ?? '');
  const [place, setPlace] = useState(editing?.place ?? '');
  const [people, setPeople] = useState<string[]>(
    editing?.attendees?.map(a => a.name) ?? [],
  );
  const [notes, setNotes] = useState(editing?.body ?? '');

  const toggle = (name: string) =>
    setPeople(list =>
      list.includes(name) ? list.filter(n => n !== name) : [...list, name],
    );

  const save = () => {
    saveEntry(
      {
        owner: editing?.owner ?? currentUser.name,
        title: title.trim(),
        kind: type as DiaryKind,
        date,
        time: allDay ? 'All day' : start || '09:00',
        end: allDay ? undefined : end || undefined,
        place: place.trim() || undefined,
        body: notes.trim() || 'No notes added.',
        attendees: people.length
          ? people.map(name => ({
              name,
              status:
                editing?.attendees?.find(a => a.name === name)?.status ?? 'pending',
            }))
          : undefined,
      },
      editing?.id,
    );
    nav.navigate('Tabs', { screen: 'Diary' });
  };

  return (
    <FormScreen
      title={editing ? 'Edit entry' : 'Write entry'}
      footer={<Button label="Save entry" disabled={!title.trim()} onPress={save} />}>
      <FormCard>
        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Call with Guntur centre"
        />
        <Dropdown label="Type" options={diaryTypes} value={type} onChange={setType} />
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
          placeholder="Anything to remember"
        />
      </FormCard>

      <FormCard title="Tag people (optional)">
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          Each person gets an invitation in their diary.
        </AppText>
        {colleagues.map(c => (
          <SwitchRow
            key={c.id}
            label={c.label}
            detail={c.detail}
            value={people.includes(c.label)}
            onChange={() => toggle(c.label)}
          />
        ))}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  hint: { marginBottom: vs(12) },
});
