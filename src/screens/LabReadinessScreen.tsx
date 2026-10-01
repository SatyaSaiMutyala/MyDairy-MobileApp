import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
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
import { Card } from '../components/Card';
import { FooterBar } from '../components/FooterBar';
import { IconTile } from '../components/IconTile';
import { LabSections } from '../components/LabSections';
import { LocationLine } from '../components/LocationLine';
import { Notice } from '../components/Notice';
import { Pill } from '../components/Pill';
import { ProgressHeader } from '../components/ProgressHeader';
import { ReopenLog } from '../components/ReopenLog';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { Shimmer, ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import {
  dueBy,
  emptyItem,
  groupItems,
  LabItem,
  uploadFile,
  unitKinds,
} from '../lab/model';
import { useLabUnit } from '../lab/useLabUnit';
import { errorMessage, useAppDispatch, useAppSelector } from '../store';
import {
  useAddLabPhotosMutation,
  useLabStateQuery,
  useRemoveLabPhotoMutation,
  useSetLabItemMutation,
  useSetLabRemarkMutation,
} from '../store/api/labApi';
import {
  dateChosen,
  phaseChosen,
  todayIso,
  unitChosen,
} from '../store/slices/labSlice';
import { longDate, shortDate } from '../utils/dates';
import { getPosition, Point } from '../utils/location';
import { colors, radius, s, vs } from '../theme';

const REMARK_DELAY = 700;

export function LabReadinessScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { date, phase } = useAppSelector(st => st.lab);
  const {
    unit,
    units,
    loading: unitsLoading,
    error: unitsError,
  } = useLabUnit();
  const TODAY = todayIso();

  // Ask for the position once, like the website does when the board opens.
  const point = useRef<Point | null>(null);
  useEffect(() => {
    getPosition().then(p => {
      point.current = p;
    });
  }, []);

  useEffect(() => {
    if (route.params?.shift) {
      dispatch(phaseChosen(route.params.shift));
    }
  }, [route.params?.shift, dispatch]);

  const target = unit ? { unit: unit.key, date, phase } : undefined;
  const state = useLabStateQuery(target!, { skip: !target });
  const [setItem, itemCall] = useSetLabItemMutation();
  const [setRemark] = useSetLabRemarkMutation();
  const [addPhotos, photoCall] = useAddLabPhotosMutation();
  const [removePhoto] = useRemoveLabPhotoMutation();

  const { sections, items } = useMemo(
    () =>
      state.data
        ? groupItems(state.data.items)
        : { sections: [], items: {} as Record<string, LabItem> },
    [state.data],
  );

  // Remarks are typed locally and sent a moment after the person stops typing.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const editRemark = (key: string, text: string) => {
    setDrafts(d => ({ ...d, [key]: text }));
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      if (target) {
        try {
          await setRemark({ ...target, task: key, remark: text }).unwrap();
        } catch {
          // The refetched state shows what was saved; the draft stays visible.
        }
        setDrafts(d => {
          const rest = { ...d };
          delete rest[key];
          return rest;
        });
      }
    }, REMARK_DELAY);
  };
  useEffect(() => {
    setDrafts({});
  }, [target?.unit, target?.date, target?.phase]);

  const run = state.data?.run ?? null;
  const summary = state.data?.summary;
  const locked = !!run?.signed;
  const actionError = itemCall.error ?? photoCall.error;

  const stillOpen = sections
    .filter(sec => sec.complete < sec.rows.length)
    .map(sec => `${sec.title} (${sec.rows.length - sec.complete})`);

  const unitOptions = units.map(u => ({
    id: u.key,
    label: u.name,
    tag: unitKinds[u.kind]?.tag ?? u.kind,
    detail: unitKinds[u.kind]?.detail ?? u.label,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            onChange={d => dispatch(dateChosen(d || TODAY))}
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
            onChange={p => dispatch(phaseChosen(p))}
            options={[
              { key: 'opening', label: 'Opening' },
              { key: 'closing', label: 'Closing' },
            ]}
          />
        }
      >
        <View style={styles.row}>
          <Dropdown
            style={styles.unit}
            options={unitOptions}
            value={unit?.key ?? ''}
            onChange={k => dispatch(unitChosen(k))}
            renderTrigger={(u, open) => (
              <View style={styles.unitBox}>
                <View style={styles.unitText}>
                  <View style={styles.unitName}>
                    {!u && unitsLoading ? (
                      <Shimmer width="60%" height={vs(13)} onTeal />
                    ) : (
                      <AppText
                        variant="label"
                        color={colors.white}
                        numberOfLines={1}
                        style={styles.unitTitle}
                      >
                        {u?.label ?? 'Choose a unit'}
                      </AppText>
                    )}
                    {u?.tag ? <Pill label={u.tag} tone="yellow" /> : null}
                  </View>
                  <AppText
                    variant="meta"
                    color={colors.onTealSoft}
                    numberOfLines={1}
                  >
                    {u?.detail ?? ' '}
                  </AppText>
                </View>
                {open ? (
                  <ChevronUp
                    size={s(19)}
                    color={colors.white}
                    strokeWidth={2}
                  />
                ) : (
                  <ChevronDown
                    size={s(19)}
                    color={colors.white}
                    strokeWidth={2}
                  />
                )}
              </View>
            )}
          />
          <Pressable
            accessibilityLabel="History"
            onPress={() => nav.navigate('LabHistory')}
          >
            <IconTile size={44} bg={colors.tealDeep}>
              <History size={s(20)} color={colors.white} strokeWidth={1.75} />
            </IconTile>
          </Pressable>
        </View>
      </ScreenHeader>

      <ScreenScroll bottomGap={24} contentContainerStyle={styles.scroll}>
        {unitsError ? (
          <Notice
            tone="error"
            title={errorMessage(unitsError)}
            style={styles.notice}
          />
        ) : null}
        {state.error ? (
          <Notice
            tone="error"
            title={errorMessage(state.error)}
            style={styles.notice}
          />
        ) : null}
        {actionError ? (
          <Notice
            tone="error"
            title={errorMessage(actionError)}
            style={styles.notice}
          />
        ) : null}

        {summary ? (
          <>
            <ProgressHeader
              done={summary.total - summary.pending - summary.blockers.length}
              total={summary.total}
              unit="complete"
              due={dueBy[phase]}
              caption={
                run?.startedAt
                  ? `${
                      phase === 'opening' ? 'Opening time' : 'Round started'
                    } ${run.startedAt} · ${run.startedBy}`
                  : 'Not started yet'
              }
              parts={[
                { count: summary.done, color: colors.teal },
                { count: summary.dev, color: colors.amber },
                { count: summary.na, color: colors.slate },
                { count: summary.pending, color: colors.line },
              ]}
            />
            <View style={styles.legend}>
              <Stat
                size="sm"
                value={summary.done}
                label="Done"
                dot={{ color: colors.teal }}
              />
              <Stat
                size="sm"
                value={summary.dev}
                label="Deviation"
                dot={{ color: colors.amber }}
              />
              <Stat
                size="sm"
                value={summary.na}
                label="N/A"
                dot={{ color: colors.slate }}
              />
              <Stat
                size="sm"
                value={summary.pending}
                label="Open"
                dot={{ color: colors.inkFaint, hollow: true }}
              />
            </View>
            {run ? (
              <View style={styles.where}>
                <LocationLine label="Started at" point={run.location.start} />
              </View>
            ) : null}
            <ReopenLog log={run?.reopenLog ?? []} />
          </>
        ) : state.isLoading || unitsLoading ? (
          <View>
            <Shimmer width="55%" height={vs(34)} style={styles.skeletonTitle} />
            <Shimmer height={vs(10)} round />
            <Card style={styles.skeletonCard}>
              <ShimmerRows rows={5} />
            </Card>
          </View>
        ) : null}

        {target ? (
          <LabSections
            key={`${target.unit}|${target.date}|${target.phase}`}
            sections={sections}
            items={items}
            renderRow={a => {
              const item = items[a.key] ?? emptyItem;
              return (
                <ChecklistItemRow
                  key={a.key}
                  activity={a}
                  item={
                    drafts[a.key] !== undefined
                      ? { ...item, remark: drafts[a.key] }
                      : item
                  }
                  locked={locked}
                  onStatus={st =>
                    setItem({
                      ...target,
                      task: a.key,
                      status: st,
                      point: point.current,
                    })
                  }
                  onRemark={text => editRemark(a.key, text)}
                  onAddPhotos={uris =>
                    addPhotos({
                      ...target,
                      task: a.key,
                      files: uris.map(u => uploadFile(u)),
                      point: point.current,
                    })
                  }
                  onRemovePhoto={id =>
                    removePhoto({ ...target, id: Number(id) })
                  }
                />
              );
            }}
          />
        ) : null}
      </ScreenScroll>

      {summary && target ? (
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
                  {run?.signedAt} · {run?.signedBy}
                </AppText>
              </View>
              <Pressable
                hitSlop={s(10)}
                onPress={() => nav.navigate('LabReopen', target)}
              >
                <AppText variant="label" color={colors.teal}>
                  Reopen
                </AppText>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.footRow}>
                <IconTile size={36}>
                  {summary.complete ? (
                    <Check
                      size={s(18)}
                      color={colors.tealDeep}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Lock
                      size={s(17)}
                      color={colors.inkSoft}
                      strokeWidth={1.9}
                    />
                  )}
                </IconTile>
                <View style={styles.footText}>
                  <AppText variant="label">
                    {summary.complete
                      ? 'Ready to sign'
                      : summary.pending
                      ? `${summary.pending} ${
                          summary.pending === 1 ? 'item' : 'items'
                        } still open`
                      : `${summary.blockers.length} ${
                          summary.blockers.length === 1
                            ? 'item needs'
                            : 'items need'
                        } a remark or photo`}
                  </AppText>
                  <AppText
                    variant="meta"
                    color={colors.inkMuted}
                    numberOfLines={3}
                  >
                    {summary.complete
                      ? 'Take a selfie to sign off and lock this record.'
                      : summary.pending
                      ? `Complete every item to sign off. Still open: ${stillOpen.join(
                          ' · ',
                        )}`
                      : summary.blockers.join(' · ')}
                  </AppText>
                </View>
              </View>
              <Button
                label={`Sign off ${phase} checklist`}
                iconLeft={Pencil}
                disabled={!summary.complete}
                onPress={() => nav.navigate('LabSignOff', target)}
                style={styles.footBtn}
              />
            </>
          )}
        </FooterBar>
      ) : null}
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
  notice: { marginBottom: vs(10) },
  skeletonTitle: { marginTop: vs(10), marginBottom: vs(12) },
  skeletonCard: { marginTop: vs(20) },
  legend: { flexDirection: 'row', marginTop: vs(12), marginBottom: vs(6) },
  where: { marginTop: vs(8) },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: s(12) },
  footText: { flex: 1 },
  footBtn: { marginTop: vs(10) },
});
