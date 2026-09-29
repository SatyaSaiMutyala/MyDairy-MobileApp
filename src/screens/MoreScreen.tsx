import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ClipboardList,
  FileText,
  KeyRound,
  LogOut,
  MapPin,
  TriangleAlert,
} from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { CardList } from '../components/CardList';
import { Eyebrow } from '../components/Eyebrow';
import { MenuItem, MenuRow } from '../components/MenuRow';
import { Pill } from '../components/Pill';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenScroll } from '../components/ScreenScroll';
import { currentUser } from '../data/user';
import { useStore } from '../state/Store';
import { useSession } from '../state/Session';
import { colors, radius, s, vs } from '../theme';

type Link = MenuItem & { to: string };

const work: Link[] = [
  { to: 'Alerts', icon: TriangleAlert, title: 'Alerts', detail: 'Raise, follow and close alerts' },
  { to: 'PreOps', icon: ClipboardList, title: 'Pre-operations checklist', detail: 'Checks before the day begins' },
  { to: 'DailyReport', icon: FileText, title: 'Daily report', detail: 'End-of-day summary for your unit' },
  { to: 'Visits', icon: MapPin, title: 'Visit observations', detail: 'Notes and photos from site visits' },
];

const account: Link[] = [
  { to: 'ChangePassword', icon: KeyRound, title: 'Change password', detail: 'Update your sign-in password' },
];

const signOutItem: MenuItem = {
  icon: LogOut,
  title: 'Sign out',
  detail: 'End your shift on this phone',
};

export function MoreScreen() {
  const nav = useNavigation<any>();
  const { signOut } = useSession();
  const openAlerts = useStore().alerts.filter(a => !a.resolved).length;

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

      <ScreenScroll>
        <Eyebrow label="Daily work" />
        <CardList inset={52}>
          {work.map(item => (
            <MenuRow
              key={item.title}
              item={item.to === 'Alerts' ? { ...item, count: openAlerts } : item}
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
          MyDiary 0.1 · TrustLab Diagnostics Pvt. Ltd.
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: s(8), flexWrap: 'wrap' },
  version: { textAlign: 'center', marginTop: vs(26) },
});
