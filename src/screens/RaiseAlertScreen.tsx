import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Eye, TriangleAlert } from 'lucide-react-native';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/ChoiceGroup';
import { DepartmentPicker } from '../components/DepartmentPicker';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { departmentName } from '../data/departments';
import type { AlertItem } from '../data/mock';
import { currentUser } from '../data/user';
import { clockNow, useStore } from '../state/Store';
import { StyleSheet } from 'react-native';
import { vs } from '../theme';

const help: Record<AlertItem['level'], { title: string; text: string }> = {
  red: { title: 'Action — fix now', text: 'Something is broken or unsafe and needs attention immediately.' },
  amber: { title: 'Watch — keep an eye', text: 'Not urgent yet, but it could become a problem.' },
  green: { title: 'Clear — good news', text: 'Something was fixed or went well.' },
};

export function RaiseAlertScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const [dept, setDept] = useState<string>(route.params?.dept ?? currentUser.deptKey);
  const { addAlert } = useStore();
  const [text, setText] = useState('');
  const [level, setLevel] = useState<AlertItem['level']>('amber');
  const [reference, setReference] = useState('');

  const submit = () => {
    addAlert({
      title: text.trim(),
      level,
      dept,
      area: departmentName(dept),
      by: currentUser.name,
      time: reference.trim() || clockNow(),
    });
    nav.goBack();
  };

  return (
    <FormScreen
      title="Log new alert"
      footer={
        <Button label="Log alert" disabled={!text.trim()} onPress={submit} />
      }>
      <FormCard>
        <DepartmentPicker value={dept} onChange={setDept} />
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
          tone={level === 'red' ? 'error' : level === 'green' ? 'success' : 'info'}
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
});
