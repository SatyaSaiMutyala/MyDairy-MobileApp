import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { UserRound } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { ChecklistItemRow } from '../components/ChecklistItemRow';
import { EmptyState } from '../components/EmptyState';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { LabSections } from '../components/LabSections';
import { LocationLine } from '../components/LocationLine';
import { Notice } from '../components/Notice';
import { PhotoViewer } from '../components/PhotoViewer';
import { ReopenLog } from '../components/ReopenLog';
import { ShimmerRows } from '../components/Shimmer';
import { Card } from '../components/Card';
import { SignerCard } from '../components/SignerCard';
import { Stat } from '../components/Stat';
import { emptyItem, groupRecordItems, LabItem } from '../lab/model';
import { errorMessage } from '../store';
import { useLabRecordQuery } from '../store/api/labApi';
import { longDate } from '../utils/dates';
import { colors, hairline, radius, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

// Read-only view of one record, opened from History.
// What this screen shows; fetched again when it comes back into view.
const FRESH = ['LabRecord'] as const;

export function LabRecordScreen() {
  const fresh = useFresh(FRESH);
  const id: number = useRoute<any>().params?.id;
  const query = useLabRecordQuery(id);
  const record = query.data;
  const [selfieOpen, setSelfieOpen] = useState(false);

  const { sections, items } = useMemo(
    () =>
      record
        ? groupRecordItems(record.items)
        : { sections: [], items: {} as Record<string, LabItem> },
    [record],
  );

  if (!record) {
    return (
      <FormScreen title="Record">
        {query.error ? (
          <Notice
            tone="error"
            title={errorMessage(query.error)}
            style={styles.notice}
          />
        ) : query.isLoading ? (
          <Card style={styles.notice}>
            <ShimmerRows rows={6} icon={false} />
          </Card>
        ) : (
          <EmptyState text="This record is no longer available." />
        )}
      </FormScreen>
    );
  }

  const opening = record.phase === 'opening';

  return (
    <FormScreen
      title={`${opening ? 'Opening' : 'Closing'} record`}
      onRefresh={fresh}
    >
      <FormCard title={`${record.unitName} · ${longDate(record.date)}`}>
        <View style={styles.stats}>
          <Stat
            size="sm"
            value={record.done}
            label="Done"
            dot={{ color: colors.teal }}
          />
          <Stat
            size="sm"
            value={record.dev}
            label="Deviation"
            dot={{ color: colors.amber }}
          />
          <Stat
            size="sm"
            value={record.na}
            label="N/A"
            dot={{ color: colors.slate }}
          />
          <Stat
            size="sm"
            value={record.items.reduce((n, it) => n + it.photos.length, 0)}
            label="Photos"
            dot={{ color: colors.blue }}
          />
        </View>
        <AppText variant="meta" color={colors.inkMuted} style={styles.line}>
          {opening ? 'Opening time' : 'Round started'} {record.startedAt} ·{' '}
          {record.startedBy}
        </AppText>
        <View style={styles.last}>
          <LocationLine label="Started at" point={record.location.start} />
          {record.signed ? (
            <LocationLine label="Signed at" point={record.location.signoff} />
          ) : null}
        </View>
      </FormCard>

      {record.signed ? (
        <FormCard title="Signed off">
          <View style={styles.signed}>
            <Pressable
              accessibilityLabel="Open selfie"
              onPress={() => setSelfieOpen(true)}
              style={styles.selfie}
            >
              {record.selfie ? (
                <Image source={{ uri: record.selfie }} style={styles.photo} />
              ) : (
                <UserRound
                  size={s(30)}
                  color={colors.inkFaint}
                  strokeWidth={1.4}
                />
              )}
            </Pressable>
            <View style={styles.signedText}>
              <SignerCard
                name={record.signedBy ?? ''}
                role={record.signedRole ?? ''}
                note={`${opening ? 'Signed' : 'Closing time'} ${
                  record.signedAt
                }`}
              />
            </View>
          </View>
          {record.declaration ? (
            <AppText variant="meta" color={colors.inkSoft} style={styles.last}>
              {record.declaration}
            </AppText>
          ) : null}
        </FormCard>
      ) : (
        <Notice
          tone="info"
          title="This record was never signed off"
          style={styles.notice}
        />
      )}
      {record.purgedAt ? (
        <Notice
          tone="info"
          title={`Photographs were purged on ${record.purgedAt}`}
          style={styles.notice}
        />
      ) : null}

      <ReopenLog log={record.reopenLog} />

      <LabSections
        onlyActioned
        sections={sections}
        items={items}
        renderRow={a => (
          <ChecklistItemRow
            key={a.key}
            activity={a}
            item={items[a.key] ?? emptyItem}
            locked
          />
        )}
      />

      <PhotoViewer
        photo={selfieOpen ? { uri: record.selfie ?? undefined } : undefined}
        caption={
          record.signed ? `${record.signedBy} · ${record.signedAt}` : undefined
        }
        onClose={() => setSelfieOpen(false)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(14) },
  stats: { flexDirection: 'row', marginBottom: vs(10) },
  line: { marginBottom: vs(2) },
  last: { marginBottom: vs(14) },
  signed: { flexDirection: 'row', gap: s(12) },
  signedText: { flex: 1 },
  selfie: {
    width: s(66),
    height: s(66),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
});
