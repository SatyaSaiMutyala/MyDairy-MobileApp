import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import type { Draft } from '../activity/model';
import type { ActivityItem } from '../store/api/activityApi';
import { colors, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Dropdown, DropdownOption } from './Dropdown';
import { Pill } from './Pill';
import { TextArea } from './TextArea';
import { TextField } from './TextField';

type EditProps = {
  index: number;
  row: Draft;
  categories: DropdownOption[];
  durations: DropdownOption[];
  onChange: (row: Draft) => void;
  onRemove: () => void;
};

// One activity being written: what was done, what kind, how long, a reference.
export function ActivityRowEdit({
  index,
  row,
  categories,
  durations,
  onChange,
  onRemove,
}: EditProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={styles.badge}>
          <AppText variant="metaStrong" color={colors.tealDeep}>
            {index + 1}
          </AppText>
        </View>
        <AppText variant="label" style={styles.headText}>
          Activity {index + 1}
        </AppText>
        <Pressable
          hitSlop={s(10)}
          accessibilityLabel={`Remove activity ${index + 1}`}
          onPress={onRemove}
        >
          <Trash2 size={s(17)} color={colors.redInk} strokeWidth={1.9} />
        </Pressable>
      </View>
      <TextArea
        value={row.text}
        onChangeText={text => onChange({ ...row, text })}
        maxLength={1000}
        placeholder="What did you complete?"
      />
      <View style={styles.pair}>
        <Dropdown
          label="Category"
          placeholder="Pick one"
          options={categories}
          value={row.category}
          onChange={category => onChange({ ...row, category })}
          style={styles.pairItem}
        />
        <Dropdown
          label="Time spent"
          placeholder="Pick"
          options={durations}
          value={row.minutes ? String(row.minutes) : ''}
          onChange={m => onChange({ ...row, minutes: Number(m) })}
          style={styles.pairItem}
        />
      </View>
      <TextField
        label="Task / ticket ID (optional)"
        value={row.ref}
        onChangeText={ref => onChange({ ...row, ref })}
        maxLength={64}
        placeholder="e.g. T-128"
      />
    </Card>
  );
}

// One activity as it was saved: read-only.
export function ActivityRowView({
  index,
  item,
}: {
  index: number;
  item: ActivityItem;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <AppText variant="metaStrong" color={colors.tealDeep}>
          {index + 1}
        </AppText>
      </View>
      <View style={styles.rowText}>
        <AppText variant="body">{item.text}</AppText>
        <View style={styles.pills}>
          <Pill label={item.categoryLabel} tone="teal" />
          <Pill label={item.time} tone="low" />
          {item.ref ? (
            <AppText variant="meta" color={colors.inkMuted}>
              Ref {item.ref}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    marginTop: vs(10),
    gap: vs(10),
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  headText: { flex: 1 },
  badge: {
    width: s(24),
    height: s(24),
    borderRadius: radius.pill,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pair: { flexDirection: 'row', gap: s(10) },
  pairItem: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(10),
    paddingVertical: vs(10),
  },
  rowText: { flex: 1, gap: vs(6) },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: s(6) },
});
