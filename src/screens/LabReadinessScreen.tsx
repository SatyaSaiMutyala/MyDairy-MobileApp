import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Check,
  ChevronDown,
  ChevronUp,
  History,
  Lock,
  Pencil,
} from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ChecklistItemRow } from '../components/ChecklistItemRow';
import { DateField } from '../components/DateField';
import { Dropdown } from '../components/Dropdown';
import { FooterBar } from '../components/FooterBar';
import { IconTile } from '../components/IconTile';
import { LabSections } from '../components/LabSections';
import { LocationLine } from '../components/LocationLine';
import { Pill } from '../components/Pill';
import { ProgressHeader } from '../components/ProgressHeader';
import { ReopenLog } from '../components/ReopenLog';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { Stat } from '../components/Stat';
import {
  dueBy,
  HOME_UNIT,
  Phase,
  TODAY,
  unitOptions,
} from '../data/labReadiness';
import { itemOf, recordKey, summarise, useLab } from '../state/LabStore';
import { longDate, shortDate } from '../utils/dates';
import { getPosition } from '../utils/location';
import { colors, radius, s, vs } from '../theme';

export function LabReadinessScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const lab = useLab();

  const [phase, setPhase] = useState<Phase>('opening');
  const [unitId, setUnitId] = useState(HOME_UNIT);
  const [date, setDate] = useState(TODAY);

  // Ask for the position once, like the website does when the board opens.
  const { setPosition } = lab;
  useEffect(() => {
    getPosition().then(setPosition);
  }, [setPosition]);

  useEffect(() => {
    if (route.params?.shift) {
      setPhase(route.params.shift);
    }
  }, [route.params?.shift]);

  const record = lab.records[recordKey(unitId, date, phase)];
  const totals = summarise(phase, record);
  const locked = !!record?.signed;
  const target = { unitId, date, phase };

  const stillOpen = totals.sections
    .filter(sec => sec.complete < sec.rows.length)
    .map(sec => `${sec.title} (${sec.rows.length - sec.complete})`);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        eyebrow={
          date === TODAY
            ? `Today, ${shortDate(date).slice(5)}`
            : date.slice(0, 4) === TODAY.slice(0, 4)
            ? shortDate(date)
            : longDate(date)
        }
        title="Lab readiness"
        eyebrowAction={
          <DateField
            value={date}
            onChange={d => setDate(d || TODAY)}
            renderTrigger={() => (
              <AppText variant="metaStrong" color={colors.yellow}>
                Change
              </AppText>
            )}
          />
        }
        right={
          <SegmentedControl
            compact
            style={styles.phases}
            value={phase}
            onChange={setPhase}
            options={[
              { key: 'opening', label: 'Opening' },
              { key: 'closing', label: 'Closing' },
            ]}
          />
        }>
        <View style={styles.row}>
          <Dropdown
            style={styles.unit}
            options={unitOptions}
            value={unitId}
            onChange={setUnitId}
            renderTrigger={(unit, open) => (
              <View style={styles.unitBox}>
                <View style={styles.unitText}>
                  <View style={styles.unitName}>
                    <AppText
                      variant="label"
                      color={colors.white}
                      numberOfLines={1}
                      style={styles.unitTitle}>
                      {unit?.label}
                    </AppText>
                    {unit?.tag ? <Pill label={unit.tag} tone="yellow" /> : null}
                  </View>
                  <AppText variant="meta" color={colors.onTealSoft} numberOfLines={1}>
                    {unit?.detail}
                  </AppText>
                </View>
                {open ? (
                  <ChevronUp size={s(19)} color={colors.white} strokeWidth={2} />
                ) : (
                  <ChevronDown size={s(19)} color={colors.white} strokeWidth={2} />
                )}
              </View>
            )}
          />
          <Pressable
            accessibilityLabel="History"
            onPress={() => nav.navigate('LabHistory')}>
            <IconTile size={44} bg={colors.tealDeep}>
              <History size={s(20)} color={colors.white} strokeWidth={1.75} />
            </IconTile>
          </Pressable>
        </View>
      </ScreenHeader>

      <ScreenScroll bottomGap={24} contentContainerStyle={styles.scroll}>
        <ProgressHeader
          done={totals.complete}
          total={totals.total}
          unit="complete"
          due={dueBy[phase]}
          caption={
            record?.startedAt
              ? `${phase === 'opening' ? 'Opening time' : 'Round started'} ${
                  record.startedAt
                } · ${record.startedBy}`
              : 'Not started yet'
          }
          parts={[
            { count: totals.done, color: colors.teal },
            { count: totals.deviation, color: colors.amber },
            { count: totals.na, color: colors.slate },
            { count: totals.open, color: colors.line },
          ]}
        />

        <View style={styles.legend}>
          <Stat size="sm" value={totals.done} label="Done" dot={{ color: colors.teal }} />
          <Stat size="sm" value={totals.deviation} label="Deviation" dot={{ color: colors.amber }} />
          <Stat size="sm" value={totals.na} label="N/A" dot={{ color: colors.slate }} />
          <Stat size="sm" value={totals.open} label="Open" dot={{ color: colors.inkFaint, hollow: true }} />
        </View>

        {record ? (
          <View style={styles.where}>
            <LocationLine label="Started at" point={record.startPoint} />
          </View>
        ) : null}

        <ReopenLog log={record?.reopenLog ?? []} />

        <LabSections
          key={recordKey(unitId, date, phase)}
          sections={totals.sections}
          record={record}
          renderRow={a => (
            <ChecklistItemRow
              key={a.key}
              activity={a}
              item={itemOf(record, a.key)}
              locked={locked}
              onStatus={st => lab.setStatus(unitId, date, phase, a.key, st)}
              onRemark={text => lab.setRemark(unitId, date, phase, a.key, text)}
              onAddPhotos={uris => lab.addPhotos(unitId, date, phase, a.key, uris)}
              onRemovePhoto={id => lab.removePhoto(unitId, date, phase, a.key, id)}
            />
          )}
        />
      </ScreenScroll>

      <FooterBar inTabs>
        {locked ? (
          <View style={styles.footRow}>
            <IconTile size={36} bg={colors.teal}>
              <Check size={s(18)} color={colors.white} strokeWidth={2.75} />
            </IconTile>
            <View style={styles.footText}>
              <AppText variant="label">
                {phase === 'opening' ? 'Opening' : 'Closing'} checklist signed
              </AppText>
              <AppText variant="meta" color={colors.inkMuted}>
                {record.signed!.at} · {record.signed!.by}
              </AppText>
            </View>
            <Pressable hitSlop={s(10)} onPress={() => nav.navigate('LabReopen', target)}>
              <AppText variant="label" color={colors.teal}>
                Reopen
              </AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.footRow}>
              <IconTile size={36}>
                {totals.open ? (
                  <Lock size={s(17)} color={colors.inkSoft} strokeWidth={1.9} />
                ) : (
                  <Check size={s(18)} color={colors.tealDeep} strokeWidth={2.5} />
                )}
              </IconTile>
              <View style={styles.footText}>
                <AppText variant="label">
                  {totals.open
                    ? `${totals.open} ${totals.open === 1 ? 'item' : 'items'} still open`
                    : 'Ready to sign'}
                </AppText>
                <AppText variant="meta" color={colors.inkMuted} numberOfLines={3}>
                  {totals.open
                    ? `Complete every item to sign off. Still open: ${stillOpen.join(' · ')}`
                    : 'Take a selfie to sign off and lock this record.'}
                </AppText>
              </View>
            </View>
            <Button
              label={`Sign off ${phase} checklist`}
              iconLeft={Pencil}
              disabled={totals.open > 0}
              onPress={() => nav.navigate('LabSignOff', target)}
              style={styles.footBtn}
            />
          </>
        )}
      </FooterBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  phases: { width: s(156) },
  scroll: { paddingTop: vs(6) },
  row: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  unit: { flex: 1 },
  unitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    height: vs(52),
    paddingHorizontal: s(12),
    borderRadius: radius.md,
    backgroundColor: colors.tealDeep,
  },
  unitText: { flex: 1 },
  unitName: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  unitTitle: { flexShrink: 1 },
  legend: { flexDirection: 'row', marginTop: vs(12), marginBottom: vs(6) },
  where: { marginTop: vs(8) },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  footText: { flex: 1 },
  footBtn: { marginTop: vs(10) },
});
