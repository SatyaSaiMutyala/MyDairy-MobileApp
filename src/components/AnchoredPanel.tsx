import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, hairline, ms, radius, s, shadow, space, vs } from '../theme';

export type Anchor = { x: number; y: number; width: number; height: number };

const GAP = vs(6);

// Remembers where a field is on screen so a panel can open right under it.
export function useAnchor() {
  const ref = useRef<React.ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const show = useCallback(
    () =>
      ref.current?.measureInWindow((x, y, width, height) =>
        setAnchor({ x, y, width, height }),
      ),
    [],
  );
  const hide = useCallback(() => setAnchor(null), []);
  return { ref, anchor, open: anchor !== null, show, hide };
}

type Props = {
  anchor: Anchor | null;
  onClose: () => void;
  children: React.ReactNode;
  // Tallest the panel may grow.
  maxHeight?: number;
  // Narrow fields (half width) still get a panel at least this wide.
  minWidth?: number;
  // Roughly how tall the content is. Used to decide whether it fits below.
  needs?: number;
};

// How much of the screen the keyboard covers right now.
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(
      ios ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      ios ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

// A panel that opens directly below its field. It only flips above the field
// when there is no room left underneath.
export function AnchoredPanel({
  anchor,
  onClose,
  children,
  maxHeight = vs(280),
  minWidth = 0,
  needs,
}: Props) {
  const window = useWindowDimensions();
  const keyboard = useKeyboardHeight();
  if (!anchor) {
    return null;
  }
  const width = Math.min(
    Math.max(anchor.width, minWidth),
    window.width - space.gutter * 2,
  );
  const left = Math.max(
    space.gutter,
    Math.min(anchor.x, window.width - width - space.gutter),
  );
  const below = anchor.y + anchor.height + GAP;
  // A panel with a text box in it must stay clear of the keyboard.
  const roomBelow = window.height - keyboard - below - vs(keyboard ? 10 : 24);
  const roomAbove = anchor.y - vs(60);
  const wanted = Math.min(needs ?? vs(200), maxHeight);
  const flip = roomBelow < wanted && roomAbove > roomBelow;

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
        style={[
          styles.panel,
          { left, width },
          flip
            ? {
                bottom: window.height - anchor.y + GAP,
                maxHeight: Math.min(maxHeight, roomAbove),
              }
            : { top: below, maxHeight: Math.min(maxHeight, roomBelow) },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow.card,
    shadowOpacity: 0.18,
    shadowRadius: ms(18),
    elevation: 8,
  },
});

export const panelMinWidth = s(290);
