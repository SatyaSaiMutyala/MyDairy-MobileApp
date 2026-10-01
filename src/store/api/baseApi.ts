import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL, API_TIMEOUT } from '../../config';
import type { RootState } from '../store';
import { sessionEnded } from '../slices/sessionSlice';

// The shape every API error comes back in.
export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

const NO_NETWORK = 'No internet connection. Check your network and try again.';
const TIMED_OUT = 'The server took too long to answer. Please try again.';
const BAD_REPLY = 'The server sent an answer the app could not read.';

const rawQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT * 1000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Turns every failure into {status, message} so screens can show the
// message as it is. The API's own message always wins; the app only writes
// its own words when there was no reply at all.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extra,
) => {
  const result = await rawQuery(args, api, extra);
  if (!result.error) {
    return { data: result.data };
  }
  const e = result.error as FetchBaseQueryError;
  let error: ApiError;
  if (e.status === 'FETCH_ERROR') {
    error = { status: 0, message: NO_NETWORK };
  } else if (e.status === 'TIMEOUT_ERROR') {
    error = { status: 0, message: TIMED_OUT };
  } else if (e.status === 'PARSING_ERROR') {
    error = { status: e.originalStatus, message: BAD_REPLY };
  } else if (e.status === 'CUSTOM_ERROR') {
    error = { status: 0, message: e.error || BAD_REPLY };
  } else {
    const body = (e.data ?? {}) as Partial<ApiError>;
    error = {
      status: e.status,
      message: body.message || `Request failed (${e.status}).`,
      errors: body.errors,
    };
  }
  // A dead token sends the person back to the sign-in screen.
  if (error.status === 401 && (api.getState() as RootState).session.token) {
    api.dispatch(sessionEnded(error.message));
  }
  return { error };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me'],
  endpoints: () => ({}),
});

// Reads the message out of whatever RTK Query hands back.
export const errorMessage = (e: unknown, fallback = 'Something went wrong.') =>
  (e as ApiError | undefined)?.message ?? fallback;

export const fieldErrors = (e: unknown): Record<string, string | undefined> => {
  const errors = (e as ApiError | undefined)?.errors ?? {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
};
