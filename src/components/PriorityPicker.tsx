import React from 'react';
import { ViewStyle } from 'react-native';
import type { Priority } from '../data/mock';
import { ChoiceGroup } from './ChoiceGroup';

type Props = {
  value: Priority;
  onChange: (value: Priority) => void;
  style?: ViewStyle;
};

export function PriorityPicker({ value, onChange, style }: Props) {
  return (
    <ChoiceGroup
      label="Priority"
      style={style}
      value={value}
      onChange={k => k && onChange(k)}
      options={[
        { key: 'Critical', label: 'Critical', tone: 'red' },
        { key: 'High', label: 'High', tone: 'amber' },
        { key: 'Medium', label: 'Medium', tone: 'teal' },
        { key: 'Low', label: 'Low', tone: 'slate' },
      ]}
    />
  );
}
