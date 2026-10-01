import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { DiaryItem } from '../components/DiaryItem';
import { EmptyState } from '../components/EmptyState';
import { Eyebrow } from '../components/Eyebrow';
import { IconButton } from '../components/IconButton';
import { InviteCard } from '../components/InviteCard';
import { MonthGrid } from '../components/MonthGrid';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { SegmentedControl } from '../components/SegmentedControl';
import { WeekStrip } from '../components/WeekStrip';
import { Card } from '../components/Card';
import { Notice } from '../components/Notice';
import { ShimmerRows } from '../components/Shimmer';
import { seesAllDepartments } from '../data/user';
import { DiaryLine, toInvite } from '../diary/model';
import { useDiaryMonth } from '../diary/useDiary';
import { errorMessage } from '../store';
import {
  useDiaryInvitesInfiniteQuery,
  useRespondInviteMutation,
} from '../store/api/diaryApi';
import { pagesOf } from '../store/pages';
import {
  addDays,
  addMonths,
  longDate,
  monthTitle,
  realToday,
  sameMonth,
  shortDate,
  weekOf,
} from '../utils/dates';
import { colors, s, space, vs } from '../theme';

type View_ = 'day' | 'week' | 'month';

const PENDING = { status: 'pending' } as const;

export function DiaryScreen() {
  const nav = useNavigation<any>();
  const TODAY_ISO = realToday();
  const [view, setView] = useState<View_>('day');
  const [picked, setPicked] = useState(TODAY_ISO);

  const { lines, counts, loading, failed, error } = useDiaryMonth(picked);
  const everyone = seesAllDepartments();
  const busy = useMemo(() => new Set(Object.keys(counts)), [counts]);

  const monthCount = lines.filter(l => sameMonth(l.date, picked)).length;
  const invites = pagesOf(useDiaryInvitesInfiniteQuery(PENDING));
  const pending = useMemo(() => invites.rows.map(toInvite), [invites.rows]);
  const [respond, responding] = useRespondInviteMutation();
  const failure = failed ? error : responding.error;
  const open = (line: DiaryLine) => nav.navigate('DiaryEntry', { id: line.id });

  const step = (dir: 1 | -1) =>
    setPicked(p =>
      view === 'month'
        ? addMonths(p, dir)
        : addDays(p, view === 'week' ? 7 * dir : dir),
    );

  const list = (day: string) => {
    const rows = lines.filter(l => l.date === day);
    return rows.map((l, i) => (
      <DiaryItem
        key={l.id}
        line={l}
        last={i === rows.length - 1}
        onPress={() => open(l)}
      />
    ));
  };

  const dayRows = lines.filter(l => l.date === picked);
  const week = weekOf(picked);

  return (
    <View style={styles.root}>
      <ScreenHeader
        eyebrow={
          view === 'month'
            ? `${monthCount} ${
                monthCount === 1 ? 'entry' : 'entries'
              } this month`
            : monthTitle(picked)
        }
        title={everyone ? 'Diary · everyone' : 'My diary'}
        eyebrowAction={
          picked === TODAY_ISO ? undefined : (
            <Pressable hitSlop={s(10)} onPress={() => setPicked(TODAY_ISO)}>
              <AppText variant="metaStrong" color={colors.yellow}>
                Today
              </AppText>
            </Pressable>
          )
        }
        right={
          <SegmentedControl
            compact
            style={styles.views}
            value={view}
            onChange={setView}
            options={[
              { key: 'day', label: 'Day' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
            ]}
          />
        }
      >
        <View style={styles.strip}>
          <IconButton
            icon={ChevronLeft}
            label="Earlier"
            color={colors.white}
            size={30}
            iconSize={20}
            strokeWidth={2}
            onPress={() => step(-1)}
          />
          {view === 'month' ? (
            <AppText
              variant="label"
              color={colors.white}
              style={styles.monthName}
            >
              {monthTitle(picked)}
            </AppText>
          ) : (
            <WeekStrip
              selected={picked}
              onSelect={setPicked}
              busy={busy}
              style={styles.week}
            />
          )}
          <IconButton
            icon={ChevronRight}
            label="Later"
            color={colors.white}
            size={30}
            iconSize={20}
            strokeWidth={2}
            onPress={() => step(1)}
          />
        </View>
      </ScreenHeader>

      <ScreenScroll bottomGap={90} onEndReached={invites.loadMore}>
        {view === 'month' ? (
          <View style={styles.month}>
            <MonthGrid
              month={picked}
              selected={picked}
              onSelect={setPicked}
              counts={counts}
            />
          </View>
        ) : null}

        {pending.length ? (
          <>
            <Eyebrow label={`Invitations · ${invites.total} waiting`} />
            {pending.map(inv => (
              <InviteCard
                key={inv.id}
                invite={inv}
                busy={responding.isLoading}
                onOpen={() => nav.navigate('DiaryEntry', { id: inv.entryId })}
                onRespond={response => respond({ inviteId: inv.id, response })}
              />
            ))}
          </>
        ) : null}

        {failure ? (
          <Notice
            tone="error"
            title={errorMessage(failure)}
            style={styles.notice}
          />
        ) : null}

        {loading ? (
          <Card style={styles.notice}>
            <ShimmerRows rows={4} icon={false} lines={2} />
          </Card>
        ) : failed ? null : view === 'week' ? (
          week.map(day => {
            const rows = lines.filter(l => l.date === day);
            return (
              <View key={day}>
                <Eyebrow
                  label={`${shortDate(day)}${
                    day === TODAY_ISO ? ' · today' : ''
                  }`}
                />
                {rows.length ? (
                  list(day)
                ) : (
                  <AppText variant="meta" color={colors.inkFaint}>
                    Nothing planned
                  </AppText>
                )}
              </View>
            );
          })
        ) : (
          <>
            <Eyebrow
              label={`${longDate(picked)} · ${dayRows.length} ${
                dayRows.length === 1 ? 'entry' : 'entries'
              }`}
            />
            {dayRows.length ? (
              list(picked)
            ) : (
              <EmptyState text="Nothing written for this day." />
            )}
          </>
        )}
      </ScreenScroll>

      <Button
        label="Write entry"
        iconLeft={Pencil}
        accessibilityLabel="Write diary entry"
        onPress={() => nav.navigate('DiaryEntryForm', { date: picked })}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  views: { width: s(168) },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -s(8),
  },
  week: { flex: 1 },
  monthName: { flex: 1, textAlign: 'center' },
  month: { marginTop: vs(16) },
  notice: { marginTop: vs(14) },
  fab: { position: 'absolute', right: space.gutter, bottom: vs(16) },
});
