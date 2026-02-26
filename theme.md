# Theme Configuration Guide

This document provides instructions for modifying the app's theme, including colors, and design tokens.

## Overview

The theming system uses CSS variables with NativeWind (Tailwind CSS for React Native). Theme values are defined in `theme.ts` and consumed via Tailwind classes.

**Key files:**

- `theme.ts` - Theme variables (colors, radius)
- `tailwind.config.js` - Tailwind configuration mapping CSS variables to classes
- `components/ThemeProvider.tsx` - Theme context provider

---

## Modifying Colors

### File: `theme.ts`

Colors are defined as RGB space-separated values (e.g., `"255 255 255"` for white) to support Tailwind's alpha modifier.

### Light Theme Colors

```typescript
export const lightTheme = vars({
  '--background': '255 255 255', // Page background
  '--foreground': '23 23 23', // Primary text

  '--card': '255 255 255', // Card background
  '--card-foreground': '23 23 23', // Card text

  '--primary': '24 24 27', // Primary buttons/actions
  '--primary-foreground': '250 250 250', // Text on primary

  '--secondary': '244 244 245', // Secondary buttons
  '--secondary-foreground': '24 24 27', // Text on secondary

  '--muted': '244 244 245', // Muted backgrounds
  '--muted-foreground': '113 113 122', // Subtle text

  '--accent': '244 244 245', // Accent highlights
  '--accent-foreground': '24 24 27', // Text on accent

  '--destructive': '220 38 38', // Error/danger actions

  '--border': '228 228 231', // Borders
  '--input': '228 228 231', // Input backgrounds
  '--ring': '161 161 170', // Focus rings
});
```

### Dark Theme Colors

```typescript
export const darkTheme = vars({
  '--background': '23 23 23', // Page background
  '--foreground': '250 250 250', // Primary text

  '--card': '30 30 30', // Card background
  '--card-foreground': '250 250 250', // Card text

  '--primary': '228 228 231', // Primary buttons
  '--primary-foreground': '24 24 27', // Text on primary

  // ... similar pattern for other colors
});
```

### How to Change a Color

1. **Choose a color that fits your app's personality** (see "Choosing the Right Color Palette" below)
2. **Pick your color** in hex format (e.g., `#14B8A6` for teal)
3. **Convert to RGB space-separated**: `20 184 166`
4. **Update the variable** in both `lightTheme` and `darkTheme`

**Example - Change primary to vibrant coral for a fitness app:**

```typescript
// In lightTheme:
"--primary": "251 113 133",          // Coral (#FB7185)
"--primary-foreground": "255 255 255", // White text

// In darkTheme:
"--primary": "251 113 133",          // Keep coral vibrant
"--primary-foreground": "255 255 255", // White text on coral
```

### Popular Color Conversion Reference

| Color      | Hex       | RGB Space-Separated |
| ---------- | --------- | ------------------- |
| Coral      | `#FB7185` | `251 113 133`       |
| Emerald    | `#059669` | `5 150 105`         |
| Violet     | `#8B5CF6` | `139 92 246`        |
| Teal       | `#14B8A6` | `20 184 166`        |
| Terracotta | `#C2410C` | `194 65 12`         |
| Amber      | `#F59E0B` | `245 158 11`        |
| Magenta    | `#D946EF` | `217 70 239`        |
| Charcoal   | `#374151` | `55 65 81`          |

---

## Semantic Color Tokens

| Token                  | Usage                      | Tailwind Class              |
| ---------------------- | -------------------------- | --------------------------- |
| `background`           | Page backgrounds           | `bg-background`             |
| `foreground`           | Primary text               | `text-foreground`           |
| `card`                 | Card/surface backgrounds   | `bg-card`                   |
| `card-foreground`      | Text on cards              | `text-card-foreground`      |
| `primary`              | Primary buttons, CTAs      | `bg-primary`                |
| `primary-foreground`   | Text on primary elements   | `text-primary-foreground`   |
| `secondary`            | Secondary buttons          | `bg-secondary`              |
| `secondary-foreground` | Text on secondary          | `text-secondary-foreground` |
| `muted`                | Muted/disabled backgrounds | `bg-muted`                  |
| `muted-foreground`     | Subtle/secondary text      | `text-muted-foreground`     |
| `accent`               | Accent highlights          | `bg-accent`                 |
| `accent-foreground`    | Text on accent             | `text-accent-foreground`    |
| `destructive`          | Error/danger states        | `bg-destructive`            |
| `border`               | Borders                    | `border-border`             |
| `input`                | Input field backgrounds    | `bg-input`                  |
| `ring`                 | Focus rings                | `ring-ring`                 |

### Chart Colors

For data visualizations:

- `--chart-1` through `--chart-5`: Five distinct colors for charts
- Usage: `bg-chart-1`, `text-chart-2`, etc.

### Sidebar Colors (if using sidebar navigation)

- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

---

## Border Radius

The `--radius` variable controls the base border radius. All radius utilities scale from this base.

```typescript
"--radius": "10", // Base radius in pixels
```

**Tailwind mapping:**

- `rounded-sm` = `calc(var(--radius) * 0.5)` = 5px
- `rounded` / `rounded-md` = `var(--radius)` = 10px
- `rounded-lg` = `calc(var(--radius) * 1.5)` = 15px

**To change:** Update `--radius` in both `lightTheme` and `darkTheme`.

## Choosing the Right Color Palette

> **BE CREATIVE!** Every app deserves a unique, memorable palette. Avoid defaulting to generic blue—choose colors that express the app's personality and purpose.

### Color Psychology Guide

| Emotion/Purpose       | Primary Colors                                               | Best For                         |
| --------------------- | ------------------------------------------------------------ | -------------------------------- |
| **Energy & Action**   | Coral `#FB7185`, Orange `#F97316`, Hot Pink `#EC4899`        | Fitness, Sports, Gaming, Social  |
| **Trust & Calm**      | Teal `#14B8A6`, Sage `#84CC16`, Soft Blue `#0EA5E9`          | Finance, Health, Meditation      |
| **Luxury & Premium**  | Deep Purple `#7C3AED`, Gold `#CA8A04`, Emerald `#059669`     | Fashion, Premium Services        |
| **Creativity & Fun**  | Violet `#8B5CF6`, Magenta `#D946EF`, Lime `#84CC16`          | Art, Music, Kids, Creative Tools |
| **Modern & Minimal**  | Charcoal `#374151`, Warm Gray `#78716C`, Olive `#4D7C0F`     | Productivity, Notes, Utilities   |
| **Nature & Wellness** | Forest `#166534`, Terracotta `#C2410C`, Sand `#D4A574`       | Outdoor, Eco, Organic, Wellness  |
| **Bold & Confident**  | Indigo `#4F46E5`, Crimson `#DC2626`, Cyan `#06B6D4`          | Startups, Tech, Bold Brands      |

### App Category → Palette Suggestions

| Category            | Suggested Palettes                                        |
| ------------------- | --------------------------------------------------------- |
| Fitness/Sports      | Coral + charcoal, Orange + navy, Lime + black             |
| Finance/Business    | Emerald + cream, Navy + gold, Teal + slate                |
| Social/Dating       | Coral + peach, Violet + lavender, Orange-to-pink gradient |
| Food/Restaurant     | Orange + cream, Burgundy + beige, Green + brown           |
| Productivity/Notes  | Charcoal + white, Olive + off-white, Sage + gray          |
| Music/Entertainment | Purple + black, Magenta + navy, Cyan + charcoal           |
| E-commerce/Shopping | Black + gold, Coral + white, Purple + pink                |
| Travel/Lifestyle    | Teal + beige, Orange + sky blue, Forest green + cream     |

---

## Theme Examples

Below are 3 complete themes covering different app types. Use these as starting points.

### 1. Energetic Coral (Fitness, Social, Action)

```typescript
// Light
export const lightTheme = vars({
  '--radius': '14',
  '--background': '255 251 250', '--foreground': '41 37 36',
  '--card': '255 255 255', '--card-foreground': '41 37 36',
  '--primary': '251 113 133', '--primary-foreground': '255 255 255',
  '--secondary': '255 228 230', '--secondary-foreground': '159 18 57',
  '--muted': '250 245 245', '--muted-foreground': '120 113 108',
  '--accent': '253 164 175', '--accent-foreground': '136 19 55',
  '--destructive': '220 38 38',
  '--border': '245 235 233', '--input': '250 245 245', '--ring': '251 113 133',
});
// Dark
export const darkTheme = vars({
  '--radius': '14',
  '--background': '28 25 23', '--foreground': '250 250 249',
  '--card': '41 37 36', '--card-foreground': '250 250 249',
  '--primary': '251 113 133', '--primary-foreground': '255 255 255',
  '--secondary': '68 64 60', '--secondary-foreground': '253 164 175',
  '--muted': '68 64 60', '--muted-foreground': '168 162 158',
  '--accent': '159 18 57', '--accent-foreground': '255 228 230',
  '--destructive': '248 113 113',
  '--border': '68 64 60', '--input': '68 64 60', '--ring': '251 113 133',
});
```

### 2. Deep Emerald (Finance, Premium, Trust)

```typescript
// Light
export const lightTheme = vars({
  '--radius': '10',
  '--background': '250 253 251', '--foreground': '20 30 26',
  '--card': '255 255 255', '--card-foreground': '20 30 26',
  '--primary': '5 150 105', '--primary-foreground': '255 255 255',
  '--secondary': '209 250 229', '--secondary-foreground': '6 78 59',
  '--muted': '243 244 246', '--muted-foreground': '107 114 128',
  '--accent': '167 243 208', '--accent-foreground': '6 78 59',
  '--destructive': '220 38 38',
  '--border': '220 230 225', '--input': '243 244 246', '--ring': '5 150 105',
});
// Dark
export const darkTheme = vars({
  '--radius': '10',
  '--background': '10 20 16', '--foreground': '240 253 244',
  '--card': '20 35 28', '--card-foreground': '240 253 244',
  '--primary': '52 211 153', '--primary-foreground': '6 78 59',
  '--secondary': '30 50 40', '--secondary-foreground': '167 243 208',
  '--muted': '30 50 40', '--muted-foreground': '134 179 158',
  '--accent': '6 95 70', '--accent-foreground': '209 250 229',
  '--destructive': '248 113 113',
  '--border': '30 50 40', '--input': '30 50 40', '--ring': '52 211 153',
});
```

### 3. Vibrant Violet (Creative, Entertainment, Music)

```typescript
// Light
export const lightTheme = vars({
  '--radius': '16',
  '--background': '253 251 255', '--foreground': '30 27 36',
  '--card': '255 255 255', '--card-foreground': '30 27 36',
  '--primary': '139 92 246', '--primary-foreground': '255 255 255',
  '--secondary': '237 233 254', '--secondary-foreground': '91 33 182',
  '--muted': '245 243 255', '--muted-foreground': '113 113 122',
  '--accent': '196 181 253', '--accent-foreground': '76 29 149',
  '--destructive': '220 38 38',
  '--border': '233 228 250', '--input': '245 243 255', '--ring': '139 92 246',
});
// Dark
export const darkTheme = vars({
  '--radius': '16',
  '--background': '18 15 26', '--foreground': '250 250 255',
  '--card': '30 27 45', '--card-foreground': '250 250 255',
  '--primary': '167 139 250', '--primary-foreground': '30 27 36',
  '--secondary': '46 38 75', '--secondary-foreground': '221 214 254',
  '--muted': '46 38 75', '--muted-foreground': '156 150 180',
  '--accent': '91 33 182', '--accent-foreground': '237 233 254',
  '--destructive': '248 113 113',
  '--border': '46 38 75', '--input': '46 38 75', '--ring': '167 139 250',
});
```

### Quick Reference: More Palettes

| Theme        | Primary (Light) | Primary (Dark) | Radius | Use For                    |
| ------------ | --------------- | -------------- | ------ | -------------------------- |
| Terracotta   | `194 65 12`     | `251 146 60`   | 12     | Food, Lifestyle, Organic   |
| Charcoal     | `55 65 81`      | `229 231 235`  | 8      | Productivity, Notes, Utils |
| Ocean Teal   | `20 184 166`    | `94 234 212`   | 14     | Travel, Wellness, Calm     |

---

## Design Principles

1. **Pick memorable colors** - Your primary color defines the brand. Avoid generic choices.
2. **Build cohesive families** - Secondary should be lighter/softer, accent should pop, muted should be desaturated.
3. **Ensure contrast** - 4.5:1 minimum ratio for text readability.
4. **Dark mode tips** - Lighten primary slightly, use rich backgrounds (not pure black), reduce harsh contrast.
5. **Match radius to personality** - Playful: 14-20px, Modern: 10-12px, Professional: 6-8px, Minimal: 0-4px

### Add a Custom Font (e.g., Girassol)

> **⚠️ IMPORTANT: Font Restriction** - Only fonts available in the `fontList` array given below can be used. Never use any font that is not present in this list.

```ts
export const fontList = [
  'Inter',
  'Roboto',
  'JetBrains Mono',
  'Cedarville Cursive',
  'Girassol',

  // NEW
  'Poppins',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans 3',
  'Nunito',
  'Merriweather',
  'Playfair Display',
  'Ubuntu',
  'DM Sans',
  'Work Sans',
  'Oswald',
  'Inconsolata',
  'Fira Code',
  'PT Sans',
  'PT Serif',
  'Raleway',
  'Manrope',
  'Outfit',
  'Mulish',
];
```
To update the font in your project, follow these steps:
1. **Install the Expo Google Font package** by adding it to `package.json` under `dependencies`:

```json
"@expo-google-fonts/girassol": "^0.4.1"
```

2. **Load the font globally** (required for mobile) in `_layout.tsx` or `App.tsx` using `useFonts`. This step is mandatory for Expo / React Native mobile apps.

Example:

```tsx
import { useFonts, Girassol_400Regular } from '@expo-google-fonts/girassol';

const [fontsLoaded] = useFonts({
  Girassol_400Regular,
});

if (!fontsLoaded) return null;
```

3. **Register the font in Tailwind** by editing `tailwind.config.js` and adding an entry inside `theme.extend.fontFamily`:

```js
fontFamily: {
  // ...other fonts
  girassol: ['Girassol_400Regular'],
},
```

4. **Use the font in your components** via Tailwind classes, for example:

```tsx
<Text className="font-girassol text-xl">Hello with Girassol font</Text>
```

Once configured, `font-girassol` will be available alongside your other font utilities.

---

## Quick Reference

### Choose a Theme for Your App

1. **Identify your app category** (fitness, finance, social, etc.)
2. **Refer to "App Category → Palette Suggestions"** above
3. **Pick a theme example** that matches or customize your own
4. **Copy the complete lightTheme and darkTheme** into your `theme.ts`

### Change Primary Color

1. Open `theme.ts`
2. Find `"--primary"` in both `lightTheme` and `darkTheme`
3. Update RGB values to a color that matches your app's personality
4. Update `"--primary-foreground"` for text contrast
5. Consider updating `"--ring"` to match your primary

### Add a New Color Token

1. Add variable to `lightTheme` and `darkTheme` in `theme.ts`
2. Add color mapping in `tailwind.config.js` under `theme.extend.colors`
3. Add to safelist pattern if needed

---

## Troubleshooting

### Dark mode not working?

- Ensure `ThemeProvider` wraps your app in `_layout.tsx`
- Check `darkMode: 'class'` is set in `tailwind.config.js`
