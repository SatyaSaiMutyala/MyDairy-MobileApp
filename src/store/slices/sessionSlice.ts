import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApiUser } from '../api/authApi';

type SessionState = {
  // Not yet read from the phone's storage.
  loading: boolean;
  token: string | null;
  user: ApiUser | null;
  // Why the last session ended, shown on the sign-in screen.
  endedBecause: string | null;
};

const initialState: SessionState = {
  loading: true,
  token: null,
  user: null,
  endedBecause: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Called once at start with whatever the phone had saved.
    restored(state, action: PayloadAction<{ token: string; user: ApiUser } | null>) {
      state.loading = false;
      state.token = action.payload?.token ?? null;
      state.user = action.payload?.user ?? null;
    },
    signedIn(state, action: PayloadAction<{ token: string; user: ApiUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.endedBecause = null;
    },
    userUpdated(state, action: PayloadAction<ApiUser>) {
      state.user = action.payload;
    },
    signedOut(state) {
      state.token = null;
      state.user = null;
      state.endedBecause = null;
    },
    // The server refused the token: back to sign in with the reason.
    sessionEnded(state, action: PayloadAction<string>) {
      state.token = null;
      state.user = null;
      state.endedBecause = action.payload;
    },
  },
});

export const { restored, signedIn, userUpdated, signedOut, sessionEnded } =
  sessionSlice.actions;
export default sessionSlice.reducer;
