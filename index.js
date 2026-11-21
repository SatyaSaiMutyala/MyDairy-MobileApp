/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/push';
import { registerAlarmHandlers } from './src/reminders/alarms';

registerBackgroundHandler();
registerAlarmHandlers();

AppRegistry.registerComponent(appName, () => App);
