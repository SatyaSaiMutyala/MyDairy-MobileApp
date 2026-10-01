import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch } from '../store';
import { baseApi } from '../store/api/baseApi';
import { notificationsApi } from '../store/api/notificationsApi';
import { listenForPushes, pushToken } from './index';

let current: string | null = null;

// The address last given to the server, so sign-out can take it back.
export const lastPushToken = () => current;

// Runs while someone is signed in: gives the server this phone's push
// address, and keeps the bell fresh when a push arrives.
export function usePush() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const register = (token: string) => {
      current = token;
      dispatch(
        notificationsApi.endpoints.registerDevice.initiate({
          token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        }),
      );
    };

    pushToken().then(token => token && register(token));
    return listenForPushes({
      onArrive: () =>
        dispatch(baseApi.util.invalidateTags(['Notices' as never])),
      onNewToken: register,
    });
  }, [dispatch]);
}
