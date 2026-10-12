import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { FilterChips } from '../components/FilterChips';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { ReminderRow } from '../components/ReminderRow';
import { SearchField } from '../components/SearchField';
import { ShimmerRows } from '../components/Shimmer';
import { Stat } from '../components/Stat';
import { errorMessage } from '../store';
import {
  ReminderBox,
  ReminderFilters,
  REMINDERS_PER_PAGE,
  useRemindersInfiniteQuery,
} from '../store/api/remindersApi';
import { pagesOf } from '../store/pages';
import { useFresh } from '../store/useFresh';
import { useDebounced } from '../utils/useDebounced';
import { colors, hairline, s, vs } from '../theme';

const FRESH = ['Reminders'] as const;

export function RemindersScreen() {
  const nav = useNavigation<any>();
  const fresh = useFresh(FRESH);
  const [box, setBox] = useState<ReminderBox>('upcoming');
  const [search, setSearch] = useState('');

  // Every filter travels to the server as its own query parameter.
  const term = useDebounced(search.trim());
  const filters = useMemo<ReminderFilters>(
    () => ({ box, ...(term ? { search: term } : null) }),
    [box, term],
  );
  const query = useRemindersInfiniteQuery(filters);
  const list = pagesOf(query);
  const counts = query.currentData?.pages[0]?.counts;

  return (
    <FormScreen
      title="Reminders"
      onEndReached={list.loadMore}
      onRefresh={fresh}
      footer={
        <Button
          label="Set a reminder"
          iconLeft={Plus}
          onPress={() => nav.navigate('ReminderForm')}
        />
      }
    >
      <Card style={styles.summary}>
        <Stat value={counts?.upcoming ?? '–'} label="Upcoming" style={styles.stat} />
        <View style={styles.rule} />
        <Stat
          value={counts?.forMe ?? '–'}
          label="For me"
          tone={counts?.forMe ? colors.tealDeep : colors.ink}
          style={styles.stat}
        />
        <View style={styles.rule} />
        <Stat value={counts?.sent ?? '–'} label="Sent" style={styles.stat} />
      </Card>

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Search reminders and people"
        style={styles.search}
      />
      <View style={styles.chips}>
        <FilterChips
          value={box}
          onChange={setBox}
          options={[
            { key: 'upcoming', label: 'Upcoming', count: counts?.upcoming },
            { key: 'sent', label: 'Sent', count: counts?.sent },
            { key: 'all', label: 'All' },
          ]}
        />
      </View>

      <View style={styles.list}>
        {list.failed ? (
          <Notice tone="error" title={errorMessage(list.error)} style={styles.gap} />
        ) : null}
        {list.firstLoad ? (
          <Card>
            <ShimmerRows rows={4} icon={false} />
          </Card>
        ) : list.rows.length ? (
          list.rows.map(r => (
            <ReminderRow
              key={r.id}
              reminder={r}
              onPress={() => nav.navigate('ReminderDetail', { id: r.id })}
            />
          ))
        ) : list.failed ? null : (
          <EmptyState
            text={
              term
                ? 'No reminders match.'
                : box === 'sent'
                ? 'Nothing has been sent yet.'
                : 'No reminders coming up. Set one for yourself or a colleague.'
            }
          />
        )}
        {list.loadingMore ? (
          <Card>
            <ShimmerRows rows={2} icon={false} />
          </Card>
        ) : null}
        {list.rows.length && !list.hasMore && list.total > REMINDERS_PER_PAGE ? (
          <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
            That is all {list.total} reminders.
          </AppText>
        ) : null}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', marginTop: vs(12) },
  stat: { paddingHorizontal: s(14), paddingVertical: vs(9) },
  rule: { width: hairline, backgroundColor: colors.line },
  search: { marginTop: vs(12) },
  chips: { marginTop: vs(10) },
  list: { marginTop: vs(12) },
  gap: { marginBottom: vs(12) },
  end: { textAlign: 'center', marginTop: vs(16) },
});
