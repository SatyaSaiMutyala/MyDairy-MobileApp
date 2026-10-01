import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import type { Activity, LabItem, LabSection } from '../lab/model';
import { colors, s, vs } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { CardList } from './CardList';
import { IconTile } from './IconTile';
import { Pill } from './Pill';

type Props = {
  sections: LabSection[];
  items: Record<string, LabItem>;
  renderRow: (activity: Activity) => React.ReactNode;
  // Hide activities nobody actioned (used in history).
  onlyActioned?: boolean;
};

// The checklist grouped by section; each section folds and unfolds.
//
// Which sections start folded is decided once, when the record first loads:
// the ones that are already complete. After that only the person folds or
// unfolds a section. Finishing the last item of a section must NOT fold it,
// or the page jumps and the person loses their place.
export function LabSections({ sections, items, renderRow, onlyActioned = false }: Props) {
  const [folded, setFolded] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (folded === null && sections.length) {
      setFolded(
        Object.fromEntries(
          sections.map(sec => [sec.title, sec.complete === sec.rows.length]),
        ),
      );
    }
  }, [folded, sections]);

  return (
    <>
      {sections.map(sec => {
        const rows = onlyActioned
          ? sec.rows.filter(a => {
              const item = items[a.key];
              return item && (item.status !== null || item.photos.length > 0);
            })
          : sec.rows;
        if (!rows.length) {
          return null;
        }
        const allDone = sec.complete === sec.rows.length;
        // Until the first load has decided, show complete sections folded.
        const isFolded = folded ? !!folded[sec.title] : allDone;
        const toggle = () => setFolded(f => ({ ...(f ?? {}), [sec.title]: !isFolded }));

        if (isFolded) {
          return (
            <Pressable key={sec.title} onPress={toggle}>
              <Card style={styles.folded}>
                <IconTile round size={36} bg={allDone ? colors.teal : colors.tealTint}>
                  {allDone ? (
                    <Check size={s(17)} color={colors.white} strokeWidth={2.75} />
                  ) : (
                    <AppText variant="metaStrong" color={colors.tealDeep}>
                      {sec.complete}/{sec.rows.length}
                    </AppText>
                  )}
                </IconTile>
                <View style={styles.foldedBody}>
                  <AppText variant="heading">{sec.title}</AppText>
                  <AppText variant="meta" color={colors.inkMuted}>
                    {allDone
                      ? `All ${sec.rows.length} complete`
                      : `${sec.complete} of ${sec.rows.length} complete · ${
                          sec.rows.length - sec.complete
                        } open`}
                  </AppText>
                </View>
                <ChevronDown size={s(20)} color={colors.inkSoft} strokeWidth={2} />
              </Card>
            </Pressable>
          );
        }

        return (
          <View key={sec.title} style={styles.section}>
            <Pressable style={styles.head} onPress={toggle}>
              <AppText variant="heading" style={styles.title}>
                {sec.title}
              </AppText>
              {allDone ? (
                <Pill label="Complete" tone="signed" icon={Check} />
              ) : (
                <AppText variant="metaStrong" color={colors.inkMuted}>
                  {sec.complete} of {sec.rows.length}
                </AppText>
              )}
              <ChevronUp size={s(20)} color={colors.inkSoft} strokeWidth={2} />
            </Pressable>
            <CardList inset={14}>{rows.map(renderRow)}</CardList>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  folded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    padding: s(14),
    marginTop: vs(14),
  },
  foldedBody: { flex: 1 },
  section: { marginTop: vs(20) },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    minHeight: vs(40),
    marginBottom: vs(6),
  },
  title: { flex: 1 },
});
