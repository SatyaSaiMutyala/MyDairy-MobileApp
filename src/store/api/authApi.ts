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

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
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
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useChangePasswordMutation,
} = authApi;
