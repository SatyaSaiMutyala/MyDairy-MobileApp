import React, { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react-native';
import {
  colors,
  fieldGap,
  fieldHeight,
  fonts,
  fs,
  hairline,
  labelGap,
  ms,
  radius,
  s,
  vs,
} from '../theme';
import { AnchoredPanel, useAnchor } from './AnchoredPanel';
import { AppText } from './AppText';
import type { DropdownOption } from './Dropdown';
import { ShimmerRows } from './Shimmer';

type Props = {
  // The chosen option. Kept whole, because it may not be in the loaded list.
  selected?: DropdownOption;
  onChange: (option: DropdownOption) => void;
  // What the search found so far.
  options: DropdownOption[];
  search: string;
  onSearch: (text: string) => void;
  // True while the first page for this search is being fetched.
  loading?: boolean;
  // True while a further page is being fetched.
  loadingMore?: boolean;
  onEndReached?: () => void;
  error?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  style?: ViewStyle;
};

const END_ZONE = vs(60);

// A dropdown for long lists: a search box on top, results from the server
// underneath, more loaded as the list is scrolled. Opens directly below its
// field, like every other dropdown.
export function SearchDropdown({
  selected,
  onChange,
  options,
  search,
  onSearch,
  loading = false,
  loadingMore = false,
  onEndReached,
  error,
  label,
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  emptyText = 'Nothing found.',
  style,
}: Props) {
  const { ref, anchor, open, show, hide } = useAnchor();
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const Chevron = open ? ChevronUp : ChevronDown;

  // The keyboard comes up as soon as the list opens.
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => input.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const close = () => {
    hide();
    onSearch('');
  };

  const scrolled = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (
      contentOffset.y + layoutMeasurement.height >=
      contentSize.height - END_ZONE
    ) {
      onEndReached?.();
    }
  };

  return (
    <View style={[label ? styles.wrap : null, style]}>
      {label ? (
        <AppText variant="label" color={colors.inkSoft} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        ref={ref}
        onPress={show}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={[styles.field, open && styles.fieldOpen]}>
          <AppText
            variant="bodyRegular"
            color={selected ? colors.ink : colors.inkFaint}
            style={styles.value}
            numberOfLines={1}
          >
            {selected?.label ?? placeholder}
          </AppText>
          <Chevron size={s(19)} color={colors.inkMuted} strokeWidth={2} />
        </View>
      </Pressable>

      <AnchoredPanel
        anchor={anchor}
        onClose={close}
        maxHeight={vs(300)}
        needs={vs(260)}
      >
        <View style={styles.searchRow}>
          <Search size={s(17)} color={colors.inkMuted} strokeWidth={2} />
          <TextInput
            ref={input}
            value={search}
            onChangeText={onSearch}
            allowFontScaling={false}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            maxLength={100}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.inkFaint}
            selectionColor={colors.teal}
            style={styles.input}
          />
          {search ? (
            <Pressable
              onPress={() => onSearch('')}
              hitSlop={s(10)}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <X size={s(17)} color={colors.inkSoft} strokeWidth={2.25} />
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <ShimmerRows rows={3} icon={false} lines={2} />
        ) : error ? (
          <AppText
            variant="metaStrong"
            color={colors.redInk}
            style={styles.note}
          >
            {error}
          </AppText>
        ) : options.length === 0 ? (
          <AppText variant="body" color={colors.inkMuted} style={styles.note}>
            {emptyText}
          </AppText>
        ) : (
          <ScrollView
            bounces={false}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={120}
            onScroll={onEndReached ? scrolled : undefined}
          >
            {options.map((o, i) => {
              const on = o.id === selected?.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => {
                    onChange(o);
                    close();
                  }}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => [
                    styles.option,
                    i > 0 && styles.optionRule,
                    (on || pressed) && styles.optionOn,
                  ]}
                >
                  <View style={styles.optionText}>
                    <AppText variant="body">{o.label}</AppText>
                    {o.detail ? (
                      <AppText variant="meta" color={colors.inkMuted}>
                        {o.detail}
                      </AppText>
                    ) : null}
                  </View>
                  {on ? (
                    <Check size={s(18)} color={colors.teal} strokeWidth={2.5} />
                  ) : null}
                </Pressable>
              );
            })}
            {loadingMore ? (
              <ShimmerRows rows={1} icon={false} lines={2} />
            ) : null}
          </ScrollView>
        )}
      </AnchoredPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: fieldGap },
  label: { marginBottom: labelGap },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    minHeight: fieldHeight,
    paddingHorizontal: s(14),
    borderRadius: radius.md,
    borderWidth: ms(1.5, 0.2),
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  fieldOpen: { borderColor: colors.teal },
  value: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    minHeight: fieldHeight,
    paddingHorizontal: s(14),
    borderBottomWidth: hairline,
    borderBottomColor: colors.line,
    backgroundColor: colors.ground,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fs(15),
    color: colors.ink,
    paddingVertical: vs(3),
    includeFontPadding: false,
  },
  note: { paddingHorizontal: s(14), paddingVertical: vs(16) },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
  },
  optionRule: { borderTopWidth: hairline, borderTopColor: colors.lineSoft },
  optionOn: { backgroundColor: colors.tealTint },
  optionText: { flex: 1 },
});
