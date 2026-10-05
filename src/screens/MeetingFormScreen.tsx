import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { PriorityPicker } from '../components/PriorityPicker';
import { RepeatFields } from '../components/RepeatFields';
import { RepeatItem } from '../components/RepeatItem';
import { ShimmerRows } from '../components/Shimmer';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import type { Priority } from '../data/mock';
import { errorMessage, fieldErrors, useAppSelector } from '../store';
import {
  ApiMeeting,
  Attendance,
  MeetingMeta,
  MeetingStatus,
  useMeetingMetaQuery,
  useMeetingQuery,
  useSaveMeetingMutation,
} from '../store/api/meetingsApi';
import { apiPriority } from '../tasks/model';
import { realToday } from '../utils/dates';
import { Recurring, WEEKDAYS } from '../utils/recur';
import { colors, hairline, radius, s, vs } from '../theme';

let counter = 0;
const newKey = (p: string) => `${p}-${Date.now()}-${++counter}`;

type Attendee = {
  key: string;
  userId: number | null;
  name: string;
  role: string;
  attendance: Attendance;
};
type Agenda = {
  key: string;
  title: string;
  type: string;
  owner: string;
  ownerUserId: number | null;
  duration: string;
  notes: string;
  minutes: string;
};
type Action = {
  key: string;
  serverId: number | null;
  text: string;
  assigneeId: number | null;
  assignee: string;
  due: string;
  priority: Priority;
  done: boolean;
};

const priorityNames = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

// Waits for the choices (and, when editing, the meeting) before drawing the form.
export function MeetingFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const meta = useMeetingMetaQuery();
  const meeting = useMeetingQuery(id as number, { skip: !id });
  const failure = meta.error ?? meeting.error;
  const title = id ? 'Edit meeting' : 'Plan a meeting';

  if (!meta.data || (id && !meeting.data)) {
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
  return <MeetingForm title={title} meta={meta.data} was={meeting.data} />;
}

function MeetingForm({
  title: heading,
  meta,
  was,
}: {
  title: string;
  meta: MeetingMeta;
  was?: ApiMeeting;
}) {
  const nav = useNavigation<any>();
  const me = useAppSelector(st => st.session.user);
  const [save, call] = useSaveMeetingMutation();

  const opt = (list: { key: string; label: string }[]): DropdownOption[] =>
    list.map(x => ({ id: x.key, label: x.label }));
  const types = useMemo(() => opt(meta.types), [meta]);
  const statuses = useMemo(() => opt(meta.statuses), [meta]);
  const agendaTypes = useMemo(() => opt(meta.agendaTypes), [meta]);

  const [title, setTitle] = useState(was?.title ?? '');
  const [type, setType] = useState(was?.type ?? 'ops');
  const [status, setStatus] = useState<MeetingStatus>(
    was?.status ?? 'scheduled',
  );
  const [date, setDate] = useState(was?.date ?? realToday());
  const [time, setTime] = useState(was?.time ?? '');
  const [duration, setDuration] = useState(String(was?.duration ?? 60));
  const [location, setLocation] = useState(was?.location ?? '');
  const [locationType, setLocationType] = useState(
    was?.locationType ?? 'In-Person',
  );
  const [context, setContext] = useState(was?.context ?? '');
  const [quorum, setQuorum] = useState(was?.quorum ?? '');
  const [recordedBy, setRecordedBy] = useState(was?.recordedBy ?? '');
  const [remarks, setRemarks] = useState(was?.remarks ?? '');

  const [repeats, setRepeats] = useState(!!was?.recurring);
  const [recurring, setRecurring] = useState<Recurring>(
    was?.recurring ?? { freq: 'weekly', days: WEEKDAYS.slice(0, 1) },
  );

  // The organiser starts on the list.
  const [attendees, setAttendees] = useState<Attendee[]>(
    was?.attendees.map(a => ({
      key: `a${a.id}`,
      userId: a.userId,
      name: a.name,
      role: a.role ?? '',
      attendance: a.attendance,
    })) ??
      (me
        ? [
            {
              key: 'me',
              userId: me.id,
              name: me.name,
              role: 'Organiser',
              attendance: 'present',
            },
          ]
        : []),
  );
  const [guest, setGuest] = useState('');
  const [agenda, setAgenda] = useState<Agenda[]>(
    was?.agenda.map(a => ({
      key: `g${a.id}`,
      title: a.title,
      type: a.type,
      owner: a.owner ?? '',
      ownerUserId: a.ownerUserId,
      duration: String(a.duration),
      notes: a.notes ?? '',
      minutes: a.minutesNotes ?? '',
    })) ?? [],
  );
  const [decisions, setDecisions] = useState<string[]>(was?.decisions ?? []);
  const [parkingLot, setParkingLot] = useState<string[]>(was?.parkingLot ?? []);
  const [actions, setActions] = useState<Action[]>(
    was?.actions.map(a => ({
      key: `x${a.id}`,
      serverId: a.id,
      text: a.text,
      assigneeId: a.assigneeId,
      assignee: a.assignee ?? '',
      due: a.due ?? '',
      priority: priorityNames[a.priority] ?? 'Medium',
      done: a.done,
    })) ?? [],
  );
  const [nextDate, setNextDate] = useState(was?.nextMeeting.date ?? '');
  const [nextTime, setNextTime] = useState(was?.nextMeeting.time ?? '');
  const [nextAgenda, setNextAgenda] = useState(was?.nextMeeting.agenda ?? '');

  const patchAttendee = (key: string, change: Partial<Attendee>) =>
    setAttendees(list =>
      list.map(a => (a.key === key ? { ...a, ...change } : a)),
    );
  const patchAgenda = (key: string, change: Partial<Agenda>) =>
    setAgenda(list => list.map(a => (a.key === key ? { ...a, ...change } : a)));
  const patchAction = (key: string, change: Partial<Action>) =>
    setActions(list =>
      list.map(a => (a.key === key ? { ...a, ...change } : a)),
    );

  const addPerson = (userId: number, name: string) =>
    setAttendees(list =>
      list.some(a => a.userId === userId)
        ? list
        : [
            ...list,
            { key: newKey('a'), userId, name, role: '', attendance: 'present' },
          ],
    );
  const addGuest = () => {
    if (guest.trim()) {
      setAttendees(list => [
        ...list,
        {
          key: newKey('a'),
          userId: null,
          name: guest.trim(),
          role: 'Guest',
          attendance: 'present',
        },
      ]);
      setGuest('');
    }
  };

  const minutesMode = status === 'completed' || status === 'inprogress';

  const submit = async () => {
    try {
      const saved = await save({
        id: was?.id,
        body: {
          title: title.trim(),
          type,
          status,
          date,
          time: time || null,
          duration: Number(duration) || 60,
          location: location.trim() || null,
          location_type: locationType,
          context: context.trim() || null,
          quorum: quorum.trim() || null,
          recorded_by: recordedBy.trim() || null,
          remarks: remarks.trim() || null,
          decisions,
          parking_lot: parkingLot,
          next_meeting: {
            date: nextDate || null,
            time: nextTime || null,
            agenda: nextAgenda.trim() || null,
          },
          recurring: repeats ? recurring : null,
          attendees: attendees.map(a => ({
            user_id: a.userId,
            name: a.name,
            role: a.role.trim() || null,
            attendance: a.attendance,
          })),
          agenda: agenda
            .filter(a => a.title.trim())
            .map(a => ({
              title: a.title.trim(),
              type: a.type,
              owner: a.owner.trim() || null,
              owner_user_id: a.ownerUserId,
              duration: Number(a.duration) || 10,
              notes: a.notes.trim() || null,
              minutes_notes: a.minutes.trim() || null,
            })),
          action_items: actions
            .filter(a => a.text.trim())
            .map(a => ({
              id: a.serverId,
              text: a.text.trim(),
              assignee: a.assignee || null,
              assignee_user_id: a.assigneeId,
              due_date: a.due || null,
              priority: apiPriority(a.priority),
              status: a.done ? 'done' : 'open',
            })),
        },
      }).unwrap();
      // Editing: back to the record. Creating: open it, with the list behind it.
      if (was) {
        nav.goBack();
      } else {
        nav.replace('MeetingDetail', { id: saved.id });
      }
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const errors = fieldErrors(call.error);
  const ready = !!title.trim() && !!date && !call.isLoading;

  return (
    <FormScreen
      title={heading}
      footer={
        <Button
          label={
            call.isLoading
              ? 'Saving…'
              : status === 'completed'
              ? 'Save and complete'
              : 'Save meeting'
          }
          disabled={!ready}
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

      <FormCard title="Meeting">
        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. IT weekly review"
          error={errors.title}
        />
        <Dropdown
          label="Kind of meeting"
          options={types}
          value={type}
          onChange={setType}
        />
        <Dropdown
          label="Status"
          options={statuses}
          value={status}
          onChange={v => setStatus(v as MeetingStatus)}
        />
        <DateField label="Date *" value={date} onChange={setDate} />
        <View style={styles.pair}>
          <TimeField
            label="Start time"
            placeholder="Any time"
            value={time}
            onChange={setTime}
            style={styles.half}
          />
          <View style={styles.half}>
            <TextField
              label="Duration (min)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="60"
              error={errors.duration}
            />
          </View>
        </View>
        <TextField
          label="Where"
          value={location}
          onChangeText={setLocation}
          maxLength={255}
          placeholder="Room, branch or meeting link"
        />
        <ChoiceGroup
          label="Format"
          style={styles.field}
          value={locationType}
          onChange={k => k && setLocationType(k)}
          options={meta.locationTypes.map(l => ({
            key: l.key,
            label: l.label,
          }))}
        />
        <TextArea
          label="Context / purpose"
          value={context}
          onChangeText={setContext}
          maxLength={5000}
          placeholder="Why this meeting is held"
        />
      </FormCard>

      <FormCard title="Repeats">
        <SwitchRow
          label="Recurring meeting"
          detail="The next one is booked when this one is completed."
          value={repeats}
          onChange={setRepeats}
        />
        {repeats ? (
          <RepeatFields value={recurring} onChange={setRecurring} />
        ) : null}
      </FormCard>

      <FormCard title={`Attendees · ${attendees.length}`}>
        {attendees.map(a => (
          <View key={a.key} style={styles.person}>
            <View style={styles.personHead}>
              <AppText
                variant="body"
                numberOfLines={1}
                style={styles.personName}
              >
                {a.name}
              </AppText>
              <IconButton
                icon={X}
                label={`Remove ${a.name}`}
                size={30}
                iconSize={17}
                strokeWidth={2.25}
                color={colors.inkSoft}
                onPress={() =>
                  setAttendees(list => list.filter(x => x.key !== a.key))
                }
              />
            </View>
            <TextField
              label="Role"
              value={a.role}
              onChangeText={role => patchAttendee(a.key, { role })}
              maxLength={255}
              placeholder="e.g. HOD, Guest"
            />
            {minutesMode ? (
              <ChoiceGroup
                label="Attendance"
                style={styles.field}
                value={a.attendance}
                onChange={k =>
                  k && patchAttendee(a.key, { attendance: k as Attendance })
                }
                options={[
                  { key: 'present', label: 'Present', tone: 'green' },
                  { key: 'late', label: 'Late', tone: 'amber' },
                  { key: 'absent', label: 'Absent', tone: 'red' },
                ]}
              />
            ) : null}
          </View>
        ))}
        <PersonPicker
          placeholder="Search and add a colleague"
          onChange={p => addPerson(Number(p.id), p.label)}
        />
        <View style={styles.guestRow}>
          <View style={styles.guestField}>
            <TextField
              label="Or a guest from outside"
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

      <FormCard title={`Agenda · ${agenda.length}`}>
        {agenda.map((a, i) => (
          <RepeatItem
            key={a.key}
            first={i === 0}
            title={`Item ${i + 1}`}
            onRemove={() =>
              setAgenda(list => list.filter(x => x.key !== a.key))
            }
          >
            <TextField
              label="Topic *"
              value={a.title}
              onChangeText={v => patchAgenda(a.key, { title: v })}
              maxLength={255}
              placeholder="What is discussed"
            />
            <Dropdown
              label="Type"
              options={agendaTypes}
              value={a.type}
              onChange={v => patchAgenda(a.key, { type: v })}
            />
            <PersonPicker
              label="Owner"
              placeholder={a.owner ? a.owner : 'Who presents it'}
              value={
                a.ownerUserId
                  ? { id: String(a.ownerUserId), label: a.owner }
                  : undefined
              }
              onChange={p =>
                patchAgenda(a.key, {
                  ownerUserId: Number(p.id),
                  owner: p.label,
                })
              }
            />
            {a.ownerUserId ? (
              <Pressable
                hitSlop={s(8)}
                style={styles.clear}
                onPress={() =>
                  patchAgenda(a.key, { ownerUserId: null, owner: '' })
                }
              >
                <AppText variant="metaStrong" color={colors.teal}>
                  Remove owner
                </AppText>
              </Pressable>
            ) : (
              <TextField
                label="Owner (free text)"
                value={a.owner}
                onChangeText={v => patchAgenda(a.key, { owner: v })}
                maxLength={255}
                placeholder="e.g. All HODs, Client"
              />
            )}
            <TextField
              label="Minutes allowed"
              value={a.duration}
              onChangeText={v => patchAgenda(a.key, { duration: v })}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="10"
            />
            <TextArea
              label="Notes"
              value={a.notes}
              onChangeText={v => patchAgenda(a.key, { notes: v })}
              maxLength={5000}
              placeholder="What to prepare"
            />
            {minutesMode ? (
              <TextArea
                label="Minutes / outcome"
                value={a.minutes}
                onChangeText={v => patchAgenda(a.key, { minutes: v })}
                maxLength={5000}
                placeholder="What was said and decided"
              />
            ) : null}
          </RepeatItem>
        ))}
        <Button
          label="Add agenda item"
          variant="outline"
          size="md"
          iconLeft={Plus}
          iconColor={colors.teal}
          style={styles.add}
          onPress={() =>
            setAgenda(list => [
              ...list,
              {
                key: newKey('g'),
                title: '',
                type: 'discuss',
                owner: '',
                ownerUserId: null,
                duration: '10',
                notes: '',
                minutes: '',
              },
            ])
          }
        />
      </FormCard>

      {minutesMode ? (
        <FormCard title="Minutes">
          <ListField
            label="Decisions"
            items={decisions}
            onChange={setDecisions}
            placeholder="A decision that was made"
          />
          <ListField
            label="Parking lot"
            items={parkingLot}
            onChange={setParkingLot}
            placeholder="A topic kept for later"
          />
          <TextField
            label="Quorum"
            value={quorum}
            onChangeText={setQuorum}
            maxLength={255}
            placeholder="e.g. 5 of 6 present"
          />
          <TextField
            label="Recorded by"
            value={recordedBy}
            onChangeText={setRecordedBy}
            maxLength={255}
            placeholder="Who wrote the minutes"
          />
        </FormCard>
      ) : null}

      <FormCard title={`Action items · ${actions.length}`}>
        {actions.length === 0 ? (
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            Actions with an assignee go to their My Tasks when the meeting is
            completed.
          </AppText>
        ) : null}
        {actions.map((a, i) => (
          <RepeatItem
            key={a.key}
            first={i === 0}
            title={`Action ${i + 1}`}
            onRemove={() =>
              setActions(list => list.filter(x => x.key !== a.key))
            }
          >
            <TextField
              label="Action required *"
              value={a.text}
              onChangeText={v => patchAction(a.key, { text: v })}
              maxLength={1000}
              placeholder="What must be done"
            />
            <PersonPicker
              label="Assignee"
              placeholder="Nobody yet"
              value={
                a.assigneeId
                  ? {
                      id: String(a.assigneeId),
                      label: a.assignee || 'Chosen person',
                    }
                  : undefined
              }
              onChange={p =>
                patchAction(a.key, {
                  assigneeId: Number(p.id),
                  assignee: p.label,
                })
              }
            />
            {a.assigneeId ? (
              <Pressable
                hitSlop={s(8)}
                style={styles.clear}
                onPress={() =>
                  patchAction(a.key, { assigneeId: null, assignee: '' })
                }
              >
                <AppText variant="metaStrong" color={colors.teal}>
                  Remove assignee
                </AppText>
              </Pressable>
            ) : null}
            <DateField
              clearable
              label="Due date"
              placeholder="No due date"
              value={a.due}
              onChange={due => patchAction(a.key, { due })}
            />
            <PriorityPicker
              value={a.priority}
              onChange={priority => patchAction(a.key, { priority })}
              style={styles.field}
            />
          </RepeatItem>
        ))}
        <Button
          label="Add action item"
          variant="outline"
          size="md"
          iconLeft={Plus}
          iconColor={colors.teal}
          style={styles.add}
          onPress={() =>
            setActions(list => [
              ...list,
              {
                key: newKey('x'),
                serverId: null,
                text: '',
                assigneeId: null,
                assignee: '',
                due: '',
                priority: 'Medium',
                done: false,
              },
            ])
          }
        />
      </FormCard>

      <FormCard title="Next meeting & remarks">
        <View style={styles.pair}>
          <DateField
            clearable
            label="Next meeting"
            placeholder="Not planned"
            value={nextDate}
            onChange={setNextDate}
            style={styles.half}
          />
          <TimeField
            label="Time"
            placeholder="Any time"
            value={nextTime}
            onChange={setNextTime}
            style={styles.half}
          />
        </View>
        <TextField
          label="Agenda for next time"
          value={nextAgenda}
          onChangeText={setNextAgenda}
          maxLength={500}
          placeholder="Topics to carry forward"
        />
        <TextArea
          label="Remarks"
          value={remarks}
          onChangeText={setRemarks}
          maxLength={5000}
          placeholder="Anything else to record"
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginBottom: vs(12) },
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
  clear: { marginTop: -vs(6), marginBottom: vs(12) },
  add: { marginBottom: vs(12) },
});
