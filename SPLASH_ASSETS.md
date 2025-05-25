# VibeScript Splash Screen Assets

## Required Assets

To complete the splash screen setup, you'll need to create the following image assets and place them in the `assets/` directory:

### 1. Splash Icon (`splash-icon.png`)

- **Size**: 1284x1284px (square)
- **Format**: PNG with transparent background
- **Content**: VibeScript logo - a circular gradient background with "V" letter
- **Colors**: Use the same gradient as the app: `#EC4899` → `#8B5CF6` → `#3B82F6`

### 2. App Icon (`icon.png`)

- **Size**: 1024x1024px
- **Format**: PNG
- **Content**: Same as splash icon but optimized for app icon use

### 3. Adaptive Icon (`adaptive-icon.png`)

- **Size**: 1024x1024px
- **Format**: PNG
- **Content**: Foreground layer for Android adaptive icon

### 4. Favicon (`favicon.png`)

- **Size**: 48x48px
- **Format**: PNG
- **Content**: Simplified version of the logo for web

## Design Guidelines

### Logo Design

1. **Circle Background**: Use linear gradient from pink to purple to blue
2. **Letter "V"**: White bold font, centered
3. **Shadow**: Subtle drop shadow for depth
4. **Style**: Modern, clean, matching the app's aesthetic

### Color Palette

- Primary Purple: `#5B21B6`
- Pink Accent: `#EC4899`
- Purple Mid: `#8B5CF6`
- Blue Accent: `#3B82F6`
- White Text: `#FFFFFF`

## Temporary Workaround

Until proper assets are created, the app will use:

- Default Expo splash screen with purple background
- Custom animated splash screen component with "V" logo
- Programmatic logo generation using LinearGradient

## Creating Assets

You can use design tools like:

- **Figma** (recommended)
- **Adobe Illustrator**
- **Canva**
- **Sketch**

Or generate them programmatically and export as PNG files.

## Asset Placement

```
assets/
├── icon.png           # Main app icon (1024x1024)
├── splash-icon.png    # Splash screen logo (1284x1284)
├── adaptive-icon.png  # Android adaptive icon (1024x1024)
└── favicon.png        # Web favicon (48x48)
```

## Testing

After adding assets:

1. Run `npx expo install` to refresh asset cache
2. Test on both iOS and Android simulators
3. Verify splash screen appears correctly
4. Check app icon in device home screen
