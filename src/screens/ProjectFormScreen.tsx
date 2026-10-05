import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DateField } from '../components/DateField';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { ListField } from '../components/ListField';
import { Notice } from '../components/Notice';
import { PeopleField } from '../components/PeopleField';
import { PersonPicker } from '../components/PersonPicker';
import { PriorityPicker } from '../components/PriorityPicker';
import { ShimmerRows } from '../components/Shimmer';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import type { Priority } from '../data/mock';
import { errorMessage, fieldErrors, useAppSelector } from '../store';
import {
  ApiProject,
  ProjectMeta,
  useProjectMetaQuery,
  useProjectQuery,
  useSaveProjectMutation,
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

export function ProjectFormScreen() {
  const id: number | undefined = useRoute<any>().params?.id;
  const meta = useProjectMetaQuery();
  const project = useProjectQuery(id as number, { skip: !id });
  const failure = meta.error ?? project.error;
  const title = id ? 'Edit project' : 'Start a project';

  if (!meta.data || (id && !project.data)) {
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
  return <ProjectForm title={title} meta={meta.data} was={project.data} />;
}

function ProjectForm({
  title: heading,
  meta,
  was,
}: {
  title: string;
  meta: ProjectMeta;
  was?: ApiProject;
}) {
  const nav = useNavigation<any>();
  const me = useAppSelector(st => st.session.user);
  const [save, call] = useSaveProjectMutation();
  const categories = useMemo<DropdownOption[]>(
    () => meta.categories.map(c => ({ id: c.key, label: c.label })),
    [meta],
  );

  const [title, setTitle] = useState(was?.title ?? '');
  const [description, setDescription] = useState(was?.description ?? '');
  const [category, setCategory] = useState(was?.category ?? 'operations');
  const [priority, setPriority] = useState<Priority>(
    was ? priorityNames[was.priority] : 'Medium',
  );
  const [start, setStart] = useState(was?.startDate ?? realToday());
  const [end, setEnd] = useState(
    was?.targetEndDate ?? addDays(realToday(), 30),
  );
  const [owner, setOwner] = useState<DropdownOption | undefined>(
    was
      ? { id: String(was.ownerId), label: was.ownerName }
      : me
      ? { id: String(me.id), label: me.name }
      : undefined,
  );
  const [team, setTeam] = useState<DropdownOption[]>(
    was?.team
      .filter(m => m.userId)
      .map(m => ({ id: String(m.userId), label: m.name })) ?? [],
  );
  const [kpis, setKpis] = useState<string[]>(was?.kpis ?? []);
  const [tags, setTags] = useState(was?.tags.join(', ') ?? '');

  const submit = async () => {
    try {
      const saved = await save({
        id: was?.id,
        body: {
          title: title.trim(),
          description: description.trim() || null,
          category,
          priority: apiPriority(priority),
          start_date: start,
          target_end_date: end,
          owner_user_id: owner ? Number(owner.id) : null,
          kpis,
          tags: tags
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),
          team: team.map(m => ({ user_id: Number(m.id), name: m.label })),
        },
      }).unwrap();
      // Editing: back to the record. Creating: open it, with the list behind it.
      if (was) {
        nav.goBack();
      } else {
        nav.replace('ProjectDetail', { id: saved.id });
      }
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
          label={call.isLoading ? 'Saving…' : 'Save project'}
          disabled={!title.trim() || !start || !end || call.isLoading}
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

      <FormCard title="Project">
        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          maxLength={255}
          placeholder="e.g. LIMS upgrade"
          error={errors.title}
        />
        <TextArea
          label="About"
          value={description}
          onChangeText={setDescription}
          maxLength={5000}
          placeholder="What the project is for"
        />
        <Dropdown
          label="Category"
          options={categories}
          value={category}
          onChange={setCategory}
        />
        <PriorityPicker
          value={priority}
          onChange={setPriority}
          style={styles.field}
        />
        <View style={styles.pair}>
          <DateField
            label="Starts *"
            value={start}
            onChange={setStart}
            style={styles.half}
          />
          <DateField
            label="Target end *"
            value={end}
            onChange={setEnd}
            style={styles.half}
          />
        </View>
        {errors.target_end_date ? (
          <AppText
            variant="metaStrong"
            color={colors.redInk}
            style={styles.error}
          >
            {errors.target_end_date}
          </AppText>
        ) : null}
      </FormCard>

      <FormCard title="People">
        <PersonPicker
          label="Project owner"
          placeholder="Choose the owner"
          value={owner}
          onChange={setOwner}
        />
        {owner && me && Number(owner.id) !== me.id ? (
          <Pressable
            hitSlop={s(8)}
            style={styles.clear}
            onPress={() => setOwner({ id: String(me.id), label: me.name })}
          >
            <AppText variant="metaStrong" color={colors.teal}>
              Make me the owner
            </AppText>
          </Pressable>
        ) : null}
        <AppText variant="meta" color={colors.inkMuted} style={styles.hint}>
          Team members see the project and its milestones.
        </AppText>
        <PeopleField people={team} onChange={setTeam} excludeMe={false} />
      </FormCard>

      <FormCard title="Measures">
        <ListField
          label="KPIs"
          items={kpis}
          onChange={setKpis}
          placeholder="e.g. Zero downtime during cut-over"
          maxLength={500}
        />
        <TextField
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
          placeholder="e.g. lims, it"
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
  error: { marginTop: -vs(6), marginBottom: vs(12) },
  clear: { marginTop: -vs(6), marginBottom: vs(12) },
  hint: { marginBottom: vs(10) },
});
