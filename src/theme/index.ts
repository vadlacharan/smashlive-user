import { Platform } from 'react-native';

// ─── SmashLive Design System — "dark gym, bright signal" ────────────────────
// Reference: design.md — near-black training environment, electric green accent.

export const Fonts = {
  display: 'Sora_800ExtraBold', // Display — headlines said out loud
  heading: 'Sora_700Bold', // H1 / H2
  headingSemibold: 'Sora_600SemiBold', // H3, button labels
  body: 'Inter_400Regular', // UI / body
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const Colors = {
  // Brand
  green: '#39FF88', // Electric green — the single kinetic accent
  greenDark: '#1FCC6B', // Pressed / active state of green elements
  greenMuted: '#1B4D33', // Green surface tint (badges, selected chips)
  greenGlow: 'rgba(57, 255, 136, 0.35)', // Glow behind CTAs & live cards
  greenFaint: 'rgba(57, 255, 136, 0.07)', // Stat card tint

  // Backgrounds (charcoal ramp — never pure black)
  canvas: '#0B0F0D', // bg.base — deepest layer
  surface1: '#121714', // bg.surface — cards, sheets, tab bar
  surface2: '#171C19', // bg.surfaceAlt — secondary cards, inputs
  surface3: '#1D2420', // bg.elevated — modals, bottom sheets
  border: '#262E29', // bg.stroke — hairline borders / dividers

  // Text
  textPrimary: '#F5F7F6', // Headlines, primary body
  textSecondary: '#A6B0AB', // Subtext, metadata
  textTertiary: '#6B756F', // Disabled, placeholders, captions
  textInverse: '#0B0F0D', // Text/icons on green surfaces (onGreen)

  // Aliases (legacy naming)
  divider: '#262E29',
  borderLight: '#3A443E',

  // Semantic
  success: '#39FF88',
  warning: '#FFB84D',
  warningMuted: 'rgba(255, 184, 77, 0.15)',
  danger: '#FF5C5C',
  dangerMuted: 'rgba(255, 92, 92, 0.15)',
  info: '#4DA6FF',
  infoMuted: 'rgba(77, 166, 255, 0.15)',
  live: '#FF4D6D', // "Live now" indicator dot

  // Legacy compat (trophy / champion accents)
  gold: '#FFD873',

  // Slot states
  slotAvailable: '#171C19',
  slotSelected: '#39FF88',
  slotTaken: '#121714',
  slotDisabled: '#121714',

  // Gradients
  screenWash: ['#14261C', '#0B0F0D'] as const, // radial bloom at top → flat charcoal
  ctaGradient: ['#39FF88', '#1FCC6B'] as const, // CTA Glow
  heroOverlay: ['rgba(11,15,13,0)', 'rgba(11,15,13,0.92)'] as const,
  heroOverlayFull: ['rgba(11,15,13,0)', 'rgba(11,15,13,0.95)', '#0B0F0D'] as const,
  sideScrim: ['rgba(11,15,13,0.95)', 'rgba(11,15,13,0.55)', 'rgba(11,15,13,0.05)'] as const,
  cardSheen: ['rgba(57,255,136,0.12)', 'rgba(11,15,13,0)'] as const,
  liveGradient: ['rgba(255,77,109,0.2)', 'rgba(11,15,13,0)'] as const,
  // Photo Simulation — category tints, used as card placeholder gradients
  photoSim: {
    badminton: ['#1B4D33', '#14201A', '#0F1512'] as const,
    'cricket-turf': ['#33401F', '#14201A', '#0F1512'] as const,
    'box-cricket': ['#2E3B20', '#14201A', '#0F1512'] as const,
    pickleball: ['#1F3348', '#14201A', '#0F1512'] as const,
    football: ['#1E3B2A', '#14201A', '#0F1512'] as const,
    swimming: ['#1A3340', '#14201A', '#0F1512'] as const,
    gym: ['#33201E', '#14201A', '#0F1512'] as const,
    default: ['#22301F', '#14201A', '#0F1512'] as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  screenPadding: 20,
};

export const BorderRadius = {
  xs: 8, // badges, small chips
  sm: 12, // inputs, small buttons
  md: 16, // buttons, chips
  lg: 20, // cards
  xl: 24, // bottom sheets, modals
  card: 20,
  sheet: 24,
  full: 9999,
};

export const Typography = {
  // Sizes (design.md scale — airier than media apps, min body 14px)
  display: 32, // Sora ExtraBold 32/38 — onboarding, empty states
  hero: 32, // alias of display
  title1: 26, // H1 Sora Bold 26/32 — screen titles
  title2: 20, // H2 Sora Bold 20/26 — section headers
  title3: 17, // H3 Sora SemiBold 17/22 — card titles
  headline: 16, // Body Large Inter Medium 16/24
  body: 14, // Body Inter Regular 14/20
  callout: 15, // transitional size (legacy)
  subhead: 13, // legacy compact
  footnote: 12, // Caption 12/16
  caption: 11, // Label Uppercase size (11, 1.2px ls)
  micro: 10, // Micro — legal only

  // Weights (kept numeric for legacy styles)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
  }),
  cardFeatured: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.55,
      shadowRadius: 34,
    },
    android: { elevation: 10 },
  }),
  ctaGlow: Platform.select({
    ios: {
      shadowColor: '#39FF88',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    },
    android: { elevation: 6 },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
  }),
  greenGlow: Platform.select({
    ios: {
      shadowColor: '#39FF88',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
  }),
  sheet: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
  }),
};

// Green glow ring for featured/live cards — border, not shadow (Android-safe)
export const glowRing = {
  borderWidth: 1,
  borderColor: 'rgba(57,255,136,0.25)',
};

export const Springs = {
  snappy: { damping: 18, stiffness: 220, mass: 0.9 },
  smooth: { damping: 20, stiffness: 140, mass: 1 },
  gentle: { damping: 24, stiffness: 90, mass: 1 },
};