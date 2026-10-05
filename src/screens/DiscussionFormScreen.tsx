import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, X } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateField } from '../components/DateField';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { ListField } from '../components/ListField';
import { Notice } from '../components/Notice';
import { PersonPicker } from '../components/PersonPicker';
import { RepeatItem } from '../components/RepeatItem';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { errorMessage, fieldErrors } from '../store';
import {
  ApiDiscussion,
  DiscussionMeta,
  Outcome,
  Privacy,
  useDiscussionMetaQuery,
  useDiscussionQuery,
  useSaveDiscussionMutation,
} from '../store/api/discussionsApi';
import { realToday } from '../utils/dates';
import { colors, hairline, radius, s, vs } from '../theme';

let counter = 0;
const newKey = (p: string) => `${p}-${Date.now()}-${++counter}`;

type Person = { key: string; userId: number | null; name: string; org: string };
type FollowUp = {
  key: string;
  serverId: number | null;
  text: string;
  due: string;
  done: boolean;
};

export function DiscussionFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const meta = useDiscussionMetaQuery();
  const log = useDiscussionQuery(id as number, { skip: !id });
  const failure = meta.error ?? log.error;
  const title = id ? 'Edit log' : 'Log a discussion';

  if (!meta.data || (id && !log.data)) {
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
            <ShimmerRows rows={5} icon={false} lines={2} />
          </FormCard>
        )}
      </FormScreen>
    );
  }
  return <DiscussionForm title={title} meta={meta.data} was={log.data} />;
}

function DiscussionForm({
  title: heading,
  meta,
  was,
}: {
  title: string;
  meta: DiscussionMeta;
  was?: ApiDiscussion;
}) {
  const nav = useNavigation<any>();
  const [save, call] = useSaveDiscussionMutation();
  const opt = (list: { key: string; label: string }[]): DropdownOption[] =>
    list.map(x => ({ id: x.key, label: x.label }));
  const types = useMemo(() => opt(meta.types), [meta]);
  const outcomes = useMemo(() => opt(meta.outcomes), [meta]);

  const [title, setTitle] = useState(was?.title ?? '');
  const [type, setType] = useState(was?.type ?? 'call');
  const [date, setDate] = useState(was?.date ?? realToday());
  const [time, setTime] = useState(was?.time ?? '');
  const [duration, setDuration] = useState(was?.duration ?? '');
  const [summary, setSummary] = useState(was?.summary ?? '');
  const [outcome, setOutcome] = useState<Outcome>(was?.outcome ?? 'neutral');
  const [team, setTeam] = useState(was?.privacy === 'team');
  const [tags, setTags] = useState(was?.tags.join(', ') ?? '');
  const [keyPoints, setKeyPoints] = useState<string[]>(was?.keyPoints ?? []);
  const [people, setPeople] = useState<Person[]>(
    was?.with.map(w => ({
      key: `p${w.id}`,
      userId: w.userId,
      name: w.name,
      org: w.org ?? '',
    })) ?? [],
  );
  const [guest, setGuest] = useState('');
  const [followUps, setFollowUps] = useState<FollowUp[]>(
    was?.followUps.map(f => ({
      key: `f${f.id}`,
      serverId: f.id,
      text: f.text,
      due: f.due ?? '',
      done: f.done,
    })) ?? [],
  );

  const patchPerson = (key: string, change: Partial<Person>) =>
    setPeople(list => list.map(p => (p.key === key ? { ...p, ...change } : p)));
  const patchFollowUp = (key: string, change: Partial<FollowUp>) =>
    setFollowUps(list =>
      list.map(f => (f.key === key ? { ...f, ...change } : f)),
    );
  const addGuest = () => {
    if (guest.trim()) {
      setPeople(list => [
        ...list,
        { key: newKey('p'), userId: null, name: guest.trim(), org: '' },
      ]);
      setGuest('');
    }
  };

  const submit = async () => {
    try {
      const saved = await save({
        id: was?.id,
        body: {
          title: title.trim(),
          type,
          date,
          time: time || null,
          duration: duration.trim() || null,
          summary: summary.trim() || null,
          outcome,
          privacy: team ? 'team' : 'private',
          tags: tags
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),
          key_points: keyPoints,
          with: people.map(p => ({
            user_id: p.userId,
            name: p.name,
            org: p.org.trim() || null,
            is_internal: !!p.userId,
          })),
          follow_ups: followUps
            .filter(f => f.text.trim())
            .map(f => ({
              id: f.serverId,
              text: f.text.trim(),
              due_date: f.due || null,
              done: f.done,
            })),
        },
      }).unwrap();
      // Editing: back to the record. Creating: open it, with the list behind it.
      if (was) {
        nav.goBack();
      } else {
        nav.replace('DiscussionDetail', { id: saved.id });
      }
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);
  const privacy: Privacy = team ? 'team' : 'private';

  return (
    <FormScreen
      title={heading}
      footer={
        <Button
          label={call.isLoading ? 'Saving…' : 'Save log'}
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

      <FormCard title="Conversation">
        <TextField
          label="What was it about? *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Call with Azure about renewal"
          error={errors.title}
        />
        <Dropdown
          label="Kind"
          options={types}
          value={type}
          onChange={setType}
        />
        <View style={styles.pair}>
          <DateField
            label="Date *"
            value={date}
            onChange={setDate}
            style={styles.half}
          />
          <TimeField
            label="Time"
            placeholder="Any time"
            value={time}
            onChange={setTime}
            style={styles.half}
          />
        </View>
        <TextField
          label="How long"
          value={duration}
          onChangeText={setDuration}
          maxLength={16}
          placeholder="e.g. 20 min"
        />
        <TextArea
          label="Summary"
          value={summary}
          onChangeText={setSummary}
          maxLength={5000}
          placeholder="What was said, in a few lines"
        />
        <Dropdown
          label="Outcome"
          options={outcomes}
          value={outcome}
          onChange={v => setOutcome(v as Outcome)}
        />
        <ListField
          label="Key points"
          items={keyPoints}
          onChange={setKeyPoints}
          placeholder="One point per line"
        />
        <TextField
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
          placeholder="e.g. vendor, renewal"
        />
      </FormCard>

      <FormCard title={`With · ${people.length}`}>
        {people.map(p => (
          <View key={p.key} style={styles.person}>
            <View style={styles.personHead}>
              <AppText
                variant="body"
                numberOfLines={1}
                style={styles.personName}
              >
                {p.name}
              </AppText>
              <IconButton
                icon={X}
                label={`Remove ${p.name}`}
                size={30}
                iconSize={17}
                strokeWidth={2.25}
                color={colors.inkSoft}
                onPress={() =>
                  setPeople(list => list.filter(x => x.key !== p.key))
                }
              />
            </View>
            {p.userId ? null : (
              <TextField
                label="Organisation"
                value={p.org}
                onChangeText={org => patchPerson(p.key, { org })}
                maxLength={255}
                placeholder="e.g. Azure"
              />
            )}
          </View>
        ))}
        <PersonPicker
          placeholder="Search and add a colleague"
          onChange={p =>
            setPeople(list =>
              list.some(x => x.userId === Number(p.id))
                ? list
                : [
                    ...list,
                    {
                      key: newKey('p'),
                      userId: Number(p.id),
                      name: p.label,
                      org: '',
                    },
                  ],
            )
          }
        />
        <View style={styles.guestRow}>
          <View style={styles.guestField}>
            <TextField
              label="Or someone from outside"
              value={guest}
              onChangeText={setGuest}
              maxLength={255}
              placeholder="Name"
              onSubmitEditing={addGuest}
            />
          </View>
          <Button
            label="Add"
            size="md"
            variant="outline"
            disabled={!guest.trim()}
            onPress={addGuest}
            style={styles.guestAdd}
          />
        </View>
      </FormCard>

      <FormCard title={`Follow-ups · ${followUps.length}`}>
        {followUps.length === 0 ? (
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            A follow-up with a date goes to your My Tasks.
          </AppText>
        ) : null}
        {followUps.map((f, i) => (
          <RepeatItem
            key={f.key}
            first={i === 0}
            title={`Follow-up ${i + 1}`}
            onRemove={() =>
              setFollowUps(list => list.filter(x => x.key !== f.key))
            }
          >
            <TextField
              label="What to do *"
              value={f.text}
              onChangeText={text => patchFollowUp(f.key, { text })}
              maxLength={1000}
              placeholder="e.g. Send the revised quote"
            />
            <DateField
              clearable
              label="By when"
              placeholder="No date"
              value={f.due}
              onChange={due => patchFollowUp(f.key, { due })}
            />
            <SwitchRow
              label="Already done"
              value={f.done}
              onChange={done => patchFollowUp(f.key, { done })}
            />
          </RepeatItem>
        ))}
        <Button
          label="Add follow-up"
          variant="outline"
          size="md"
          iconLeft={Plus}
          iconColor={colors.teal}
          style={styles.add}
          onPress={() =>
            setFollowUps(list => [
              ...list,
              {
                key: newKey('f'),
                serverId: null,
                text: '',
                due: '',
                done: false,
              },
            ])
          }
        />
      </FormCard>

      <FormCard title="Who can see it">
        <ChoiceGroup
          style={styles.field}
          value={privacy}
          onChange={k => k && setTeam(k === 'team')}
          options={[
            { key: 'private', label: 'Only me' },
            { key: 'team', label: 'People in it too' },
          ]}
        />
        <AppText variant="meta" color={colors.inkMuted}>
          {team
            ? 'Colleagues you added above can see this log.'
            : 'This log is private to you. Admin and CMD can see every log.'}
        </AppText>
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginBottom: vs(10) },
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  hint: { marginBottom: vs(12) },
  person: {
    paddingTop: vs(8),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  personHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(6),
  },
  personName: { flex: 1 },
  guestRow: { flexDirection: 'row', alignItems: 'flex-end', gap: s(8) },
  guestField: { flex: 1 },
  guestAdd: { marginBottom: vs(12) },
  add: { marginBottom: vs(12) },
});
