import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { CardList } from '../components/CardList';
import { EmptyState } from '../components/EmptyState';
import { FilterChips } from '../components/FilterChips';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { NotificationRow } from '../components/NotificationRow';
import { ShimmerRows } from '../components/Shimmer';
import { errorMessage } from '../store';
import {
  ApiNotice,
  useNotificationsInfiniteQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from '../store/api/notificationsApi';
import { pagesOf } from '../store/pages';
import { colors, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

type Show = 'all' | 'unread';

const ALL = {};
const UNREAD = { unread: 1 } as const;

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Notices'] as const;

export function NotificationsScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const [show, setShow] = useState<Show>('all');
  const query = useNotificationsInfiniteQuery(show === 'unread' ? UNREAD : ALL);
  const list = pagesOf(query);
  const unread = query.currentData?.pages[0]?.unread;
  const [read] = useReadNotificationMutation();
  const [readAll, readingAll] = useReadAllNotificationsMutation();

  // A tap marks it read and opens what it is about.
  const open = (n: ApiNotice) => {
    if (!n.read) {
      read(n.id);
    }
    const link = n.link;
    if (!link) {
      return;
    }
    switch (link.type) {
      case 'task':
        return nav.navigate('TaskDetail', { id: Number(link.id) });
      case 'diary':
        return nav.navigate('DiaryEntry', { id: Number(link.id) });
      case 'visit':
        return nav.navigate('VisitDetail', { id: Number(link.id) });
      case 'lab':
        return nav.navigate('LabRecord', { id: Number(link.id) });
      case 'alert':
        return nav.navigate('Alerts');
      case 'preops':
        return nav.navigate('PreOps', { dept: String(link.id) });
      case 'meeting':
        return nav.navigate('MeetingDetail', { id: Number(link.id) });
      case 'discussion':
        return nav.navigate('DiscussionDetail', { id: Number(link.id) });
      case 'project':
        return nav.navigate('ProjectDetail', { id: Number(link.id) });
      case 'report':
        return nav.navigate('DailyReport', { dept: String(link.id) });
      case 'activity':
        return nav.navigate('Tabs', {
          screen: 'Activity',
          params: { date: String(link.id) },
        });
    }
  };

  const failure = list.failed ? list.error : readingAll.error;
  const rows = useMemo(() => list.rows, [list.rows]);

  return (
    <FormScreen
      title="Notifications"
      onRefresh={fresh}
      onEndReached={list.loadMore}
      right={
        unread ? (
          <Pressable
            hitSlop={s(10)}
            disabled={readingAll.isLoading}
            onPress={() => readAll()}
            style={styles.readAll}
          >
            <AppText variant="metaStrong" color={colors.teal}>
              Mark all read
            </AppText>
          </Pressable>
        ) : undefined
      }
    >
      <View style={styles.chips}>
        <FilterChips
          value={show}
          onChange={setShow}
          options={[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread', count: unread, alert: true },
          ]}
        />
      </View>

      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.list}
        />
      ) : null}

      {list.firstLoad ? (
        <Card style={styles.list}>
          <ShimmerRows rows={6} lines={2} />
        </Card>
      ) : rows.length ? (
        <CardList inset={50} style={styles.list}>
          {rows.map(n => (
            <NotificationRow key={n.id} notice={n} onPress={() => open(n)} />
          ))}
        </CardList>
      ) : list.failed ? null : (
        <EmptyState
          text={
            show === 'unread'
              ? 'You are all caught up.'
              : 'Nothing yet. You will see it here when something needs you.'
          }
        />
      )}

      {list.loadingMore ? (
        <Card style={styles.list}>
          <ShimmerRows rows={2} lines={2} />
        </Card>
      ) : null}
      {rows.length && !list.hasMore && list.total > 20 ? (
        <AppText variant="meta" color={colors.inkFaint} style={styles.end}>
          That is all {list.total} notifications.
        </AppText>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  readAll: { paddingHorizontal: s(6) },
  chips: { marginTop: vs(6) },
  list: { marginTop: vs(10) },
  end: { textAlign: 'center', marginTop: vs(16) },
});
