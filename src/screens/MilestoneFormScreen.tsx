import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useConfirm } from '../components/ConfirmDialog';
import { DateField } from '../components/DateField';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { Notice } from '../components/Notice';
import { PersonPicker } from '../components/PersonPicker';
import { PriorityPicker } from '../components/PriorityPicker';
import { ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import type { Priority } from '../data/mock';
import { errorMessage, fieldErrors } from '../store';
import {
  ApiMilestone,
  MilestoneStatus,
  ProjectMeta,
  useDeleteMilestoneMutation,
  useProjectMetaQuery,
  useProjectQuery,
  useSaveMilestoneMutation,
} from '../store/api/projectsApi';
import { apiPriority } from '../tasks/model';
import { addDays, realToday } from '../utils/dates';
import { colors, s, vs } from '../theme';

const priorityNames = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;

export function MilestoneFormScreen() {
  const { projectId, id } = useRoute<any>().params as {
    projectId: number;
    id?: number;
  };
  const meta = useProjectMetaQuery();
  const project = useProjectQuery(projectId);
  const failure = meta.error ?? project.error;
  const title = id ? 'Edit milestone' : 'Add milestone';
  const was = project.data?.milestones.find(m => m.id === id);

  if (!meta.data || !project.data || (id && !was)) {
    return (
      <FormScreen title={title}>
        {failure || (project.data && id && !was) ? (
          <Notice
            tone="error"
            title={
              failure
                ? errorMessage(failure)
                : 'That milestone no longer exists.'
            }
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
    <MilestoneForm
      title={title}
      meta={meta.data}
      projectId={projectId}
      canDelete={project.data.mineToEdit}
      was={was}
    />
  );
}

type FormProps = {
  title: string;
  meta: ProjectMeta;
  projectId: number;
  canDelete: boolean;
  was?: ApiMilestone;
};

function MilestoneForm({
  title: heading,
  meta,
  projectId,
  canDelete,
  was,
}: FormProps) {
  const nav = useNavigation<any>();
  const confirm = useConfirm();
  const [save, call] = useSaveMilestoneMutation();
  const [destroy, deleting] = useDeleteMilestoneMutation();
  const statuses = useMemo<DropdownOption[]>(
    () => meta.milestoneStatuses.map(x => ({ id: x.key, label: x.label })),
    [meta],
  );
  const reasons = useMemo<DropdownOption[]>(
    () => meta.reasons.map(x => ({ id: x.key, label: x.label })),
    [meta],
  );

  const [title, setTitle] = useState(was?.title ?? '');
  const [description, setDescription] = useState(was?.description ?? '');
  const [deadline, setDeadline] = useState(
    was?.deadline ?? addDays(realToday(), 14),
  );
  const [revised, setRevised] = useState(was?.revisedDeadline ?? '');
  const [reason, setReason] = useState(was?.revisionReason ?? 'other');
  const [revisionNotes, setRevisionNotes] = useState(was?.revisionNotes ?? '');
  const [pct, setPct] = useState(String(was?.pctComplete ?? 0));
  const [status, setStatus] = useState<MilestoneStatus>(
    was?.status ?? 'not_started',
  );
  const [owner, setOwner] = useState<DropdownOption | undefined>(
    was?.ownerUserId
      ? { id: String(was.ownerUserId), label: was.ownerName ?? 'Owner' }
      : undefined,
  );
  const [impact, setImpact] = useState<Priority>(
    was ? priorityNames[was.impact] : 'Medium',
  );
  const [impactText, setImpactText] = useState(was?.impactDescription ?? '');
  const [dependencies, setDependencies] = useState(was?.dependencies ?? '');
  const [criteria, setCriteria] = useState(was?.completionCriteria ?? '');

  const submit = async () => {
    try {
      await save({
        projectId,
        id: was?.id,
        body: {
          title: title.trim(),
          description: description.trim() || null,
          deadline,
          revised_deadline: revised || null,
          revision_reason: revised ? reason : null,
          revision_notes: revised ? revisionNotes.trim() || null : null,
          pct_complete: Math.max(0, Math.min(100, Number(pct) || 0)),
          status,
          owner_user_id: owner ? Number(owner.id) : null,
          owner_name: owner?.label ?? null,
          impact: apiPriority(impact),
          impact_description: impactText.trim() || null,
          dependencies: dependencies.trim() || null,
          completion_criteria: criteria.trim() || null,
        },
      }).unwrap();
      nav.goBack();
    } catch {
      // The API's message is shown at the top of the form.
    }
  };

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this milestone?',
      text: 'If it made a task for its owner, that task is marked completed.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes && was) {
      destroy({ projectId, id: was.id })
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  const errors = fieldErrors(call.error);
  const failure = call.error ?? deleting.error;

  return (
    <FormScreen
      title={heading}
      right={
        was && canDelete ? (
          <IconButton
            icon={Trash2}
            label="Delete milestone"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }
      footer={
        <Button
          label={call.isLoading ? 'Saving…' : 'Save milestone'}
          disabled={!title.trim() || !deadline || call.isLoading}
          onPress={submit}
        />
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.notice}
        />
      ) : null}

      <FormCard title="Milestone">
        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. Backup server ready"
          error={errors.title}
        />
        <TextArea
          label="Description"
          value={description}
          onChangeText={setDescription}
          maxLength={5000}
          placeholder="What must be delivered"
        />
        <DateField label="Deadline *" value={deadline} onChange={setDeadline} />
        <Dropdown
          label="Status"
          options={statuses}
          value={status}
          onChange={v => setStatus(v as MilestoneStatus)}
        />
        <TextField
          label="Progress (%)"
          value={pct}
          onChangeText={setPct}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="0"
          error={errors.pct_complete}
        />
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          100% marks it completed; "Completed" sets it to 100%.
        </AppText>
      </FormCard>

      <FormCard title="Owner & impact">
        <PersonPicker
          label="Owner"
          placeholder="Nobody yet"
          value={owner}
          onChange={setOwner}
        />
        {owner ? (
          <Pressable
            hitSlop={s(8)}
            style={styles.clear}
            onPress={() => setOwner(undefined)}
          >
            <AppText variant="metaStrong" color={colors.teal}>
              Remove owner
            </AppText>
          </Pressable>
        ) : (
          <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
            An owner gets this milestone as a task in their My Tasks.
          </AppText>
        )}
        <PriorityPicker
          value={impact}
          onChange={setImpact}
          style={styles.field}
        />
        <TextArea
          label="Why it matters"
          value={impactText}
          onChangeText={setImpactText}
          maxLength={2000}
          placeholder="Impact if it slips"
        />
        <TextField
          label="Depends on"
          value={dependencies}
          onChangeText={setDependencies}
          maxLength={1000}
          placeholder="e.g. Vendor delivery"
        />
        <TextArea
          label="Done when"
          value={criteria}
          onChangeText={setCriteria}
          maxLength={2000}
          placeholder="How we know it is complete"
        />
      </FormCard>

      <FormCard title="Revised deadline">
        <View style={styles.pair}>
          <DateField
            clearable
            label="New deadline"
            placeholder="Not revised"
            value={revised}
            onChange={setRevised}
            style={styles.half}
          />
        </View>
        {revised ? (
          <>
            <Dropdown
              label="Reason"
              options={reasons}
              value={reason}
              onChange={setReason}
            />
            <TextArea
              label="Notes"
              value={revisionNotes}
              onChangeText={setRevisionNotes}
              maxLength={2000}
              placeholder="Why the date moved"
            />
          </>
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            Set a new date only when the original cannot be met. Every change is
            recorded.
          </AppText>
        )}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  field: { marginBottom: vs(12) },
  pair: { flexDirection: 'row', gap: s(12) },
  half: { flex: 1 },
  hint: { marginTop: -vs(6), marginBottom: vs(12) },
  clear: { marginTop: -vs(6), marginBottom: vs(12) },
});
