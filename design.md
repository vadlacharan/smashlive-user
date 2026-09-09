# Design System — Smashlive (Fitness Booking App)
### Platform: Expo + React Native (iOS / Android)

---

## 1. Visual Theme & Atmosphere

SmashLives lives in a **near-black, high-energy training environment** — the UI recedes into a deep charcoal-black so that class photography, trainer avatars, and progress data become the focal point. Against that darkness, a single **electric green** cuts through for anything actionable: book a class, confirm a slot, track a streak. The philosophy is "**dark gym, bright signal**" — the same tension you feel walking into a night training session under one green exit light.

Unlike a music app, SmashLive needs **legible data density** (schedules, timers, calendars) so the type system leans slightly larger and airier than a media app, with generous tap targets (min 48px) for use mid-workout, one-handed, sometimes sweaty-fingered.

**Key Characteristics:**
- Deep black/charcoal base with a subtle **radial gradient wash** (`#14261C → #0B0F0D`) top-of-screen — content and photography pop against it, and the app never reads as flatly black
- Electric Green (`#39FF88`) as the singular kinetic accent — CTAs, active states, progress, live indicators
- Geometric, highly-legible type pairing (**Sora** for display, **Inter** for body/UI) — built for glanceable schedules
- Soft-rounded cards (16–24px radius) that feel like tactile "class cards," not flat data rows
- **Heavily elevated cards** — deep, diffused drop shadows (`0px 10–24px` blur, 40–55% opacity) lift every bookable card off the gradient background; the live/featured card adds a green-tinted glow ring on top
- **Background-image cards** — class cards render trainer/studio photography as a full-bleed background with a directional scrim, not a thumbnail-plus-text row; text sits directly on the image like a poster
- **Translucent, blurred chrome** — the bottom tab bar and floating headers use `backdrop-filter: blur()` over a semi-transparent fill so content visibly passes underneath as it scrolls, rather than a solid opaque bar
- Pill buttons + circular icon buttons for primary actions; comfortable rounded rects elsewhere
- Motion-first: spring-based transitions, press-scale feedback, shared-element transitions between list → detail
- Semantic color system tuned for booking states: confirmed, waitlisted, full, cancelled

---

## 2. Color Palette & Roles

### Primary Brand
| Token | Hex | Role |
|---|---|---|
| `brand.green` | `#39FF88` | Primary accent — CTAs, active tab, progress rings, live badges |
| `brand.greenDark` | `#1FCC6B` | Pressed/active state of green elements |
| `brand.greenMuted` | `#1B4D33` | Green surface tint (badges, selected chips) |
| `brand.greenGlow` | `rgba(57,255,136,0.35)` | Glow shadow behind primary CTAs & live cards |

### Backgrounds
| Token | Hex | Role |
|---|---|---|
| `bg.base` | `#0B0F0D` | App background, deepest layer |
| `bg.surface` | `#121714` | Cards, sheets, tab bar |
| `bg.surfaceAlt` | `#171C19` | Secondary cards, input fields |
| `bg.elevated` | `#1D2420` | Modals, bottom sheets, popovers |
| `bg.stroke` | `#262E29` | Hairline borders / dividers |

### Text
| Token | Hex | Role |
|---|---|---|
| `text.primary` | `#F5F7F6` | Headlines, primary body |
| `text.secondary` | `#A6B0AB` | Subtext, metadata, timestamps |
| `text.tertiary` | `#6B756F` | Disabled, placeholder, captions |
| `text.onGreen` | `#0B0F0D` | Text/icons placed on green surfaces |

### Semantic
| Token | Hex | Role |
|---|---|---|
| `state.success` | `#39FF88` | Booking confirmed |
| `state.warning` | `#FFB84D` | Waitlisted, low spots left |
| `state.error` | `#FF5C5C` | Class full, booking failed, cancellation |
| `state.info` | `#4DA6FF` | Info banners, new-feature nudges |
| `state.live` | `#FF4D6D` | "Live now" indicator dot |

### Gradients
Gradients are used deliberately — to imply depth, simulate photography, and scrim text over images. They are never applied to flat text-only surfaces (buttons keep solid fills except the CTA Glow case below).

- **Screen Wash** (every screen background): `radial-gradient(120% 60% at 50% 0%, #14261C 0%, #0B0F0D 55%)` layered over `bg.base` — a soft green-black bloom at the top of the viewport that fades to flat charcoal by mid-screen. This replaces a flat `bg.base` fill as the default screen background.
- **CTA Glow**: `linear-gradient(135deg, #39FF88 0%, #1FCC6B 100%)` — optional richer fill for the primary "Book / Join now" button, in addition to its drop shadow glow
- **Hero Overlay (bottom scrim)**: `linear-gradient(180deg, rgba(11,15,13,0) 30%, rgba(11,15,13,0.92) 100%)` — over full-bleed class/trainer photography so headline text stays legible without a solid text plate
- **Hero Overlay (side scrim)**: `linear-gradient(90deg, rgba(11,15,13,0.95) 0%, rgba(11,15,13,0.55) 45%, rgba(11,15,13,0.05) 100%)` — for horizontal photo cards where text sits left and the image bleeds right
- **Photo Simulation** (when no real photography is available — placeholders, empty states): `linear-gradient(135deg, <category-tint> 0%, #14201A 60%, #0F1512 100%)` combined with a small radial accent bloom (`radial-gradient(80% 120% at 90% 20%, rgba(57,255,136,0.18), transparent 55%)`) — gives class cards a photographic, non-flat feel even before an image loads
- **Card Sheen** (premium/featured class, on top of a real photo): `linear-gradient(120deg, rgba(57,255,136,0.12) 0%, rgba(11,15,13,0) 60%)`
- **Streak/Stat Card Tint**: `background: rgba(57,255,136,0.07)` with a `1px solid rgba(57,255,136,0.2)` border — a quiet gradient-adjacent tint (not a hard gradient) for highlighted stat cards

---

## 3. Typography Rules

### Font Family (Expo)
Use **Sora** for display/headings and **Inter** for UI/body — both are variable Google Fonts with excellent mobile hinting, wide weight ranges, and first-class Expo support via `@expo-google-fonts`.

```bash
npx expo install @expo-google-fonts/sora @expo-google-fonts/inter expo-font expo-splash-screen
```

```tsx
// App.tsx
import { useFonts, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const [fontsLoaded] = useFonts({
  Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
});
```
> Fallback stack (system): `-apple-system, Roboto, sans-serif` — set as default in your `Text` wrapper so unloaded states never flash unstyled text.

### Type Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|---|
| Display | Sora ExtraBold | 32px | 800 | 38px | -0.5px | Onboarding, empty states |
| H1 | Sora Bold | 26px | 700 | 32px | -0.3px | Screen titles ("Book a Class") |
| H2 | Sora Bold | 20px | 700 | 26px | -0.2px | Section headers |
| H3 | Sora SemiBold | 17px | 600 | 22px | 0 | Card titles, class names |
| Body Large | Inter Medium | 16px | 500 | 24px | 0 | Primary body copy |
| Body | Inter Regular | 14px | 400 | 20px | 0 | Standard body, descriptions |
| Body Emphasis | Inter SemiBold | 14px | 600 | 20px | 0 | Trainer names, prices |
| Caption | Inter Regular | 12px | 400 | 16px | 0.1px | Timestamps, metadata |
| Caption Bold | Inter SemiBold | 12px | 600 | 16px | 0.2px | Spot counts, tags |
| Button | Sora SemiBold | 15px | 600 | 20px | 0.2px | All button labels |
| Label Uppercase | Inter Bold | 11px | 700 | 14px | 1.2px | `text-transform: uppercase` — badges, section eyebrows |
| Micro | Inter Regular | 10px | 400 | 12px | 0.2px | Legal, fine print |

### Principles
- **Sora for anything you'd say out loud, Inter for anything you'd scan.** Titles/CTAs get Sora's geometric confidence; schedules/lists get Inter's density-friendly neutrality.
- **Numbers get tabular figures** — use `fontVariant: ['tabular-nums']` on prices, timers, and countdowns so they don't jitter during live updates.
- **Min body size 14px** — this is a fitness app used mid-motion; never go below 12px except for legal microcopy.
- **Weight over size for hierarchy** — prefer 600/700 jumps before increasing size; keeps dense schedule lists compact.

---

## 4. Component Stylings

### Buttons

**Primary (Book Now)**
```
background: brand.green (or CTA Glow gradient)
text: text.onGreen, Sora SemiBold 15px
height: 52px · paddingHorizontal: 24px
radius: 16px
shadow: 0px 8px 20px brand.greenGlow (iOS) / elevation 6 (Android)
pressed: scale 0.97, background brand.greenDark, shadow reduced
disabled: bg.surfaceAlt, text.tertiary, no shadow
```

**Secondary (Outline)**
```
background: transparent
border: 1.5px solid bg.stroke
text: text.primary, Sora SemiBold 15px
height: 52px · radius: 16px
pressed: border brand.green, background rgba(57,255,136,0.06)
```

**Ghost / Text Button**
```
background: transparent
text: brand.green, Inter SemiBold 14px
pressed: opacity 0.6
```

**Icon Button (circular)**
```
size: 44x44 · radius: 22 (50%)
background: bg.surfaceAlt
pressed: background bg.elevated, scale 0.94
```

**Chip / Filter Pill** (e.g. "Yoga", "6AM", "Nearby")
```
background: bg.surfaceAlt → brand.greenMuted when selected
text: text.secondary → brand.green when selected
height: 36px · paddingHorizontal: 14px · radius: 9999px (full pill)
border: 1px solid bg.stroke, none when selected
```

### Cards

SmashLive has two card treatments. Use **background-image cards** wherever a class/trainer/studio has photography (this is the default, primary pattern). Fall back to **flat surface cards** only for non-visual content (stats, settings rows, plain lists).

**Class Booking Card — background-image style** (the core primitive)
```
container: position relative, radius 20–24px, overflow hidden
layer 1 (image): real photo via <Image> / expo-image, resizeMode "cover", fills card
layer 2 (fallback, no photo yet): Photo Simulation gradient (Section 2) — never a flat gray box
layer 3 (scrim): Hero Overlay bottom or side gradient, positioned absolute, inset 0
layer 4 (content): title/trainer/price text sits directly on the image, white/near-white text only
height: 112px (list row) · 190px (featured/live card)
padding: 14–16px inset from card edge for all overlaid content
shadow: 0px 10px 24px rgba(0,0,0,0.45) — elevation 6 (Android) — list cards
shadow (featured/live): 0px 16px 34px rgba(0,0,0,0.55), plus a 1px brand.green ring
              (box-shadow: 0 0 0 1px rgba(57,255,136,0.25)) for a glow-outline effect
spots-left badge: top-right overlay, translucent chip — rgba(20,16,10,0.55) + backdrop-blur(8px) —
                   state.warning text if <5 spots, sits ON the image, not beside it
status badge (confirmed/full/waitlisted): top-left or top-right, tinted-translucent pill,
                   backdrop-blur(6px) so it reads over any photo brightness
pressed: scale 0.98, shadow reduced by ~30%
```

**Flat Surface Card** (stats, settings, non-photo content)
```
background: bg.surface
radius: 18–20px
padding: 14–16px
shadow: 0px 6px 16px rgba(0,0,0,0.35) — elevation 4 (Android)
Use `Streak/Stat Card Tint` (Section 2) for highlighted variants instead of a solid fill
```

**Trainer / Studio Card (horizontal)**
```
background: bg.surfaceAlt
radius: 16px
avatar: 48px circle
layout: avatar + name/specialty stack, chevron trailing
```

**Stat / Streak Card**
```
background: bg.surfaceAlt with subtle green gradient underlay
radius: 18px
big number: Sora ExtraBold 28px, brand.green
label: Label Uppercase, text.tertiary
```

### Inputs
```
background: bg.surfaceAlt
height: 52px · radius: 14px
text: text.primary, Inter Regular 15px
placeholder: text.tertiary
border: 1px solid transparent → brand.green on focus (animated, 150ms)
error state: border state.error, helper text state.error 12px below
```

### Booking Status Badges
| State | Background | Text |
|---|---|---|
| Confirmed | `brand.greenMuted` | `brand.green` |
| Waitlisted | `rgba(255,184,77,0.15)` | `state.warning` |
| Full | `rgba(255,92,92,0.15)` | `state.error` |
| Live Now | `state.live` solid, pulsing dot | white |

### Tab Bar (bottom nav) — translucent, blurred

The tab bar floats over scrolling content rather than sitting in a solid opaque row — content should visibly pass underneath it.

```
position: absolute, pinned to screen bottom (not part of normal document flow)
background: rgba(13,17,15,0.55) — a translucent charcoal, NOT bg.surface solid
blur: expo-blur <BlurView intensity={40} tint="dark" /> wrapping the bar,
       OR backdrop-filter: blur(22px) for web/HTML previews
border: 1px solid rgba(255,255,255,0.06) top hairline only — separates bar from content without a hard edge
height: 64px content + safe-area-bottom inset
active icon/label: brand.green
inactive: text.tertiary (#7A847E)
active indicator: 4px green dot below icon, with a soft glow (shadow: 0 0 6px brand.green),
                   spring-animated position
tap feedback: icon scale 1 → 0.9 → 1 on press (springs.snappy)
```
> **Expo implementation**: wrap the `<Tab.Navigator>` custom tab bar in `expo-blur`'s `BlurView`, set the navigator's `tabBarStyle` to `{ position: 'absolute', backgroundColor: 'transparent' }`, and add `paddingBottom: insets.bottom` from `useSafeAreaInsets()`. Screen content needs bottom padding/`contentInset` equal to the bar's rendered height so the last list item isn't hidden behind it.

### Floating / Translucent Headers
Screen headers that sit above scrollable photo content (e.g. class detail) follow the same pattern: `rgba(11,15,13,0.5)` background + `BlurView` blur, icon buttons (back, share, favorite) rendered as circular translucent chips (`rgba(255,255,255,0.06)` background) so they stay legible over any photo underneath.

### Calendar / Time-slot Picker
```
day chip: 52x64, radius 16, selected → brand.green bg + text.onGreen
time slot pill: bg.surfaceAlt, radius 9999px, selected → brand.greenMuted bg + green border
disabled slot: text.tertiary, 40% opacity, no press feedback
```

---

## 5. Layout Principles

### Spacing System (4px base unit)
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

- Screen horizontal padding: **20px**
- Card internal padding: **16px**
- Gap between cards in a vertical list: **12px**
- Gap between sections: **28–32px**
- Gap between related inline elements (icon + label): **6–8px**

### Grid & Structure
- Single-column scroll for schedules/lists (this is a mobile-first, one-hand app — avoid multi-column density except category chip rows, which scroll horizontally)
- Horizontal `FlatList` carousels for "Featured Classes," "Trainers Near You" — card width ≈ 78% of screen width with 16px peek of next card
- Sticky section headers for date-grouped schedules (`SectionList` with `stickySectionHeadersEnabled`)
- Safe area respected on all screens via `react-native-safe-area-context` — never hardcode top/bottom insets

### Border Radius Scale
| Token | Value | Use |
|---|---|---|
| `radius.xs` | 8px | Badges, small chips |
| `radius.sm` | 12px | Inputs, small buttons |
| `radius.md` | 16px | Buttons, filter pills base |
| `radius.lg` | 20px | Cards |
| `radius.xl` | 24px | Bottom sheets, modals (top corners) |
| `radius.pill` | 9999px | Pills, chips, tags |
| `radius.circle` | 50% | Avatars, icon buttons, progress rings |

### Whitespace Philosophy
Denser than a marketing app, airier than Spotify — schedules need scanability, so rows get **12px** breathing room minimum, but the dark background does the heavy lifting for visual separation rather than large gaps. Hero/detail screens get generous **28–32px** rhythm to feel premium.

---

## 6. Depth & Elevation

React Native elevation needs platform-specific handling. Centralize this in a `shadows.ts` token file:

```ts
export const shadows = {
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
};

// Green glow "ring" for featured/live cards — layer as a border, not a shadow,
// since shadowColor tinting is unreliable on Android:
export const glowRing = {
  borderWidth: 1,
  borderColor: 'rgba(57,255,136,0.25)',
};
```

| Level | Treatment | Use |
|---|---|---|
| Base (0) | Screen Wash gradient over `bg.base` (Section 2) | Screen background — never a flat solid fill |
| Surface (1) | `bg.surface`, no shadow | Static rows, plain list items |
| Raised (2) | `shadows.card` | Standard background-image class cards |
| Featured (3) | `shadows.cardFeatured` + `glowRing` | Live/featured class card |
| Glow (4) | `shadows.ctaGlow` | Primary CTA buttons |
| Translucent (5) | `rgba(13,17,15,0.55)` fill + `BlurView` blur | Tab bar, floating headers — the one elevation level defined by blur+transparency rather than shadow |
| Overlay (6) | `shadows.modal` | Bottom sheets, modals, date pickers |

**Note on Android**: `elevation` tints shadows with a slight color shift and ignores `shadowColor` on most devices — for the green glow effect on Android, fake it with a soft blurred View behind the button (absolute-positioned, `backgroundColor: brand.greenGlow`, `borderRadius` matching, blurred via a low-opacity scaled duplicate) rather than relying on native elevation.

---

## 7. Motion & Animation

### Libraries
```bash
npx expo install react-native-reanimated react-native-gesture-handler
npm install moti  # declarative wrapper over Reanimated — great for card/list entrance anims
npx expo install expo-haptics expo-blur
```

### Motion Principles
- **Spring, not ease-curves** — every interactive transition (press, sheet open, tab switch) uses spring physics, never linear/ease timing. It reads as "responsive," matching the energy of the brand.
- **Press feedback everywhere tappable** — scale to `0.97` on `pressIn`, spring back on `pressOut`. Pair with `expo-haptics` `Haptics.impactAsync(Light)` on primary CTAs and booking confirmations.
- **Shared-element style transitions** — class card in list → class detail screen: the hero image and title should visually "continue" (use `react-navigation`'s shared element or a Reanimated `layout` animation with `Layout.springify()`).

### Standard Spring Config
```ts
export const springs = {
  snappy: { damping: 18, stiffness: 220, mass: 0.9 },   // buttons, chips, toggles
  smooth: { damping: 20, stiffness: 140, mass: 1 },      // sheets, modals, cards
  gentle: { damping: 24, stiffness: 90,  mass: 1 },      // large hero/entrance motion
};
```

### Key Interaction Patterns
| Interaction | Animation |
|---|---|
| Button press | `scale(1 → 0.97)`, spring `snappy`, + light haptic |
| Card entrance (list) | Fade + translateY(16 → 0), staggered 40ms per item (`Moti` + `AnimatePresence`) |
| Booking confirmed | Green checkmark draws in (SVG stroke animation via `react-native-svg` + Reanimated), success haptic (`Haptics.notificationAsync(Success)`) |
| Bottom sheet open | translateY from screen height, spring `smooth`, backdrop fade 0 → 0.6 opacity |
| Tab switch | Icon scale bounce (1 → 1.15 → 1) + indicator dot slides via `withSpring` |
| Pull-to-refresh (schedule) | Custom green pulse/spinner using `Animated.loop` rotation |
| "Live now" badge | Looping opacity pulse (0.6 ↔ 1, 1200ms, `withRepeat` + `withTiming`) on the red dot |
| Skeleton loading | Shimmer sweep across `bg.surfaceAlt` blocks, `withRepeat` translateX loop |
| Screen transitions | Native stack `slide_from_right`; modals use `presentation: 'modal'` with iOS-native sheet feel |

### Example: Press-Scale Button (Reanimated)
```tsx
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

<Pressable
  onPressIn={() => { scale.value = withSpring(0.97, springs.snappy); }}
  onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
>
  <Animated.View style={[styles.cta, animatedStyle]}>
    <Text style={styles.ctaText}>Book Now</Text>
  </Animated.View>
</Pressable>
```

---

## 8. Do's and Don'ts

### Do
- Keep backgrounds in the `#0B0F0D`–`#1D2420` range, topped with the Screen Wash radial gradient — depth via layered charcoal + gradient bloom, not pure black-and-white contrast
- Reserve `brand.green` for actionable/live/success moments — booking CTAs, confirmed states, progress
- Default to background-image cards for any class/trainer/studio content — real photo, or the Photo Simulation gradient as fallback, never a flat gray placeholder box
- Push shadows heavier than a typical light-mode app (`0.4–0.55` opacity, 16–34px blur) — on a dark, gradient background, timid shadows disappear entirely
- Use `BlurView`/`backdrop-filter` translucency for the tab bar and any floating header — content should be visible, softened, moving underneath
- Use spring animation for all interactive feedback — this app should feel physical, not flat
- Pair every primary action with subtle haptic feedback (`expo-haptics`)
- Keep tap targets ≥ 48px — this is used one-handed, often mid-workout
- Use tabular numerals for prices, timers, and countdowns
- Respect safe-area insets on every screen, especially with the blurred tab bar — pad scroll content so the last card isn't hidden behind it

### Don't
- Don't use green decoratively (backgrounds, dividers, icon fills that aren't functional) — it must always mean "go / active / confirmed"
- Don't use pure `#000000` as a surface — it reads dead on OLED and kills the layered-depth effect; use the charcoal ramp + gradient wash
- Don't render class/trainer cards as flat solid-color boxes with a small thumbnail — the photo (or its gradient stand-in) should fill the card
- Don't make the tab bar or floating headers fully opaque — losing the blur/translucency breaks the "chrome floats over content" feel that defines this app
- Don't use ease/linear timing for taps or sheet transitions — always spring
- Don't drop below 14px for any readable body copy
- Don't stack more than one glowing/featured card per viewport — glow should signal "this one matters"
- Don't rely on `elevation` alone for colored (green) shadows on Android — use the `glowRing` border technique instead of trying to tint `elevation`'s shadow

---

## 9. Responsive Behavior

### Device Targets
| Class | Width | Notes |
|---|---|---|
| Small phone | 360–390px (SE, compact Android) | Reduce card padding to 14px, hero height 120px |
| Standard phone | 390–430px | Base spec (this document) |
| Large phone / Plus | 430–480px | Slightly larger touch targets, no layout change |
| Tablet (iPad, Android tablet) | ≥600px | Switch class-list from single column to 2-column grid; max content width 720px, centered |

### Handling
- Use `useWindowDimensions()` + a `isTablet = width >= 600` flag to switch `FlatList` `numColumns`
- Font sizes scale via a clamped responsive helper (`react-native-size-matters` or a custom `moderateScale`) — cap scaling at ±10% to avoid oversized type on tablets
- Bottom tab bar becomes a left rail on tablet landscape (optional v2 enhancement)
- Always test with Dynamic Type / Android font scale at 130% — cards should reflow, never clip, class titles wrap to 2 lines max with ellipsis

---

## 10. Implementation Reference (Expo + React Native)

### Recommended Stack
| Purpose | Library |
|---|---|
| Fonts | `@expo-google-fonts/sora`, `@expo-google-fonts/inter` |
| Animation | `react-native-reanimated` v3, `moti` |
| Gestures | `react-native-gesture-handler` |
| Blur (tab bar, modals) | `expo-blur` |
| Haptics | `expo-haptics` |
| Icons | `lucide-react-native` or `@expo/vector-icons` (Feather set — matches geometric type) |
| Gradients | `expo-linear-gradient` |
| SVG (progress rings, checkmarks) | `react-native-svg` |
| Navigation | `@react-navigation/native` (native-stack + bottom-tabs) |
| Safe areas | `react-native-safe-area-context` |

### Design Tokens File Structure
```
/theme
  ├── colors.ts       // palette from Section 2
  ├── typography.ts    // scale from Section 3
  ├── spacing.ts        // Section 5
  ├── radii.ts            // Section 5
  ├── shadows.ts          // Section 6
  ├── springs.ts             // Section 7
  └── index.ts               // exports a single `theme` object
```

### Quick Agent Prompts
- "Build a Class Booking Card: `bg.surface` (#121714), 20px radius, 140px hero image top-clipped 14px, spots-left badge top-right in `bg.elevated`, `shadows.card`, press scale to 0.98 with `springs.snappy`."
- "Build the primary CTA button: `brand.green` background, `text.onGreen`, Sora SemiBold 15px, 52px height, 16px radius, `shadows.ctaGlow`, press scale 0.97 + light haptic on press."
- "Build the bottom tab bar: blurred `bg.surface` (expo-blur, dark tint), 64px + safe-area-bottom, active icon/label `brand.green` with a 4px animated indicator dot."
- "Build a time-slot picker: horizontal scroll of pills, `bg.surfaceAlt` default, `brand.greenMuted` + green border when selected, disabled slots at 40% opacity."

### Iteration Guide
1. Establish the charcoal base (`#0B0F0D` → `#1D2420`) before placing any content
2. Load Sora + Inter first — nothing should render in system font
3. Build the Class Booking Card — it's the atomic unit the rest of the app orbits around
4. Wire up `springs.snappy` press feedback globally before adding screens
5. Reserve green exclusively for booking/confirm/live moments — audit every screen for accidental green
6. Layer shadows last, tuning `shadows.ctaGlow` specifically for Android via the blurred-view fallback
