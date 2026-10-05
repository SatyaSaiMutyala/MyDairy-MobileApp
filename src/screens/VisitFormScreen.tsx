import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, X } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { Notice } from '../components/Notice';
import { PersonPicker } from '../components/PersonPicker';
import { PhotoStrip } from '../components/PhotoStrip';
import { Pill } from '../components/Pill';
import { PriorityPicker } from '../components/PriorityPicker';
import { RepeatItem } from '../components/RepeatItem';
import { ShimmerRows } from '../components/Shimmer';
import { StarRating } from '../components/StarRating';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import { errorMessage, fieldErrors, useAppSelector } from '../store';
import { useSaveVisitMutation, useVisitQuery } from '../store/api/visitsApi';
import { realToday } from '../utils/dates';
import {
  assessments,
  followUps,
  observationCategories,
  ratingAreas,
  toVisit,
  Visit,
  VisitAction,
  visitForm,
  VisitMember,
  VisitObservation,
  VisitPhoto,
  visitTypes,
} from '../visits/model';
import { colors, hairline, radius, s, vs } from '../theme';

const MAX_PHOTOS = 20;

let counter = 0;
const newKey = (p: string) => `${p}-${Date.now()}-${++counter}`;

// When continuing a draft, waits for it before drawing the form.
export function VisitFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const query = useVisitQuery(id as number, { skip: !id });

  if (id && !query.data) {
    return (
      <FormScreen title="Continue visit report">
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
  return <VisitForm was={query.data ? toVisit(query.data) : undefined} />;
}

function VisitForm({ was }: { was?: Visit }) {
  const nav = useNavigation<any>();
  const confirm = useConfirm();
  const me = useAppSelector(st => st.session.user);
  const [save, call] = useSaveVisitMutation();

  const [title, setTitle] = useState(was?.title ?? '');
  const [type, setType] = useState(was?.type ?? 'branch');
  const [date, setDate] = useState(was?.date ?? realToday());
  const [timeIn, setTimeIn] = useState(was?.timeIn ?? '');
  const [timeOut, setTimeOut] = useState(was?.timeOut ?? '');

  const [org, setOrg] = useState(was?.org ?? '');
  const [branch, setBranch] = useState(was?.branch ?? '');
  const [address, setAddress] = useState(was?.address ?? '');
  const [city, setCity] = useState(was?.city ?? '');
  const [state, setState] = useState(was?.state ?? '');
  const [gps, setGps] = useState(was?.gps ?? '');
  const [hostName, setHostName] = useState(was?.hostName ?? '');
  const [hostTitle, setHostTitle] = useState(was?.hostTitle ?? '');
  const [hostPhone, setHostPhone] = useState(was?.hostPhone ?? '');
  const [hostEmail, setHostEmail] = useState(was?.hostEmail ?? '');

  // A new report starts with the person writing it as the lead.
  const [team, setTeam] = useState<VisitMember[]>(
    was?.team ??
      (me ? [{ key: 'me', userId: me.id, name: me.name, lead: true }] : []),
  );
  const [external, setExternal] = useState(was?.external ?? '');

  const [purpose, setPurpose] = useState(was?.purpose ?? '');
  const [scope, setScope] = useState(was?.scope ?? '');
  const [refs, setRefs] = useState(was?.refs ?? '');
  const [tags, setTags] = useState(was?.tags.join(', ') ?? '');

  const [ratings, setRatings] = useState<Record<string, number>>(
    was?.ratings ?? {},
  );
  const [assessment, setAssessment] = useState(was?.assessment ?? '');
  const [summary, setSummary] = useState(was?.summary ?? '');
  const [observations, setObservations] = useState<VisitObservation[]>(
    was?.observations.length
      ? was.observations
      : [{ key: newKey('o'), category: 'concern', text: '' }],
  );
  const [photos, setPhotos] = useState<VisitPhoto[]>(was?.photos ?? []);
  const [removedPhotos, setRemovedPhotos] = useState<number[]>([]);
  const [actions, setActions] = useState<VisitAction[]>(was?.actions ?? []);
  const [followUp, setFollowUp] = useState(was?.followUp ?? 'no');
  const [nextVisit, setNextVisit] = useState(was?.nextVisit ?? '');
  const [remarks, setRemarks] = useState(was?.remarks ?? '');

  const patchObs = (key: string, change: Partial<VisitObservation>) =>
    setObservations(list =>
      list.map(o => (o.key === key ? { ...o, ...change } : o)),
    );
  const patchAction = (key: string, change: Partial<VisitAction>) =>
    setActions(list =>
      list.map(a => (a.key === key ? { ...a, ...change } : a)),
    );

  // Somebody must lead: fall back to the first person.
  const withLead = (list: VisitMember[]) =>
    list.some(m => m.lead)
      ? list
      : list.map((m, i) => ({ ...m, lead: i === 0 }));
  const addMember = (userId: number, name: string) =>
    setTeam(list =>
      list.some(m => m.userId === userId)
        ? list
        : withLead([...list, { key: newKey('t'), userId, name, lead: false }]),
    );
  const removeMember = (key: string) =>
    setTeam(list => withLead(list.filter(m => m.key !== key)));
  const makeLead = (key: string) =>
    setTeam(list => list.map(m => ({ ...m, lead: m.key === key })));

  const removePhoto = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo?.serverId) {
      setRemovedPhotos(list => [...list, photo.serverId!]);
    }
    setPhotos(list => list.filter(p => p.id !== id));
  };

  const send = async (status: 'draft' | 'submitted') => {
    if (status === 'submitted') {
      const yes = await confirm({
        title: 'Submit this visit report?',
        text: 'Action items with assignees will be pushed to their My Tasks. After submitting, the report cannot be edited.',
        confirmLabel: 'Submit',
      });
      if (!yes) {
        return;
      }
    }
    try {
      const saved = await save({
        id: was?.id,
        form: visitForm({
          title,
          type,
          status,
          date,
          timeIn,
          timeOut,
          org,
          branch,
          address,
          city,
          state,
          gps,
          hostName,
          hostTitle,
          hostPhone,
          hostEmail,
          team,
          external,
          purpose,
          scope,
          refs,
          tags: tags
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),
          ratings,
          assessment,
          summary,
          observations,
          photos,
          actions,
          followUp,
          nextVisit,
          remarks,
          removedPhotoIds: removedPhotos,
        }),
      }).unwrap();
      // Editing: back to the record. Creating: open it, with the list behind it.
      if (was) {
        nav.goBack();
      } else {
        nav.replace('VisitDetail', { id: saved.id });
      }
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const ready = !!title.trim() && !!date && !call.isLoading;
  const sending = call.isLoading ? call.originalArgs?.form : undefined;
  const errors = fieldErrors(call.error);

  return (
    <FormScreen
      title={was ? 'Continue visit report' : 'Log visit observation'}
      footer={
        <View style={styles.actions}>
          <Button
            label={sending ? 'Saving…' : 'Save draft'}
            variant="outline"
            style={styles.action}
            disabled={!ready}
            onPress={() => send('draft')}
          />
          <Button
            label="Submit report"
            style={styles.action}
            disabled={!ready}
            onPress={() => send('submitted')}
          />
        </View>
      }
    >
      {call.error ? (
        <Notice
          tone="error"
          title={errorMessage(call.error)}
          style={styles.notice}
        />
      ) : null}

      <FormCard title="Visit details">
        <TextField
          label="Visit title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Guntur collection centre audit"
          error={errors.title}
        />
        <Dropdown
          label="Visit type"
          options={visitTypes}
          value={type}
          onChange={setType}
        />
        <DateField label="Date *" value={date} onChange={setDate} />
        <View style={styles.pair}>
          <TimeField
            label="Time in"
            value={timeIn}
            onChange={setTimeIn}
            style={styles.half}
          />
          <TimeField
            label="Time out"
            value={timeOut}
            onChange={setTimeOut}
            style={styles.half}
          />
        </View>
      </FormCard>

      <FormCard title="Location">
        <TextField
          label="Organisation / facility name"
          value={org}
          onChangeText={setOrg}
          maxLength={255}
          placeholder="Who did you visit?"
        />
        <TextField
          label="Branch / location name"
          value={branch}
          onChangeText={setBranch}
          maxLength={255}
          placeholder="e.g. Brodipet"
        />
        <TextArea
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street and area"
        />
        <View style={styles.pair}>
          <View style={styles.half}>
            <TextField
              label="City"
              value={city}
              onChangeText={setCity}
              maxLength={120}
              placeholder="Guntur"
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="State"
              value={state}
              onChangeText={setState}
              maxLength={120}
              placeholder="Andhra Pradesh"
            />
          </View>
        </View>
        <TextField
          label="GPS / Google Maps link"
          value={gps}
          onChangeText={setGps}
          autoCapitalize="none"
          maxLength={500}
          placeholder="Paste a map link"
        />
        <TextField
          label="Host / point of contact"
          value={hostName}
          onChangeText={setHostName}
          maxLength={255}
          placeholder="Name of the person you met"
        />
        <TextField
          label="Host designation"
          value={hostTitle}
          onChangeText={setHostTitle}
          maxLength={255}
          placeholder="e.g. Centre in-charge"
        />
        <View style={styles.pair}>
          <View style={styles.half}>
            <TextField
              label="Host phone"
              value={hostPhone}
              onChangeText={setHostPhone}
              keyboardType="phone-pad"
              maxLength={32}
              placeholder="98480 12345"
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="Host email"
              value={hostEmail}
              onChangeText={setHostEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={255}
              placeholder="name@org.in"
              error={errors.host_email}
            />
          </View>
        </View>
      </FormCard>

      <FormCard title="Visit team">
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          Add everyone who went. Tap "Make lead" to choose the team lead.
        </AppText>
        {team.map(m => (
          <View key={m.key} style={styles.member}>
            <AppText variant="body" numberOfLines={1} style={styles.memberName}>
              {m.name}
            </AppText>
            {m.lead ? (
              <Pill label="Team lead" tone="teal" />
            ) : (
              <Pressable hitSlop={s(8)} onPress={() => makeLead(m.key)}>
                <AppText variant="metaStrong" color={colors.teal}>
                  Make lead
                </AppText>
              </Pressable>
            )}
            <IconButton
              icon={X}
              label={`Remove ${m.name}`}
              size={30}
              iconSize={17}
              strokeWidth={2.25}
              color={colors.inkSoft}
              onPress={() => removeMember(m.key)}
            />
          </View>
        ))}
        <PersonPicker
          placeholder="Search and add a team member"
          onChange={p => addMember(Number(p.id), p.label)}
        />
        <TextField
          label="External participants (if any)"
          value={external}
          onChangeText={setExternal}
          maxLength={1000}
          placeholder="Names of people from outside TrustLab"
        />
      </FormCard>

      <FormCard title="Purpose & scope">
        <TextArea
          label="Purpose of visit"
          value={purpose}
          onChangeText={setPurpose}
          maxLength={5000}
          placeholder="Why was this visit made?"
        />
        <TextArea
          label="Areas covered / scope"
          value={scope}
          onChangeText={setScope}
          maxLength={5000}
          placeholder="Which areas did you look at?"
        />
        <TextField
          label="Reference documents / standards"
          value={refs}
          onChangeText={setRefs}
          placeholder="e.g. ISO 15189, SOP-014"
        />
        <TextField
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
          placeholder="e.g. audit, cold-chain"
        />
      </FormCard>

      <FormCard title="Area ratings">
        {ratingAreas.map(a => (
          <StarRating
            key={a.id}
            label={a.label}
            value={ratings[a.id] ?? 0}
            onChange={v => setRatings(r => ({ ...r, [a.id]: v }))}
          />
        ))}
      </FormCard>

      <FormCard title="Overall assessment">
        <Dropdown
          label="Overall assessment"
          placeholder="Select assessment"
          options={assessments}
          value={assessment}
          onChange={setAssessment}
        />
        <TextArea
          label="Executive summary"
          value={summary}
          onChangeText={setSummary}
          maxLength={5000}
          placeholder="The visit in two or three lines"
        />
      </FormCard>

      <FormCard title="Detailed observations">
        {observations.map((o, i) => (
          <RepeatItem
            key={o.key}
            first={i === 0}
            title={`Observation ${i + 1}`}
            onRemove={
              observations.length > 1
                ? () =>
                    setObservations(list => list.filter(x => x.key !== o.key))
                : undefined
            }
          >
            <Dropdown
              label="Category"
              options={observationCategories}
              value={o.category}
              onChange={category => patchObs(o.key, { category })}
            />
            <TextArea
              label="Observation"
              value={o.text}
              onChangeText={text => patchObs(o.key, { text })}
              maxLength={5000}
              placeholder="What did you see?"
            />
            <TextField
              label="Ref / evidence link"
              value={o.evidence ?? ''}
              onChangeText={evidence => patchObs(o.key, { evidence })}
              maxLength={500}
              placeholder="Register page, document or link"
            />
          </RepeatItem>
        ))}
        <Button
          label="Add observation"
          variant="outline"
          size="md"
          iconLeft={Plus}
          iconColor={colors.teal}
          style={styles.add}
          onPress={() =>
            setObservations(list => [
              ...list,
              { key: newKey('o'), category: 'concern', text: '' },
            ])
          }
        />
      </FormCard>

      <FormCard title="Photos & evidence">
        <View style={styles.photos}>
          <PhotoStrip
            photos={photos}
            max={MAX_PHOTOS}
            caption={title}
            onAdd={uris =>
              setPhotos(list =>
                [...list, ...uris.map(uri => ({ id: newKey('p'), uri }))].slice(
                  0,
                  MAX_PHOTOS,
                ),
              )
            }
            onRemove={removePhoto}
          />
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            Up to {MAX_PHOTOS} photographs, 5 MB each.
          </AppText>
        </View>
      </FormCard>

      <FormCard title="Action items">
        {actions.length === 0 ? (
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            Actions given to a colleague appear in their My Tasks once you
            submit.
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
              label="Action required"
              value={a.text}
              onChangeText={text => patchAction(a.key, { text })}
              maxLength={1000}
              placeholder="What must be done?"
            />
            <PersonPicker
              label="Assignee"
              placeholder="Nobody yet"
              value={
                a.assigneeId
                  ? {
                      id: String(a.assigneeId),
                      label: a.assignee ?? 'Chosen person',
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
                  patchAction(a.key, {
                    assigneeId: undefined,
                    assignee: undefined,
                  })
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
                key: newKey('a'),
                text: '',
                due: '',
                priority: 'Medium',
                done: false,
              },
            ])
          }
        />
      </FormCard>

      <FormCard title="Follow-up">
        <Dropdown
          label="Follow-up required?"
          options={followUps}
          value={followUp}
          onChange={setFollowUp}
        />
        <DateField
          clearable
          label="Next visit date (if required)"
          placeholder="Not planned"
          value={nextVisit}
          onChange={setNextVisit}
        />
        <TextArea
          label="Additional remarks"
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
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  field: { marginBottom: vs(12) },
  hint: { marginBottom: vs(12) },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(6),
    paddingLeft: s(12),
    paddingRight: s(4),
    marginBottom: vs(8),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  memberName: { flex: 1 },
  clear: { marginTop: -vs(6), marginBottom: vs(12) },
  add: { marginBottom: vs(12) },
  photos: { marginBottom: vs(2) },
});
