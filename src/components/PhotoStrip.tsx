import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react-native';
import { pickPhotos, PhotoResult, takePhoto } from '../utils/photos';
import { colors, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { PhotoViewer } from './PhotoViewer';

export type StripPhoto = { id: string; uri?: string };

type Props = {
  photos: StripPhoto[];
  max: number;
  locked?: boolean;
  caption?: string;
  onAdd?: (uris: string[]) => void;
  onRemove?: (id: string) => void;
};

// Thumbnails of the photographs on a record, with Camera and Upload buttons.
export function PhotoStrip({
  photos,
  max,
  locked = false,
  caption,
  onAdd,
  onRemove,
}: Props) {
  const [open, setOpen] = useState<StripPhoto>();
  const [error, setError] = useState<string>();
  const room = max - photos.length;

  const run = async (action: () => Promise<PhotoResult>) => {
    const result = await action();
    setError(result.error);
    if (result.uris.length) {
      onAdd?.(result.uris.slice(0, room));
    }
  };

  return (
    <View>
      {photos.length ? (
        <View style={styles.grid}>
          {photos.map(p => (
            <View key={p.id}>
              <Pressable
                accessibilityLabel="Open photograph"
                onPress={() => setOpen(p)}
                style={styles.thumb}>
                {p.uri ? (
                  <Image source={{ uri: p.uri }} style={styles.image} />
                ) : (
                  <ImageIcon size={s(20)} color={colors.teal} strokeWidth={1.6} />
                )}
              </Pressable>
              {locked || !onRemove ? null : (
                <Pressable
                  hitSlop={s(8)}
                  accessibilityLabel="Remove photograph"
                  onPress={() => onRemove(p.id)}
                  style={styles.remove}>
                  <X size={s(12)} color={colors.white} strokeWidth={3} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ) : null}

      {locked || !onAdd ? null : (
        <View style={styles.actions}>
          <Button
            label="Camera"
            size="sm"
            variant="outline"
            iconLeft={Camera}
            iconColor={colors.teal}
            disabled={room <= 0}
            onPress={() => run(takePhoto)}
          />
          <Button
            label="Upload"
            size="sm"
            variant="outline"
            iconLeft={Upload}
            iconColor={colors.teal}
            disabled={room <= 0}
            onPress={() => run(() => pickPhotos(room))}
          />
          <AppText variant="meta" color={colors.inkMuted}>
            {photos.length} / {max}
          </AppText>
        </View>
      )}
      {error ? (
        <AppText variant="metaStrong" color={colors.redInk} style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <PhotoViewer photo={open} caption={caption} onClose={() => setOpen(undefined)} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: s(10), marginBottom: vs(10) },
  thumb: {
    width: s(58),
    height: s(58),
    borderRadius: radius.sm,
    borderWidth: hairline,
    borderColor: colors.tealLine,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: -s(6),
    right: -s(6),
    width: s(20),
    height: s(20),
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  error: { marginTop: vs(6) },
});
