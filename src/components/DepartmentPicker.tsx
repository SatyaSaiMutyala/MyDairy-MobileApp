import React, { useMemo, useState } from 'react';
import { ViewStyle } from 'react-native';
import { currentUser, seesAllDepartments } from '../data/user';
import { useDepartmentsQuery } from '../store/api/alertsApi';
import { Dropdown } from './Dropdown';

// A normal user is tied to their own department. Admin and CMD can switch.
// `first` opens on a given department (a notification names one); it only
// applies to people who can switch.
export function useDepartment(first?: string) {
  const canSwitch = seesAllDepartments();
  const [dept, setDept] = useState((canSwitch && first) || currentUser.deptKey);
  return { dept, setDept, canSwitch };
}

type Props = {
  value: string;
  onChange: (id: string) => void;
  // Only list departments that have morning checks, or KPIs, set up.
  scope?: 'preflight' | 'kpis';
  style?: ViewStyle;
};

// Shown to Admin and CMD only. The list comes from GET /departments.
export function DepartmentPicker({ value, onChange, scope, style }: Props) {
  const canSwitch = seesAllDepartments();
  const arg = useMemo(() => (scope ? { with: scope } : {}), [scope]);
  const { data } = useDepartmentsQuery(arg, { skip: !canSwitch });
  const options = useMemo(
    () => (data ?? []).map(d => ({ id: d.key, label: d.name })),
    [data],
  );
  if (!canSwitch) {
    return null;
  }
  return (
    <Dropdown
      label="Department"
      placeholder={data ? 'Select department' : 'Fetching departments'}
      options={options}
      value={value}
      onChange={onChange}
      style={style}
    />
  );
}
