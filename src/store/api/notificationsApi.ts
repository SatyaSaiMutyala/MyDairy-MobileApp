import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Shapes exactly as the API sends them.

export type NoticeLink = {
  type:
    | 'task'
    | 'alert'
    | 'diary'
    | 'visit'
    | 'lab'
    | 'preops'
    | 'report'
    | 'meeting'
    | 'discussion'
    | 'project'
    | 'activity';
  id: number | string;
};

export type ApiNotice = {
  id: string;
  // What happened, e.g. 'task.escalated'.
  kind: string;
  title: string;
  body: string | null;
  // What a tap opens.
  link: NoticeLink | null;
  actor: string | null;
  read: boolean;
  at: string | null;
};

export type NoticePage = { data: ApiNotice[]; meta: PageMeta; unread: number };

export const notificationsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Notices'] })
  .injectEndpoints({
    endpoints: build => ({
      notifications: build.infiniteQuery<NoticePage, { unread?: 1 }, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'notifications',
          params: { ...queryArg, page: pageParam, per_page: 20 },
        }),
        providesTags: ['Notices'],
      }),
      // The number on the bell.
      unreadCount: build.query<number, void>({
        query: () => 'notifications/unread-count',
        transformResponse: (r: { unread: number }) => r.unread,
        providesTags: ['Notices'],
      }),
      readNotification: build.mutation<{ unread: number }, string>({
        query: id => ({ url: `notifications/${id}/read`, method: 'POST' }),
        invalidatesTags: ['Notices'],
      }),
      // This phone's push address: given after sign-in, taken back at sign-out.
      registerDevice: build.mutation<
        { ok: true },
        { token: string; platform: 'android' | 'ios'; device_name?: string }
      >({
        query: body => ({ url: 'devices', method: 'POST', body }),
      }),
      forgetDevice: build.mutation<{ ok: true }, string>({
        query: token => ({ url: 'devices', method: 'DELETE', body: { token } }),
      }),
      readAllNotifications: build.mutation<{ unread: number }, void>({
        query: () => ({ url: 'notifications/read-all', method: 'POST' }),
        invalidatesTags: ['Notices'],
      }),
    }),
  });

export const {
  useNotificationsInfiniteQuery,
  useUnreadCountQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
  useForgetDeviceMutation,
} = notificationsApi;
