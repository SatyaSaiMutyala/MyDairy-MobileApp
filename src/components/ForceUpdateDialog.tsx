import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { CloudDownload } from 'lucide-react-native';
import { colors, ms, radius, s, shadow, space, vs } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconTile } from './IconTile';

type Props = {
  visible: boolean;
  storeVersion: string | null;
  onUpdate: () => void;
};

// A blocking "Update required" box: no close, the back button does nothing,
// and the only way on is the store. Shown when this build is too old.
export function ForceUpdateDialog({ visible, storeVersion, onUpdate }: Props) {
  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      {/* Plain flex centring: absolute layers inside a transparent Modal
          come out zero-sized on iOS. */}
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <IconTile size={44} bg={colors.tealTint} round>
            <CloudDownload size={s(22)} color={colors.tealDeep} strokeWidth={1.9} />
          </IconTile>
          <AppText variant="heading" style={styles.title}>
            Update required
          </AppText>
          <AppText variant="bodyRegular" color={colors.inkSoft} style={styles.text}>
            A new version{storeVersion ? ` (${storeVersion})` : ''} of Trust
            Diary is available. Please update to continue.
          </AppText>
          <Button label="Update now" onPress={onUpdate} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.veil,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.gutter + s(8),
  },
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(16),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
    shadowOpacity: 0.2,
    shadowRadius: ms(20),
  },
  title: { marginTop: vs(12), textAlign: 'center' },
  text: { marginTop: vs(6), textAlign: 'center' },
  button: { alignSelf: 'stretch', marginTop: vs(16) },
});
