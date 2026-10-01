import React from 'react';
import { StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import type { DropdownOption } from './Dropdown';
import { IconButton } from './IconButton';
import { PersonPicker } from './PersonPicker';

type Props = {
  people: DropdownOption[];
  onChange: (people: DropdownOption[]) => void;
  label?: string;
  placeholder?: string;
  // Leave the signed-in person out of the search.
  excludeMe?: boolean;
};

// Pick several employees: search and add one at a time, remove with the cross.
export function PeopleField({
  people,
  onChange,
  label,
  placeholder = 'Search and add a person',
  excludeMe = true,
}: Props) {
  return (
    <View>
      <PersonPicker
        excludeMe={excludeMe}
        label={label}
        placeholder={placeholder}
        onChange={p => {
          if (!people.some(x => x.id === p.id)) {
            onChange([...people, p]);
          }
        }}
      />
      {people.map(p => (
        <View key={p.id} style={styles.row}>
          <View style={styles.text}>
            <AppText variant="body" numberOfLines={1}>
              {p.label}
            </AppText>
            {p.detail ? (
              <AppText variant="meta" color={colors.inkMuted} numberOfLines={1}>
                {p.detail}
              </AppText>
            ) : null}
          </View>
          <IconButton
            icon={X}
            label={`Remove ${p.label}`}
            size={30}
            iconSize={17}
            strokeWidth={2.25}
            color={colors.inkSoft}
            onPress={() => onChange(people.filter(x => x.id !== p.id))}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(6),
    paddingLeft: s(12),
    paddingRight: s(4),
    marginBottom: vs(8),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  text: { flex: 1 },
});
