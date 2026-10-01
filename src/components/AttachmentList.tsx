import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { FileText, Image as ImageIcon, Paperclip, X } from 'lucide-react-native';
import {
  fileSize,
  isImage,
  MAX_FILES,
  PickedFile,
  pickFiles,
} from '../utils/files';
import { colors, hairline, radius, s, vs } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { PhotoViewer } from './PhotoViewer';

type Props = {
  files: PickedFile[];
  onAdd?: (files: PickedFile[]) => void;
  onRemove?: (id: string) => void;
};

// Files attached to a task. Pictures open in the app; other files open in
// whatever app the phone uses for them.
export function AttachmentList({ files, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState<PickedFile>();
  const [error, setError] = useState<string>();

  const add = async () => {
    const result = await pickFiles(MAX_FILES - files.length);
    setError(result.error);
    if (result.files.length) {
      onAdd?.(result.files);
    }
  };

  const view = (file: PickedFile) =>
    isImage(file)
      ? setOpen(file)
      : Linking.openURL(file.uri).catch(() =>
          setError('This phone has no app that can open the file.'),
        );

  return (
    <View>
      {files.map(f => {
        const Icon = isImage(f) ? ImageIcon : FileText;
        return (
          <Pressable key={f.id} onPress={() => view(f)} style={styles.row}>
            <Icon size={s(21)} color={colors.tealDeep} strokeWidth={1.6} />
            <View style={styles.text}>
              <AppText variant="body" numberOfLines={1}>
                {f.name}
              </AppText>
              <AppText variant="meta" color={colors.inkMuted}>
                {fileSize(f.size)}
              </AppText>
            </View>
            {onRemove ? (
              <IconButton
                icon={X}
                label={`Remove ${f.name}`}
                size={30}
                iconSize={17}
                strokeWidth={2.25}
                color={colors.inkSoft}
                onPress={() => onRemove(f.id)}
              />
            ) : null}
          </Pressable>
        );
      })}

      {onAdd ? (
        <View style={styles.actions}>
          <Button
            label="Attach file"
            size="sm"
            variant="outline"
            iconLeft={Paperclip}
            iconColor={colors.teal}
            disabled={files.length >= MAX_FILES}
            onPress={add}
          />
          <AppText variant="meta" color={colors.inkMuted}>
            {files.length} / {MAX_FILES} · 5 MB each
          </AppText>
        </View>
      ) : null}
      {error ? (
        <AppText variant="metaStrong" color={colors.redInk} style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <PhotoViewer
        photo={open ? { uri: open.uri } : undefined}
        caption={open?.name}
        onClose={() => setOpen(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(6),
    paddingHorizontal: s(12),
    marginBottom: vs(8),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.ground,
  },
  text: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  error: { marginTop: vs(6) },
});
