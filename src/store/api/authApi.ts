import { baseApi } from './baseApi';

// The signed-in person, exactly as the API describes them.
export type ApiUser = {
  id: number;
  name: string;
  initials: string;
  email: string;
  emp_id: string | null;
  designation: string | null;
  dept: string;
  dept_name: string;
  location: string | null;
  role: 'user' | 'admin' | 'super_admin';
  role_label: string;
  sees_all: boolean;
  // Lab Readiness is shown only to people who work with the lab.
  lab: boolean;
  active: boolean;
};

type LoginBody = { email: string; password: string; device_name?: string };
type LoginReply = {
  ok: true;
  token: string;
  token_type: string;
  user: ApiUser;
};
type PasswordBody = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

// Switches set on the server (.env MOBILE_SHOW_*), read before sign-in.
export type AppConfig = {
  ok: true;
  showSignUp: boolean;
  showDeleteAccount: boolean;
  // Builds older than this must update; null = no minimum.
  minVersion: { android: string | null; ios: string | null };
  // The numeric App Store id, for the update link on iPhone.
  iosAppId: string | null;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    appConfig: build.query<AppConfig, void>({
      query: () => 'app/config',
      keepUnusedDataFor: 3600,
    }),
    login: build.mutation<LoginReply, LoginBody>({
      query: body => ({ url: 'auth/login', method: 'POST', body }),
    }),
    logout: build.mutation<{ ok: true }, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
    }),
    me: build.query<{ ok: true; user: ApiUser }, void>({
      query: () => 'me',
      providesTags: ['Me'],
    }),
    changePassword: build.mutation<{ ok: true }, PasswordBody>({
      query: body => ({ url: 'me/password', method: 'POST', body }),
    }),
    // Closes the signed-in person's own account.
    deleteAccount: build.mutation<
      { ok: true; message: string },
      { password: string; reason?: string }
    >({
      query: body => ({ url: 'me/delete', method: 'POST', body }),
    }),
  }),
});

export const {
  useAppConfigQuery,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = authApi;
