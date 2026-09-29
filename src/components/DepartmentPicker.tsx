import React, { useState } from 'react';
import { ViewStyle } from 'react-native';
import { departments } from '../data/departments';
import { currentUser, seesAllDepartments } from '../data/user';
import { Dropdown, DropdownOption } from './Dropdown';

// A normal user is tied to their own department. Admin and CMD can switch.
export function useDepartment(allowAll = false) {
  const canSwitch = seesAllDepartments();
  const [dept, setDept] = useState(
    canSwitch && allowAll ? 'all' : currentUser.deptKey,
  );
  return { dept, setDept, canSwitch };
}

type Props = {
  value: string;
  onChange: (id: string) => void;
  // Adds an "All departments" choice at the top.
  allowAll?: boolean;
  style?: ViewStyle;
};

export function DepartmentPicker({ value, onChange, allowAll = false, style }: Props) {
  if (!seesAllDepartments()) {
    return null;
  }
  const options: DropdownOption[] = allowAll
    ? [{ id: 'all', label: 'All departments' }, ...departments]
    : departments;
  return (
    <Dropdown
      label="Department"
      options={options}
      value={value}
      onChange={onChange}
      style={style}
    />
  );
}
