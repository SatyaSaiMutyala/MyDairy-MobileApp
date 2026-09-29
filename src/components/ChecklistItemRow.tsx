import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ban, Camera, Check, CircleAlert, Clock, TriangleAlert } from 'lucide-react-native';
import type { Activity } from '../data/labReadiness';
import {
  LabItem,
  LabStatus,
  MAX_PHOTOS,
  needsPhoto,
  needsRemark,
} from '../state/LabStore';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Choice, ChoiceGroup } from './ChoiceGroup';
import { IconText } from './IconText';
import { PhotoStrip } from './PhotoStrip';
import { Pill } from './Pill';
import { StatusDot } from './StatusDot';
import { TextArea } from './TextArea';

type Props = {
  activity: Activity;
  item: LabItem;
  locked: boolean;
  onStatus?: (status: LabStatus | null) => void;
  onRemark?: (text: string) => void;
  onAddPhotos?: (uris: string[]) => void;
  onRemovePhoto?: (id: string) => void;
};

const options: Choice<LabStatus>[] = [
  { key: 'done', label: 'Done', icon: Check, tone: 'teal' },
  { key: 'deviation', label: 'Deviation', icon: TriangleAlert, tone: 'amber' },
  { key: 'na', label: 'N/A', icon: Ban, tone: 'slate' },
];

const remarkLabel = (status: LabStatus | null) =>
  status === 'deviation'
    ? 'Deviation, containment action and escalation'
    : status === 'na'
    ? 'Reason not applicable'
    : 'Note (optional)';

export function ChecklistItemRow({
  activity,
  item,
  locked,
  onStatus,
  onRemark,
  onAddPhotos,
  onRemovePhoto,
}: Props) {
  const remarkMissing = needsRemark(item);
  const photoMissing = needsPhoto(activity, item);
  const touched = item.status !== null || item.photos.length > 0;
  const showPhotos =
    item.photos.length > 0 || (!locked && (activity.photoRequired || touched));
  const showRemark = locked ? !!item.remark.trim() : touched;

  return (
    <View style={styles.item}>
      <View style={styles.head}>
        <StatusDot status={item.status ?? 'open'} />
        <View style={styles.headBody}>
          <AppText variant="body">{activity.text}</AppText>
          <View style={styles.meta}>
            <IconText icon={Clock} text={activity.time} />
            {activity.photoRequired ? (
              <Pill label="Photo required" tone="low" icon={Camera} />
            ) : null}
          </View>
          {item.actionedBy ? (
            <AppText variant="meta" color={colors.inkFaint} style={styles.stamp}>
              Actioned {item.actionedAt} · {item.actionedBy}
            </AppText>
          ) : null}
        </View>
      </View>

      {locked ? null : (
        <ChoiceGroup
          clearable
          style={styles.block}
          options={options}
          value={item.status}
          onChange={k => onStatus?.(k)}
        />
      )}

      {showPhotos ? (
        <View style={styles.block}>
          <PhotoStrip
            photos={item.photos}
            max={MAX_PHOTOS}
            locked={locked}
            caption={activity.text}
            onAdd={onAddPhotos}
            onRemove={onRemovePhoto}
          />
        </View>
      ) : null}
      {photoMissing ? <Hint text="Add a photograph to complete this item" /> : null}

      {showRemark ? (
        <View style={styles.block}>
          <AppText variant="metaStrong" color={colors.inkSoft}>
            {remarkLabel(item.status)}
          </AppText>
          {locked ? (
            <AppText variant="bodyRegular" color={colors.inkSoft} style={styles.remark}>
              {item.remark}
            </AppText>
          ) : (
            <TextArea
              value={item.remark}
              onChangeText={onRemark}
              maxLength={5000}
              placeholder="What happened and what did you do?"
              invalid={remarkMissing}
              style={styles.remark}
            />
          )}
          {remarkMissing ? <Hint text="Add a remark to complete this item" /> : null}
        </View>
      ) : null}
    </View>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <IconText
      icon={CircleAlert}
      text={text}
      variant="metaStrong"
      color={colors.redInk}
      iconColor={colors.red}
      iconSize={14}
      gap={6}
      style={styles.hint}
    />
  );
}

const styles = StyleSheet.create({
  item: { paddingHorizontal: s(14), paddingVertical: vs(14) },
  head: { flexDirection: 'row', gap: s(12) },
  headBody: { flex: 1 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: s(10),
    marginTop: vs(6),
  },
  stamp: { marginTop: vs(4) },
  block: { marginTop: vs(12) },
  remark: { marginTop: vs(6) },
  hint: { marginTop: vs(8) },
});
