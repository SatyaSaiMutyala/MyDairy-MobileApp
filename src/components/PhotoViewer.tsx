import React from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ImageIcon, X } from 'lucide-react-native';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  // undefined = closed. A photo without a uri is sample data.
  photo: { uri?: string } | undefined;
  caption?: string;
  onClose: () => void;
};

// Full-screen view of one photograph.
export function PhotoViewer({ photo, caption, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={!!photo}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {photo?.uri ? (
          <Image source={{ uri: photo.uri }} resizeMode="contain" style={styles.image} />
        ) : (
          <View style={styles.sample}>
            <ImageIcon size={s(40)} color={colors.onTealSoft} strokeWidth={1.5} />
            <AppText variant="body" color={colors.white}>
              Sample photograph
            </AppText>
          </View>
        )}
        {caption ? (
          <AppText
            variant="meta"
            color={colors.white}
            style={[styles.caption, { bottom: insets.bottom + vs(20) }]}>
            {caption}
          </AppText>
        ) : null}
        <IconButton
          icon={X}
          label="Close photograph"
          color={colors.white}
          iconSize={24}
          strokeWidth={2}
          onPress={onClose}
          style={[styles.close, { top: insets.top + vs(8) }]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center' },
  image: { width: '100%', height: '80%' },
  sample: { alignItems: 'center', gap: vs(10) },
  caption: { position: 'absolute', left: s(20), right: s(20), textAlign: 'center' },
  close: { position: 'absolute', right: s(12) },
});
