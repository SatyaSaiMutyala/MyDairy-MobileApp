import { AppState } from 'react-native';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { setCurrentUser, profileFrom } from '../data/user';
import { baseApi } from './api/baseApi';
import { saveSession } from './persist';
import labReducer from './slices/labSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    lab: labReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: getDefault => getDefault().concat(baseApi.middleware),
});

// Tell the API cache when the app comes back to the front, so what is on
// screen is fetched again (refetchOnFocus in baseApi).
setupListeners(store.dispatch, (dispatch, actions) => {
  const sub = AppState.addEventListener('change', state => {
    dispatch(state === 'active' ? actions.onFocus() : actions.onFocusLost());
  });
  return () => sub.remove();
});

// Keep the phone's storage and the legacy `currentUser` object in step with
// the session. `currentUser` goes away once every module reads from the store.
let lastToken: string | null | undefined;
store.subscribe(() => {
  const { token, user, loading } = store.getState().session;
  if (loading || token === lastToken) {
    return;
  }
  lastToken = token;
  if (token && user) {
    setCurrentUser(profileFrom(user));
    saveSession({ token, user });
  } else {
    saveSession(null);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
