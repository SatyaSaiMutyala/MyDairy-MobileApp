import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ClipboardList,
  FileText,
  KeyRound,
  LogOut,
  MapPin,
  Bell,
  Users,
  MessageCircle,
  FolderKanban,
  TriangleAlert,
} from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { CardList } from '../components/CardList';
import { Eyebrow } from '../components/Eyebrow';
import { signOutIcon, useConfirm } from '../components/ConfirmDialog';
import { MenuItem, MenuRow } from '../components/MenuRow';
import { Pill } from '../components/Pill';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { currentUser } from '../data/user';
import { useAlertList } from '../alerts/useAlertList';
import { useAppDispatch } from '../store';
import { lastPushToken } from '../push/usePush';
import { useLogoutMutation } from '../store/api/authApi';
import { useForgetDeviceMutation } from '../store/api/notificationsApi';
import { signedOut } from '../store/slices/sessionSlice';
import { colors, radius, s, vs } from '../theme';
import { useFresh } from '../store/useFresh';

type Link = MenuItem & { to: string };

const work: Link[] = [
  {
    to: 'Notifications',
    icon: Bell,
    title: 'Notifications',
    detail: 'What needs you: tasks, alerts, invitations',
  },
  {
    to: 'Alerts',
    icon: TriangleAlert,
    title: 'Alerts',
    detail: 'Raise, follow and close alerts',
  },
  {
    to: 'PreOps',
    icon: ClipboardList,
    title: 'Pre-operations checklist',
    detail: 'Checks before the day begins',
  },
  {
    to: 'DailyReport',
    icon: FileText,
    title: 'Daily report',
    detail: 'End-of-day summary for your unit',
  },
  {
    to: 'Visits',
    icon: MapPin,
    title: 'Visit observations',
    detail: 'Notes and photos from site visits',
  },
  {
    to: 'Meetings',
    icon: Users,
    title: 'My meetings',
    detail: 'Plan, take minutes, follow up actions',
  },
  {
    to: 'Discussions',
    icon: MessageCircle,
    title: 'Discussion logs',
    detail: 'Calls, chats and corridor talks, in one line',
  },
  {
    to: 'Projects',
    icon: FolderKanban,
    title: 'Projects',
    detail: 'Milestones, owners and progress',
  },
];

const account: Link[] = [
  {
    to: 'ChangePassword',
    icon: KeyRound,
    title: 'Change password',
    detail: 'Update your sign-in password',
  },
];

const signOutItem: MenuItem = {
  icon: LogOut,
  title: 'Sign out',
  detail: 'End your shift on this phone',
};

const OPEN_ALERTS = { status: 'open' } as const;

// What this screen shows; fetched again when it comes back into view.
const FRESH = ['Alerts', 'Notices'] as const;

export function MoreScreen() {
  const fresh = useFresh(FRESH);
  const nav = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const [forgetDevice] = useForgetDeviceMutation();
  const confirm = useConfirm();
  // Tell the server to forget the token, then leave. Leaving does not wait
  // for the server: a dead token is dropped there anyway.
  const signOut = async () => {
    const yes = await confirm({
      title: 'Sign out of Trust Diary?',
      text: 'You will need your email and password to sign in again.',
      confirmLabel: 'Sign out',
      cancelLabel: 'Stay',
      tone: 'danger',
      icon: signOutIcon,
    });
    if (yes) {
      // Stop pushes to this phone before the token is dropped.
      const address = lastPushToken();
      if (address) {
        await forgetDevice(address)
          .unwrap()
          .catch(() => {});
      }
      logout();
      dispatch(signedOut());
    }
  };
  const openAlerts = useAlertList(OPEN_ALERTS).counts?.open ?? 0;

  return (
    <View style={styles.root}>
      <ScreenHeader eyebrow={currentUser.email} title="More">
        <View style={styles.profile}>
          <Avatar label={currentUser.initials} size={38} />
          <View style={styles.profileText}>
            <View style={styles.nameRow}>
              <AppText variant="label" color={colors.white}>
                {currentUser.name}
              </AppText>
              <Pill label={currentUser.roleLabel} tone="yellow" />
            </View>
            <AppText variant="meta" color={colors.onTealSoft} numberOfLines={1}>
              {currentUser.role} · {currentUser.department}
            </AppText>
          </View>
        </View>
      </ScreenHeader>

      <ScreenScroll onRefresh={fresh}>
        <Eyebrow label="Daily work" />
        <CardList inset={52}>
          {work.map(item => (
            <MenuRow
              key={item.title}
              item={
                item.to === 'Alerts' ? { ...item, count: openAlerts } : item
              }
              onPress={() => nav.navigate(item.to)}
            />
          ))}
        </CardList>

        <Eyebrow label="Account" />
        <CardList inset={52}>
          {account.map(item => (
            <MenuRow
              key={item.title}
              item={item}
              onPress={() => nav.navigate(item.to)}
            />
          ))}
          <MenuRow item={signOutItem} danger onPress={signOut} />
        </CardList>

        <AppText variant="meta" color={colors.inkFaint} style={styles.version}>
          Trust Diary 0.1 · TrustLab Diagnostics Pvt. Ltd.
        </AppText>
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    height: vs(52),
    paddingHorizontal: s(10),
    borderRadius: radius.md,
    backgroundColor: colors.tealDeep,
  },
  profileText: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    flexWrap: 'wrap',
  },
  version: { textAlign: 'center', marginTop: vs(26) },
});
