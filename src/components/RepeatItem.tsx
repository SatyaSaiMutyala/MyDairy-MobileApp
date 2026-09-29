import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { colors, vs } from '../theme';
import { AppText } from './AppText';
import { Divider } from './Card';
import { IconButton } from './IconButton';

type Props = {
  title: string;
  first: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
};

// One entry in a list the user can add to, e.g. "Observation 2".
export function RepeatItem({ title, first, onRemove, children }: Props) {
  return (
    <View>
      {first ? null : <Divider style={styles.rule} />}
      <View style={styles.head}>
        <AppText variant="label" color={colors.inkSoft} style={styles.title}>
          {title}
        </AppText>
        {onRemove ? (
          <IconButton
            icon={Trash2}
            label={`Remove ${title}`}
            color={colors.red}
            size={28}
            iconSize={18}
            onPress={onRemove}
          />
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  rule: { marginBottom: vs(12) },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(8) },
  title: { flex: 1 },
});
