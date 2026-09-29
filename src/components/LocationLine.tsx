import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MapPin, MapPinOff } from 'lucide-react-native';
import { openInMaps, Point, pointLabel } from '../utils/location';
import { colors, s } from '../theme';
import { IconText } from './IconText';

type Props = {
  label: string;
  point?: Point | null;
};

// Where something was recorded. Tapping it opens the map.
export function LocationLine({ label, point }: Props) {
  if (!point) {
    return (
      <IconText
        icon={MapPinOff}
        text={`${label}: no position recorded`}
        color={colors.inkFaint}
        style={styles.line}
      />
    );
  }
  return (
    <Pressable hitSlop={s(6)} onPress={() => openInMaps(point)} style={styles.line}>
      <IconText
        icon={MapPin}
        text={`${label}: ${pointLabel(point)}`}
        color={colors.teal}
        variant="metaStrong"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  line: { alignSelf: 'flex-start' },
});
