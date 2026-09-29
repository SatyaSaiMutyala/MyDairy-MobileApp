import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Every size in the app goes through one of these three.
// s  = widths, horizontal padding, icon sizes
// vs = heights, vertical padding
// ms = font sizes, radii, borders (scales more gently)
export const s = scale;
export const vs = verticalScale;
export const ms = (size: number, factor = 0.4) => moderateScale(size, factor);

// fs = text only. One dial for the whole app: lower TEXT_SCALE to shrink every
// font, raise it to enlarge.
const TEXT_SCALE = 0.86;
export const fs = (size: number) => moderateScale(size * TEXT_SCALE, 0.3);

export const colors = {
  teal: '#0F766E',
  tealDeep: '#0B4F4A',
  tealLift: '#14877D',
  tealShade: '#0D6A63',
  tealTint: '#E3F1EE',
  tealLine: '#BFDDD8',
  tealEdge: '#7FBDB5',
  tealGlass: 'rgba(255,255,255,0.06)',
  sand: '#F4E3D3',

  yellow: '#F9D423',
  yellowInk: '#1C1A05',
  lime: '#9DB84A',

  ink: '#16201F',
  inkSoft: '#3F4A48',
  inkMuted: '#5B6563',
  inkFaint: '#8A9391',

  ground: '#F6F4F0',
  surface: '#FFFFFF',
  line: '#E4E0D8',
  lineSoft: '#EEEBE5',
  fill: '#EFECE6',
  disabled: '#E6E2DC',
  disabledInk: '#7C8583',
  slate: '#3F4A48',

  red: '#C4262E',
  redInk: '#9B1C23',
  redTint: '#FCEBEA',
  redWash: '#FFFAF9',
  amber: '#D97706',
  amberInk: '#8A4B06',
  amberTint: '#FFF1DC',
  green: '#3F8A2B',
  greenInk: '#2C641D',
  greenTint: '#E8F3E2',
  blue: '#2F5FA8',
  blueInk: '#22467E',
  blueTint: '#E4ECF8',

  white: '#FFFFFF',
  scrim: 'rgba(8,22,20,0.94)',
  veil: 'rgba(8,22,20,0.55)',
  onTeal: '#FFFFFF',
  onTealSoft: '#CFE7E2',
} as const;

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export const type = {
  figure: { fontFamily: fonts.semibold, fontSize: fs(44), lineHeight: fs(52) },
  title: { fontFamily: fonts.semibold, fontSize: fs(30), lineHeight: fs(38) },
  display: { fontFamily: fonts.semibold, fontSize: fs(34), lineHeight: fs(42) },
  heading: { fontFamily: fonts.semibold, fontSize: fs(17), lineHeight: fs(24) },
  body: { fontFamily: fonts.medium, fontSize: fs(15), lineHeight: fs(22) },
  bodyRegular: {
    fontFamily: fonts.regular,
    fontSize: fs(15),
    lineHeight: fs(22),
  },
  label: { fontFamily: fonts.semibold, fontSize: fs(14), lineHeight: fs(20) },
  meta: { fontFamily: fonts.regular, fontSize: fs(13), lineHeight: fs(18) },
  metaStrong: {
    fontFamily: fonts.semibold,
    fontSize: fs(13),
    lineHeight: fs(18),
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: fs(12),
    lineHeight: fs(16),
    letterSpacing: fs(1.2),
  },
  tab: { fontFamily: fonts.medium, fontSize: fs(11), lineHeight: fs(15) },
} as const;

export type TypeVariant = keyof typeof type;

export const radius = {
  xs: ms(6),
  sm: ms(10),
  md: ms(14),
  lg: ms(20),
  xl: ms(28),
  pill: ms(999),
} as const;

export const space = {
  // Space between the screen edge and the content: 15 points on an
  // iPhone 17. Every screen, header and footer uses this one value.
  gutter: s(13),
  xs: s(4),
  sm: s(8),
  md: s(12),
  lg: s(16),
  xl: s(24),
} as const;

export const hairline = ms(1, 0.2);

// Height of every single-line field (text, dropdown, date, time).
// 34 gives about 44 points on an iPhone 17.
export const fieldHeight = vs(34);
// Space under a field before the next one.
export const fieldGap = vs(12);
// Space between a field and its label.
export const labelGap = vs(5);

export const shadow = {
  card: {
    shadowColor: '#1B2A28',
    shadowOpacity: 0.06,
    shadowRadius: ms(10),
    shadowOffset: { width: 0, height: vs(3) },
    elevation: 2,
  },
  action: {
    shadowColor: '#8A7400',
    shadowOpacity: 0.28,
    shadowRadius: ms(12),
    shadowOffset: { width: 0, height: vs(6) },
    elevation: 5,
  },
} as const;
