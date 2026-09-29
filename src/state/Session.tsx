import React, { createContext, useContext, useMemo, useState } from 'react';
import { Profile, setCurrentUser } from '../data/user';

type Session = {
  signedIn: boolean;
  signIn: (profile: Profile) => void;
  signOut: () => void;
};

const SessionContext = createContext<Session>({
  signedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const value = useMemo(
    () => ({
      signedIn,
      signIn: (profile: Profile) => {
        setCurrentUser(profile);
        setSignedIn(true);
      },
      signOut: () => setSignedIn(false),
    }),
    [signedIn],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
