import React, { useCallback, useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityReopenScreen } from '../screens/ActivityReopenScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { DiscussionDetailScreen } from '../screens/DiscussionDetailScreen';
import { DiscussionFormScreen } from '../screens/DiscussionFormScreen';
import { DiscussionsScreen } from '../screens/DiscussionsScreen';
import { MeetingDetailScreen } from '../screens/MeetingDetailScreen';
import { MeetingFormScreen } from '../screens/MeetingFormScreen';
import { MeetingsScreen } from '../screens/MeetingsScreen';
import { MilestoneFormScreen } from '../screens/MilestoneFormScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { ProjectFormScreen } from '../screens/ProjectFormScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { DailyReportScreen } from '../screens/DailyReportScreen';
import { DiaryEntryFormScreen } from '../screens/DiaryEntryFormScreen';
import { DiaryEntryScreen } from '../screens/DiaryEntryScreen';
import { DiaryScreen } from '../screens/DiaryScreen';
import { EscalateTaskScreen } from '../screens/EscalateTaskScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LabHistoryScreen } from '../screens/LabHistoryScreen';
import { LabReadinessScreen } from '../screens/LabReadinessScreen';
import { LabRecordScreen } from '../screens/LabRecordScreen';
import { LabReopenScreen } from '../screens/LabReopenScreen';
import { LabSignOffScreen } from '../screens/LabSignOffScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { PreOpsScreen } from '../screens/PreOpsScreen';
import { RaiseAlertScreen } from '../screens/RaiseAlertScreen';
import { ResolveAlertScreen } from '../screens/ResolveAlertScreen';
import { ResolveTaskScreen } from '../screens/ResolveTaskScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { VisitDetailScreen } from '../screens/VisitDetailScreen';
import { VisitFormScreen } from '../screens/VisitFormScreen';
import { VisitsScreen } from '../screens/VisitsScreen';
import { useAppDispatch, useAppSelector } from '../store';
import { loadSession } from '../store/persist';
import { restored } from '../store/slices/sessionSlice';
import { navigationRef } from '../push';
import { usePush } from '../push/usePush';
import { colors } from '../theme';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.ground,
    card: colors.surface,
    primary: colors.teal,
    text: colors.ink,
    border: colors.line,
  },
};

const renderTabBar = (props: React.ComponentProps<typeof TabBar>) => (
  <TabBar {...props} />
);

// Mounted only while someone is signed in.
function PushListener() {
  usePush();
  return null;
}

function Tabs() {
  // Lab Readiness is only for people who work with the lab. Everyone else
  // signs off a daily activity log instead; admin and CMD get both.
  const lab = useAppSelector(st => st.session.user?.lab ?? true);
  const activity = useAppSelector(
    st => !(st.session.user?.lab ?? true) || !!st.session.user?.sees_all,
  );
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      {lab ? <Tab.Screen name="Lab" component={LabReadinessScreen} /> : null}
      {activity ? (
        <Tab.Screen name="Activity" component={ActivityScreen} />
      ) : null}
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector(st => st.session);
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);

  // Read the saved token while the splash screen plays.
  useEffect(() => {
    loadSession().then(saved => dispatch(restored(saved)));
  }, [dispatch]);

  if (booting || loading) {
    return <SplashScreen onDone={finishBoot} />;
  }
  if (!token) {
    return <SignInScreen />;
  }
  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <PushListener />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Meetings" component={MeetingsScreen} />
        <Stack.Screen name="MeetingDetail" component={MeetingDetailScreen} />
        <Stack.Screen name="MeetingForm" component={MeetingFormScreen} />
        <Stack.Screen name="Discussions" component={DiscussionsScreen} />
        <Stack.Screen
          name="DiscussionDetail"
          component={DiscussionDetailScreen}
        />
        <Stack.Screen name="DiscussionForm" component={DiscussionFormScreen} />
        <Stack.Screen name="Projects" component={ProjectsScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
        <Stack.Screen name="MilestoneForm" component={MilestoneFormScreen} />
        <Stack.Screen name="RaiseAlert" component={RaiseAlertScreen} />
        <Stack.Screen name="ResolveAlert" component={ResolveAlertScreen} />
        <Stack.Screen name="PreOps" component={PreOpsScreen} />
        <Stack.Screen name="DailyReport" component={DailyReportScreen} />
        <Stack.Screen name="Visits" component={VisitsScreen} />
        <Stack.Screen name="VisitForm" component={VisitFormScreen} />
        <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="EscalateTask" component={EscalateTaskScreen} />
        <Stack.Screen name="ResolveTask" component={ResolveTaskScreen} />
        <Stack.Screen name="DiaryEntryForm" component={DiaryEntryFormScreen} />
        <Stack.Screen name="DiaryEntry" component={DiaryEntryScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="LabSignOff" component={LabSignOffScreen} />
        <Stack.Screen name="LabReopen" component={LabReopenScreen} />
        <Stack.Screen name="ActivityReopen" component={ActivityReopenScreen} />
        <Stack.Screen name="LabHistory" component={LabHistoryScreen} />
        <Stack.Screen name="LabRecord" component={LabRecordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
