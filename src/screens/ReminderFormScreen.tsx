import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlarmClock } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import type { DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { PeopleField } from '../components/PeopleField';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { errorMessage, fieldErrors, useAppSelector } from '../store';
import {
  ApiReminder,
  useReminderQuery,
  useSaveReminderMutation,
} from '../store/api/remindersApi';
import { realToday } from '../utils/dates';
import { colors, vs } from '../theme';

// Waits for the reminder (when editing) before drawing the form.
export function ReminderFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const was = useReminderQuery(id as number, { skip: !id });
  const title = id ? 'Edit reminder' : 'Set a reminder';

  if (id && !was.data) {
    return (
      <FormScreen title={title}>
        {was.error ? (
          <Notice tone="error" title={errorMessage(was.error)} style={styles.notice} />
        ) : (
          <FormCard>
            <ShimmerRows rows={4} icon={false} lines={2} />
          </FormCard>
        )}
      </FormScreen>
    );
  }
  return <ReminderForm title={title} was={was.data} />;
}

function ReminderForm({ title: heading, was }: { title: string; was?: ApiReminder }) {
  const nav = useNavigation<any>();
  const me = useAppSelector(st => st.session.user);
  const [save, call] = useSaveReminderMutation();

  const [title, setTitle] = useState(was?.title ?? '');
  const [date, setDate] = useState(was?.date ?? realToday());
  const [time, setTime] = useState(was?.time ?? '');
  const [note, setNote] = useState(was?.note ?? '');
  const [people, setPeople] = useState<DropdownOption[]>(
    was?.recipients
      .filter(p => p.userId !== me?.id)
      .map(p => ({ id: String(p.userId), label: p.name })) ?? [],
  );
  const [remindMe, setRemindMe] = useState(was ? was.forMe : true);

  const submit = async () => {
    try {
      const saved = await save({
        id: was?.id,
        body: {
          title: title.trim(),
          note: note.trim() || undefined,
          remind_at: `${date} ${time}`,
          recipients: people.map(p => Number(p.id)),
          remind_me: remindMe,
        },
      }).unwrap();
      // Editing: back to the reminder. Creating: open it, with the list behind.
      if (was) {
        nav.goBack();
      } else {
        nav.replace('ReminderDetail', { id: saved.id });
      }
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);
  const nobody = !remindMe && people.length === 0;
  const ready = !!title.trim() && !!date && !!time && !nobody && !call.isLoading;

  return (
    <FormScreen
      title={heading}
      footer={
        <>
          {nobody ? (
            <AppText variant="meta" color={colors.redInk} style={styles.hint}>
              Choose at least one person, or switch on "Also remind me".
            </AppText>
          ) : null}
          <Button
            label={call.isLoading ? 'Saving…' : was ? 'Save reminder' : 'Set reminder'}
            iconLeft={AlarmClock}
            disabled={!ready}
            onPress={submit}
          />
        </>
      }
    >
      {call.error && !Object.keys(errors).length ? (
        <Notice tone="error" title={errorMessage(call.error)} style={styles.notice} />
      ) : null}

      <FormCard title="What">
        <TextField
          label="Remind about *"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          placeholder="e.g. Review meeting with the CMD"
          error={errors.title}
        />
        <TextArea
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          maxLength={2000}
          placeholder="Anything they should have ready"
          style={styles.field}
        />
      </FormCard>

      <FormCard title="When">
        <DateField label="Date *" value={date} onChange={setDate} />
        <TimeField
          label="Time *"
          value={time}
          onChange={setTime}
          placeholder="Pick the minute it should fire"
          style={styles.field}
        />
        {errors.remind_at ? (
          <AppText variant="meta" color={colors.redInk} style={styles.hint}>
            {errors.remind_at}
          </AppText>
        ) : null}
      </FormCard>

      <FormCard title="Who">
        <PeopleField
          label="Remind these people"
          placeholder="Search a colleague"
          people={people}
          onChange={setPeople}
          excludeMe
        />
        <SwitchRow label="Also remind me" value={remindMe} onChange={setRemindMe} />
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          At that minute everyone chosen gets a notification on their phone and
          in the app, with your name on it.
        </AppText>
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginTop: vs(10) },
  hint: { marginTop: vs(8), marginBottom: vs(8) },
});
