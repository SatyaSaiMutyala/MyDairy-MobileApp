import React, { useCallback, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertsScreen } from '../screens/AlertsScreen';
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
import { useSession } from '../state/Session';
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

function Tabs() {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen name="Lab" component={LabReadinessScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { signedIn } = useSession();
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);

  if (booting) {
    return <SplashScreen onDone={finishBoot} />;
  }
  if (!signedIn) {
    return <SignInScreen />;
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
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
        <Stack.Screen name="LabHistory" component={LabHistoryScreen} />
        <Stack.Screen name="LabRecord" component={LabRecordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
