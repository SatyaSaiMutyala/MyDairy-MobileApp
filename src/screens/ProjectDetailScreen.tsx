import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Divider } from '../components/Card';
import { useConfirm } from '../components/ConfirmDialog';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { IconButton } from '../components/IconButton';
import { InfoRow } from '../components/InfoRow';
import { Notice } from '../components/Notice';
import { Pill, priorityTone } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { ShimmerRows } from '../components/Shimmer';
import {
  milestoneTone,
  priorityLabel,
  progressColor,
  projectTone,
} from '../projects/model';
import { errorMessage } from '../store';
import {
  useDeleteProjectMutation,
  useProjectQuery,
} from '../store/api/projectsApi';
import { useFresh } from '../store/useFresh';
import { longDate, shortDate } from '../utils/dates';
import { colors, s, vs } from '../theme';

const FRESH = ['Project'] as const;

export function ProjectDetailScreen() {
  const nav = useNavigation<any>();
  const id: number = useRoute<any>().params?.id;
  const fresh = useFresh(FRESH);
  const query = useProjectQuery(id);
  const [destroy, deleting] = useDeleteProjectMutation();
  const confirm = useConfirm();

  if (!query.data) {
    return (
      <FormScreen title="Project">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : (
          <FormCard style={styles.card}>
            <ShimmerRows rows={4} icon={false} />
          </FormCard>
        )}
      </FormScreen>
    );
  }

  const p = query.data;
  const c = p.milestoneCounts;

  const remove = async () => {
    const yes = await confirm({
      title: 'Delete this project?',
      text: 'Its milestones go with it. Tasks already made from milestones are marked completed.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (yes) {
      destroy(p.id)
        .unwrap()
        .then(() => nav.goBack())
        .catch(() => {});
    }
  };

  return (
    <FormScreen
      title="Project"
      onRefresh={fresh}
      right={
        p.mineToEdit ? (
          <IconButton
            icon={Trash2}
            label="Delete project"
            iconSize={20}
            color={colors.red}
            onPress={remove}
          />
        ) : undefined
      }
      footer={
        p.mineToEdit ? (
          <View style={styles.actions}>
            <Button
              label="Edit"
              variant="outline"
              iconLeft={Pencil}
              style={styles.action}
              onPress={() => nav.navigate('ProjectForm', { id: p.id })}
            />
            <Button
              label="Add milestone"
              iconLeft={Plus}
              style={styles.action}
              onPress={() => nav.navigate('MilestoneForm', { projectId: p.id })}
            />
          </View>
        ) : undefined
      }
    >
      {deleting.error ? (
        <Notice
          tone="error"
          title={errorMessage(deleting.error)}
          style={styles.notice}
        />
      ) : null}

      <FormCard style={styles.card}>
        <View style={styles.tags}>
          <Pill label={p.statusLabel} tone={projectTone[p.status]} />
          <Pill
            label={priorityLabel(p.priority)}
            tone={priorityTone(priorityLabel(p.priority))}
          />
          <Pill label={p.categoryLabel} tone="low" />
        </View>
        <AppText variant="heading" style={styles.title}>
          {p.title}
        </AppText>
        <View style={styles.bar}>
          <ProgressBar
            value={p.progress}
            color={progressColor(p.status)}
            style={styles.track}
          />
          <AppText variant="metaStrong" color={colors.inkSoft}>
            {p.progress}%
          </AppText>
        </View>
        <AppText variant="meta" color={colors.inkMuted} style={styles.line}>
          {c.done} of {c.total} milestones done
          {c.overdue ? ` · ${c.overdue} late` : ''}
          {c.atRisk ? ` · ${c.atRisk} at risk` : ''}
        </AppText>
        <View style={styles.gap} />
        <InfoRow label="Owner" value={p.ownerName} />
        <InfoRow
          label="Starts"
          value={p.startDate ? longDate(p.startDate) : undefined}
        />
        <InfoRow
          label="Target end"
          value={p.targetEndDate ? longDate(p.targetEndDate) : undefined}
        />
        <InfoRow
          label="Finished"
          value={p.actualEndDate ? longDate(p.actualEndDate) : undefined}
        />
        <InfoRow label="About" value={p.description} />
        {p.tags.length ? (
          <View style={styles.tags}>
            {p.tags.map(tag => (
              <Pill key={tag} label={`#${tag}`} tone="low" />
            ))}
          </View>
        ) : null}
      </FormCard>

      {p.team.length || p.kpis.length ? (
        <FormCard title="Team & KPIs" style={styles.card}>
          {p.team.length ? (
            <View style={[styles.tags, styles.below]}>
              {p.team.map(m => (
                <Pill key={m.id} label={m.name} tone="teal" />
              ))}
            </View>
          ) : null}
          {p.kpis.map((k, i) => (
            <AppText key={i} variant="bodyRegular" style={styles.line}>
              • {k}
            </AppText>
          ))}
        </FormCard>
      ) : null}

      <FormCard
        title={`Milestones · ${p.milestones.length}`}
        style={styles.card}
      >
        {p.milestones.length ? (
          p.milestones.map((m, i) => {
            const due = m.revisedDeadline ?? m.deadline;
            return (
              <View key={m.id}>
                {i > 0 ? <Divider style={styles.rule} /> : null}
                <Pressable
                  disabled={!m.mineToEdit}
                  onPress={() =>
                    nav.navigate('MilestoneForm', { projectId: p.id, id: m.id })
                  }
                  style={styles.milestone}
                >
                  <View style={styles.milestoneBody}>
                    <AppText variant="body">{m.title}</AppText>
                    <View style={[styles.tags, styles.line]}>
                      <Pill
                        label={m.statusLabel}
                        tone={milestoneTone[m.status]}
                      />
                      {m.overdue ? <Pill label="Late" tone="critical" /> : null}
                      <Pill
                        label={`${priorityLabel(m.impact)} impact`}
                        tone={priorityTone(priorityLabel(m.impact))}
                      />
                    </View>
                    <View style={styles.bar}>
                      <ProgressBar
                        value={m.pctComplete}
                        color={progressColor(m.status)}
                        style={styles.track}
                      />
                      <AppText variant="meta" color={colors.inkSoft}>
                        {m.pctComplete}%
                      </AppText>
                    </View>
                    <AppText
                      variant="meta"
                      color={colors.inkMuted}
                      style={styles.line}
                    >
                      {due ? `Due ${shortDate(due)}` : ''}
                      {m.revisedDeadline ? ' (revised)' : ''}
                      {m.ownerName ? ` · ${m.ownerName}` : ' · No owner'}
                      {m.taskId ? ' · In My Tasks' : ''}
                    </AppText>
                  </View>
                  {m.mineToEdit ? (
                    <ChevronRight
                      size={s(19)}
                      color={colors.inkFaint}
                      strokeWidth={2}
                    />
                  ) : null}
                </Pressable>
              </View>
            );
          })
        ) : (
          <AppText variant="meta" color={colors.inkMuted}>
            No milestones yet. Add the first one to start tracking.
          </AppText>
        )}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10) },
  actions: { flexDirection: 'row', gap: s(12) },
  action: { flex: 1 },
  card: { paddingBottom: vs(14) },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6),
  },
  below: { marginBottom: vs(10) },
  title: { marginTop: vs(10), marginBottom: vs(10) },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginTop: vs(8),
  },
  track: { flex: 1 },
  line: { marginTop: vs(6) },
  gap: { height: vs(10) },
  rule: { marginVertical: vs(12) },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  milestoneBody: { flex: 1 },
});
