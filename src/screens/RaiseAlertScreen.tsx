import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Eye, TriangleAlert } from 'lucide-react-native';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { Dropdown } from '../components/Dropdown';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import type { AlertItem } from '../alerts/model';
import { currentUser, seesAllDepartments } from '../data/user';
import { errorMessage } from '../store';
import {
  useDepartmentsQuery,
  useRaiseAlertMutation,
} from '../store/api/alertsApi';
import { StyleSheet } from 'react-native';
import { vs } from '../theme';

const help: Record<AlertItem['level'], { title: string; text: string }> = {
  red: {
    title: 'Action — fix now',
    text: 'Something is broken or unsafe and needs attention immediately.',
  },
  amber: {
    title: 'Watch — keep an eye',
    text: 'Not urgent yet, but it could become a problem.',
  },
  green: {
    title: 'Clear — good news',
    text: 'Something was fixed or went well.',
  },
};

const ALL_DEPARTMENTS = {};

export function RaiseAlertScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const [dept, setDept] = useState<string>(
    route.params?.dept ?? currentUser.deptKey,
  );
  const everyone = seesAllDepartments();
  const departments = useDepartmentsQuery(ALL_DEPARTMENTS, { skip: !everyone });
  const [raise, call] = useRaiseAlertMutation();
  const [text, setText] = useState('');
  const [level, setLevel] = useState<AlertItem['level']>('amber');
  const [reference, setReference] = useState('');

  const options = useMemo(
    () => (departments.data ?? []).map(d => ({ id: d.key, label: d.name })),
    [departments.data],
  );

  const submit = async () => {
    try {
      await raise({
        // A department login always files for its own department.
        department_key: everyone ? dept : undefined,
        severity: level,
        text: text.trim(),
        meta: reference.trim() || undefined,
      }).unwrap();
      nav.goBack();
    } catch {
      // The API's message is shown at the top.
    }
  };
  const failure = call.error ?? departments.error;

  return (
    <FormScreen
      title="Log new alert"
      footer={
        <Button
          label={call.isLoading ? 'Logging…' : 'Log alert'}
          disabled={!text.trim() || call.isLoading}
          onPress={submit}
        />
      }
    >
      {failure ? (
        <Notice
          tone="error"
          title={errorMessage(failure)}
          style={styles.error}
        />
      ) : null}
      <FormCard>
        {everyone ? (
          <Dropdown
            label="Department"
            options={options}
            value={dept}
            onChange={setDept}
          />
        ) : null}
        <TextArea
          label="What happened?"
          value={text}
          onChangeText={setText}
          maxLength={1000}
          placeholder="e.g. Server room AC not working since 11 AM"
        />
        <ChoiceGroup
          label="Severity"
          style={styles.field}
          value={level}
          onChange={k => k && setLevel(k)}
          options={[
            { key: 'red', label: 'Action', icon: TriangleAlert, tone: 'red' },
            { key: 'amber', label: 'Watch', icon: Eye, tone: 'amber' },
            { key: 'green', label: 'Clear', icon: Check, tone: 'green' },
          ]}
        />
        <Notice
          tone={
            level === 'red' ? 'error' : level === 'green' ? 'success' : 'info'
          }
          title={help[level].title}
          text={help[level].text}
          style={styles.field}
        />
        <TextField
          label="Reference (optional)"
          value={reference}
          onChangeText={setReference}
          maxLength={255}
          placeholder="e.g. IT-03 · HYD"
        />
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: vs(12) },
  error: { marginTop: vs(10) },
});
