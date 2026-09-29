import React, { useState } from 'react';
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
import { SignerCard } from '../components/SignerCard';
import { Stat } from '../components/Stat';
import { dateLabel, declarations, Phase, units } from '../data/labReadiness';
import { itemOf, recordKey, summarise, useLab } from '../state/LabStore';
import { colors, hairline, radius, s, vs } from '../theme';

// Read-only view of one record, opened from History.
export function LabRecordScreen() {
  const { unitId, date, phase } = useRoute<any>().params as {
    unitId: string;
    date: string;
    phase: Phase;
  };
  const record = useLab().records[recordKey(unitId, date, phase)];
  const unit = units.find(u => u.id === unitId);
  const [selfieOpen, setSelfieOpen] = useState(false);

  if (!record) {
    return (
      <FormScreen title="Record">
        <EmptyState text="This record is no longer available." />
      </FormScreen>
    );
  }

  const totals = summarise(phase, record);
  const opening = phase === 'opening';

  return (
    <FormScreen title={`${opening ? 'Opening' : 'Closing'} record`}>
      <FormCard title={`${unit?.name} · ${dateLabel(date)}`}>
        <View style={styles.stats}>
          <Stat size="sm" value={totals.chosen.done} label="Done" dot={{ color: colors.teal }} />
          <Stat size="sm" value={totals.chosen.deviation} label="Deviation" dot={{ color: colors.amber }} />
          <Stat size="sm" value={totals.chosen.na} label="N/A" dot={{ color: colors.slate }} />
          <Stat size="sm" value={totals.photos} label="Photos" dot={{ color: colors.blue }} />
        </View>
        <AppText variant="meta" color={colors.inkMuted} style={styles.line}>
          {opening ? 'Opening time' : 'Round started'} {record.startedAt} ·{' '}
          {record.startedBy}
        </AppText>
        <View style={styles.last}>
          <LocationLine label="Started at" point={record.startPoint} />
          {record.signed ? (
            <LocationLine label="Signed at" point={record.signed.point} />
          ) : null}
        </View>
      </FormCard>

      {record.signed ? (
        <FormCard title="Signed off">
          <View style={styles.signed}>
            <Pressable
              accessibilityLabel="Open selfie"
              onPress={() => setSelfieOpen(true)}
              style={styles.selfie}>
              {record.signed.selfie ? (
                <Image source={{ uri: record.signed.selfie }} style={styles.photo} />
              ) : (
                <UserRound size={s(30)} color={colors.inkFaint} strokeWidth={1.4} />
              )}
            </Pressable>
            <View style={styles.signedText}>
              <SignerCard
                name={record.signed.by}
                role={record.signed.role}
                note={`${opening ? 'Signed' : 'Closing time'} ${record.signed.at}`}
              />
            </View>
          </View>
          <AppText variant="meta" color={colors.inkSoft} style={styles.last}>
            {declarations[phase]}
          </AppText>
        </FormCard>
      ) : (
        <Notice
          tone="info"
          title="This record was never signed off"
          style={styles.notice}
        />
      )}

      <ReopenLog log={record.reopenLog} />

      <LabSections
        onlyActioned
        sections={totals.sections}
        record={record}
        renderRow={a => (
          <ChecklistItemRow
            key={a.key}
            activity={a}
            item={itemOf(record, a.key)}
            locked
          />
        )}
      />

      <PhotoViewer
        photo={selfieOpen ? { uri: record.signed?.selfie } : undefined}
        caption={record.signed ? `${record.signed.by} · ${record.signed.at}` : undefined}
        onClose={() => setSelfieOpen(false)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
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
  notice: { marginTop: vs(14) },
});
