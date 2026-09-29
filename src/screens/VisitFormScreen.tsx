import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { PhotoStrip } from '../components/PhotoStrip';
import { PriorityPicker } from '../components/PriorityPicker';
import { RepeatItem } from '../components/RepeatItem';
import { StarRating } from '../components/StarRating';
import { SwitchRow } from '../components/SwitchRow';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { TimeField } from '../components/TimeField';
import {
  assessments,
  colleagues,
  followUps,
  observationCategories,
  ratingAreas,
  Visit,
  VisitAction,
  VisitMember,
  VisitObservation,
  VisitPhoto,
  visitTypes,
} from '../data/mock';
import { currentUser } from '../data/user';
import { useStore } from '../state/Store';
import { TODAY_ISO } from '../utils/dates';
import { colors, s, vs } from '../theme';

const MAX_PHOTOS = 20;


let counter = 0;
const newId = (p: string) => `${p}-${Date.now()}-${++counter}`;

export function VisitFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { visits, saveVisit } = useStore();
  const editing = visits.find(v => v.id === route.params?.id);
  const was = editing;

  const people = [
    { id: 'me', label: `${currentUser.name} (me)`, detail: currentUser.role },
    ...colleagues,
  ];
  const assignees = [{ id: '', label: 'Nobody / free text' }, ...people];

  const [title, setTitle] = useState(was?.title ?? '');
  const [type, setType] = useState(was?.type ?? 'branch');
  const [date, setDate] = useState(was?.date ?? TODAY_ISO);
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

  const [team, setTeam] = useState<VisitMember[]>(
    was?.team ?? [{ id: 'me', name: currentUser.name, lead: true }],
  );
  const [external, setExternal] = useState(was?.external ?? '');

  const [purpose, setPurpose] = useState(was?.purpose ?? '');
  const [scope, setScope] = useState(was?.scope ?? '');
  const [refs, setRefs] = useState(was?.refs ?? '');
  const [tags, setTags] = useState(was?.tags?.join(', ') ?? '');

  const [ratings, setRatings] = useState<Record<string, number>>(was?.ratings ?? {});
  const [assessment, setAssessment] = useState(was?.assessment ?? '');
  const [summary, setSummary] = useState(was?.summary ?? '');
  const [observations, setObservations] = useState<VisitObservation[]>(
    was?.observations.length
      ? was.observations
      : [{ id: newId('o'), category: 'concern', text: '' }],
  );
  const [photos, setPhotos] = useState<VisitPhoto[]>(was?.photos ?? []);
  const [actions, setActions] = useState<VisitAction[]>(was?.actions ?? []);
  const [followUp, setFollowUp] = useState(was?.followUp ?? 'no');
  const [nextVisit, setNextVisit] = useState(was?.nextVisit ?? '');
  const [remarks, setRemarks] = useState(was?.remarks ?? '');

  const patchObs = (id: string, change: Partial<VisitObservation>) =>
    setObservations(list => list.map(o => (o.id === id ? { ...o, ...change } : o)));
  const patchAction = (id: string, change: Partial<VisitAction>) =>
    setActions(list => list.map(a => (a.id === id ? { ...a, ...change } : a)));

  const toggleMember = (id: string, name: string) =>
    setTeam(list => {
      const next = list.some(m => m.id === id)
        ? list.filter(m => m.id !== id)
        : [...list, { id, name }];
      // Somebody must lead: fall back to the first person.
      return next.some(m => m.lead)
        ? next
        : next.map((m, i) => ({ ...m, lead: i === 0 }));
    });
  const makeLead = (id: string) =>
    setTeam(list => list.map(m => ({ ...m, lead: m.id === id })));

  const blank = (v: string) => v.trim() || undefined;

  const save = (status: Visit['status']) => {
    const tagList = tags
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    saveVisit(
      {
        title: title.trim(),
        type,
        status,
        date,
        timeIn: blank(timeIn),
        timeOut: blank(timeOut),
        org: org.trim() || 'Not given',
        branch: blank(branch),
        address: blank(address),
        city: city.trim() || 'Not given',
        state: blank(state),
        gps: blank(gps),
        hostName: blank(hostName),
        hostTitle: blank(hostTitle),
        hostPhone: blank(hostPhone),
        hostEmail: blank(hostEmail),
        team,
        external: blank(external),
        purpose: blank(purpose),
        scope: blank(scope),
        refs: blank(refs),
        tags: tagList.length ? tagList : undefined,
        ratings,
        assessment: assessment || undefined,
        summary: blank(summary),
        observations: observations.filter(o => o.text.trim()),
        photos,
        actions: actions.filter(a => a.text.trim()),
        followUp,
        nextVisit: nextVisit || undefined,
        remarks: blank(remarks),
        owner: was?.owner ?? currentUser.name,
        submittedOn: status === 'draft' ? undefined : 'Today',
      },
      editing?.id,
    );
    nav.navigate('Visits');
  };

  const ready = !!title.trim();

  return (
    <FormScreen
      title={editing ? 'Continue visit report' : 'Log visit observation'}
      footer={
        <View style={styles.actions}>
          <Button
            label="Save draft"
            variant="outline"
            style={styles.action}
            disabled={!ready}
            onPress={() => save('draft')}
          />
          <Button
            label="Submit report"
            style={styles.action}
            disabled={!ready}
            onPress={() => save('submitted')}
          />
        </View>
      }>
      <FormCard title="Visit details">
        <TextField
          label="Visit title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Guntur collection centre audit"
        />
        <Dropdown label="Visit type" options={visitTypes} value={type} onChange={setType} />
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
          label="Organisation / facility name *"
          value={org}
          onChangeText={setOrg}
          placeholder="Who did you visit?"
        />
        <TextField
          label="Branch / location name"
          value={branch}
          onChangeText={setBranch}
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
            <TextField label="City" value={city} onChangeText={setCity} placeholder="Guntur" />
          </View>
          <View style={styles.half}>
            <TextField
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="Andhra Pradesh"
            />
          </View>
        </View>
        <TextField
          label="GPS / Google Maps link"
          value={gps}
          onChangeText={setGps}
          autoCapitalize="none"
          placeholder="Paste a map link"
        />
        <TextField
          label="Host / point of contact"
          value={hostName}
          onChangeText={setHostName}
          placeholder="Name of the person you met"
        />
        <TextField
          label="Host designation"
          value={hostTitle}
          onChangeText={setHostTitle}
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
              placeholder="name@org.in"
            />
          </View>
        </View>
      </FormCard>

      <FormCard title="Visit team">
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          Tick everyone who went. Tap "Make lead" to choose the team lead.
        </AppText>
        {people.map(p => {
          const member = team.find(m => m.id === p.id);
          const name = p.id === 'me' ? currentUser.name : p.label;
          return (
            <View key={p.id} style={styles.member}>
              <View style={styles.memberTick}>
                <SwitchRow
                  label={p.label}
                  detail={member?.lead ? 'Team lead' : p.detail}
                  value={!!member}
                  onChange={() => toggleMember(p.id, name)}
                />
              </View>
              {member && !member.lead ? (
                <Button
                  label="Make lead"
                  size="sm"
                  variant="outline"
                  onPress={() => makeLead(p.id)}
                />
              ) : null}
            </View>
          );
        })}
        <TextField
          label="External participants (if any)"
          value={external}
          onChangeText={setExternal}
          placeholder="Names of people from outside TrustLab"
        />
      </FormCard>

      <FormCard title="Purpose & scope">
        <TextArea
          label="Purpose of visit *"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Why was this visit made?"
        />
        <TextArea
          label="Areas covered / scope"
          value={scope}
          onChangeText={setScope}
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
          label="Overall assessment *"
          placeholder="Select assessment"
          options={assessments}
          value={assessment}
          onChange={setAssessment}
        />
        <TextArea
          label="Executive summary"
          value={summary}
          onChangeText={setSummary}
          placeholder="The visit in two or three lines"
        />
      </FormCard>

      <FormCard title="Detailed observations">
        {observations.map((o, i) => (
          <RepeatItem
            key={o.id}
            first={i === 0}
            title={`Observation ${i + 1}`}
            onRemove={
              observations.length > 1
                ? () => setObservations(list => list.filter(x => x.id !== o.id))
                : undefined
            }>
            <Dropdown
              label="Category"
              options={observationCategories}
              value={o.category}
              onChange={category => patchObs(o.id, { category })}
            />
            <TextArea
              label="Observation"
              value={o.text}
              onChangeText={text => patchObs(o.id, { text })}
              maxLength={5000}
              placeholder="What did you see?"
            />
            <TextField
              label="Ref / evidence link"
              value={o.evidence ?? ''}
              onChangeText={evidence => patchObs(o.id, { evidence })}
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
              { id: newId('o'), category: 'concern', text: '' },
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
                [...list, ...uris.map(uri => ({ id: newId('p'), uri }))].slice(
                  0,
                  MAX_PHOTOS,
                ),
              )
            }
            onRemove={id => setPhotos(list => list.filter(p => p.id !== id))}
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
            key={a.id}
            first={i === 0}
            title={`Action ${i + 1}`}
            onRemove={() => setActions(list => list.filter(x => x.id !== a.id))}>
            <TextField
              label="Action required"
              value={a.text}
              onChangeText={text => patchAction(a.id, { text })}
              placeholder="What must be done?"
            />
            <Dropdown
              label="Assignee"
              options={assignees}
              value={a.assignee}
              onChange={assignee => patchAction(a.id, { assignee })}
            />
            <DateField
              clearable
              label="Due date"
              placeholder="No due date"
              value={a.due}
              onChange={due => patchAction(a.id, { due })}
            />
            <PriorityPicker
              value={a.priority}
              onChange={priority => patchAction(a.id, { priority })}
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
              { id: newId('a'), text: '', assignee: '', due: '', priority: 'Medium' },
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
          placeholder="Anything else to record"
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  field: { marginBottom: vs(12) },
  hint: { marginBottom: vs(12) },
  member: { flexDirection: 'row', alignItems: 'flex-start', gap: s(10) },
  memberTick: { flex: 1 },
  add: { marginBottom: vs(12) },
  photos: { marginBottom: vs(2) },
});
