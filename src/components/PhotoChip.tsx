import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { colors, fonts, radius, s, vs } from '../theme';
import { AppText } from './AppText';

type Props = {
  count: number;
  onPress?: () => void;
  // Shown while there are no photos yet.
  emptyLabel?: string;
  disabled?: boolean;
};

export function PhotoChip({
  count,
  onPress,
  emptyLabel = 'Add photo',
  disabled = false,
}: Props) {
  const has = count > 0;
  const Icon = has ? ImageIcon : Camera;
  const ink = has ? colors.tealDeep : colors.inkSoft;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={s(8)}
      style={[styles.chip, has && styles.on]}>
      <Icon size={s(13)} color={ink} strokeWidth={1.9} />
      <AppText
        variant={has ? 'metaStrong' : 'meta'}
        color={ink}
        style={has ? undefined : styles.text}>
        {has ? `${count} ${count === 1 ? 'photo' : 'photos'}` : emptyLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: s(5),
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: radius.xs,
    backgroundColor: colors.fill,
  },
  on: { backgroundColor: colors.tealTint },
  text: { fontFamily: fonts.medium },
});
