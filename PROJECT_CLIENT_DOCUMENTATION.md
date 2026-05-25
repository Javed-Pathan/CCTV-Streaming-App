# CCTV Streaming App - Client Documentation

## 1. Project Overview

**Project Name:** CCTV Streaming App  
**Codebase Type:** Expo + React Native mobile app (Android/iOS) with Expo Router  
**Primary Purpose:** Manage CCTV camera entries, view live stream, capture snapshots, and manage snapshot gallery.

This application allows end users to:
- Add and manage CCTV camera endpoints.
- Open a live stream screen for configured cameras.
- Capture snapshots from live stream.
- Save snapshots in-app and to device photo library (when permission is granted).
- Review, select, and delete snapshots from a gallery view.

## 2. Platform & Technology Stack

### 2.1 Application Layer
- React 19
- React Native 0.81.5
- Expo SDK 54
- Expo Router (file-based routing)
- TypeScript
- NativeWind + Tailwind CSS utility classes
- React Native Reanimated

### 2.2 Media & Device Modules
- `react-native-vlc-media-player` (RTSP stream playback + snapshot event support)
- `expo-media-library` (save snapshots to device gallery)
- `expo-file-system` (local file persistence)
- `@react-native-async-storage/async-storage` (camera and snapshot metadata storage)

### 2.3 Native Build
- Android Gradle Plugin + Gradle 8.14.3
- NDK 27.1.12297006
- Kotlin (managed via Expo/RN plugins)
- iOS CocoaPods with Hermes enabled

## 3. Functional Scope

### 3.1 Splash & Navigation
- App starts on `app/index.tsx` splash screen.
- After 3 seconds, route transitions to `/home`.
- Route stack is declared in `app/_layout.tsx`.

### 3.2 Camera Management
- Camera list displayed on Home screen.
- Search camera by name or location.
- Add camera with form validation.
- Delete existing camera with confirmation.
- Camera status represented as online/offline in UI.

### 3.3 Live Stream
- Live stream opened with camera id via route params.
- RTSP URL built from stored camera fields.
- Stream state handling: loading, buffering, playing, error.
- Reconnect option available when stream fails.

### 3.4 Snapshot Capture & Gallery
- Snapshot can be triggered while stream is playing.
- Snapshot file is written to app storage.
- App attempts to save snapshot to device photo library.
- Gallery supports grouped display by date.
- Single and multi-select delete workflows available.
- Gallery currently includes a seeded Europe demo snapshot dataset (one-time seed).

## 4. Screen-by-Screen Behavior

### 4.1 `app/index.tsx` (Splash)
- Animated app intro (scale + opacity).
- Branded icon, title, tagline.
- Auto-redirect to Home after timeout.

### 4.2 `app/home.tsx` (Camera Dashboard)
- Reads all cameras from AsyncStorage.
- Displays summary cards: online, offline, total.
- Search and filter logic.
- Opens live stream only for online cameras.
- Delete camera confirmation flow.
- Entry points to Add Camera and Snapshot Gallery.

### 4.3 `app/add-camera.tsx` (Camera Form)
- Form fields: name, IP, port, protocol, username, password, location.
- Validation:
  - required fields
  - IP format check
  - port range check (1-65535)
- Connectivity test is simulated (demo behavior).
- Save persists record to AsyncStorage with generated id and timestamps.

### 4.4 `app/live-stream.tsx` (RTSP Player)
- Loads selected camera by id from storage.
- Builds RTSP URL (currently for `RTSP` protocol).
- Integrates custom `VLCPlayer` wrapper.
- Manages stream overlays for loading/error/live state.
- Snapshot workflow:
  - trigger native VLC snapshot
  - process success/error callback
  - persist snapshot metadata
  - save image to media library if permitted

### 4.5 `app/snapshot-gallery.tsx` (Snapshot Manager)
- Loads and displays snapshots from storage.
- One-time seeding of demo Europe images.
- Date-grouped gallery rendering.
- Preview modal with camera/location/timestamp details.
- Actions: select mode, select all, delete selected, delete all, delete single.
- Share action currently stubbed (`not implemented`).

### 4.6 `app/test-stream.tsx` (Diagnostic Screen)
- Uses hardcoded RTSP URL for testing.
- Android-focused test behavior using `expo-video`.
- iOS shows RTSP limitation message in Expo Go context.

### 4.7 `app/modal.tsx`
- Template screen from starter scaffold.
- Not part of main CCTV flow.

## 5. Data Model & Storage

### 5.1 Types (`types/camera.ts`)
- `Camera`
- `CameraFormData`
- `Snapshot`

### 5.2 AsyncStorage Keys
- Cameras: `@cctv_cameras`
- Snapshots: `cctv_snapshots`
- Seed marker: `europe_snapshots_seeded`
- Theme preference: `app_theme_preference`

### 5.3 Storage Modules
- `lib/storage.ts`
  - `saveCamera`
  - `getCameras`
  - `deleteCamera`
  - `updateCamera`
  - `getCameraById`
  - `clearAllCameras`
- `lib/snapshot.ts`
  - `seedEuropeSnapshots`
  - `saveSnapshot`
  - `getSnapshots`
  - `deleteSnapshot`
  - `deleteSnapshots`
  - `clearAllSnapshots`

## 6. UI Theming & Design System

- Theme provider persists dark/light mode preference.
- CSS variable-based theme tokens in `constants/theme.ts`.
- Tailwind utility classes used throughout screens.
- Lucide icon interoperability configured in `app/_layout.tsx` via `cssInterop`.

## 7. Native & Build Configuration

### 7.1 Android
- Package id: `com.kevin003.exponativewind`
- SDK targets configured for API 35 (compile/target), min SDK 26.
- New Architecture enabled.
- Hermes enabled.
- Release signing config present in Gradle configuration.

### 7.2 iOS
- Bundle identifier: `com.kevin003.exponativewind`
- Hermes enabled (Podfile properties).
- URL schemes configured for deep link support.
- Privacy permission strings configured (camera and photo library).

## 8. Permissions Used

### 8.1 Android
- INTERNET
- CAMERA
- READ/WRITE external storage related permissions
- media-related read permissions
- ACCESS_MEDIA_LOCATION

### 8.2 iOS
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

## 9. Patch Applied

A patch exists at `patches/react-native-vlc-media-player+1.0.98.patch`.

Purpose of patch:
- Improves snapshot callback behavior so `onSnapshot` is triggered consistently.
- Adds nil-safe callback/event payload handling in iOS native implementation.

## 10. Build and Release Notes

### 10.1 Is a device required to build release APK?
No. A physical Android device is **not required** to build a release APK.  
`./gradlew assembleRelease` can run locally without device connection.

### 10.2 Current Known Build Blocker
Recent release-build failures are caused by **insufficient disk space** (`No space left on device`), not by application logic defects.

Observed failure points include:
- `:app:mergeReleaseNativeLibs`
- multiple `extractReleaseAnnotations` tasks
- Gradle cache lock release failures after disk exhaustion

Recommended operational fix:
- Ensure significant free disk space before release build (preferably 15-20 GB+ free for stable native builds).
- Periodically clear Gradle and build caches when storage is constrained.

## 11. File-by-File Inventory (Source/Config)

### 11.1 Root Configuration
- `README.md` - starter Expo readme.
- `package.json` - dependencies and npm scripts.
- `package-lock.json` - npm lockfile.
- `app.json` - Expo app configuration and plugin setup.
- `babel.config.js` - Babel presets/plugins.
- `metro.config.js` - Metro + NativeWind config.
- `tailwind.config.js` - Tailwind theme and safelist.
- `tsconfig.json` - TypeScript options and path aliases.
- `eslint.config.js` - lint configuration.
- `global.css` - Tailwind layer directives.
- `eas.json` - EAS build profile config.
- `rapidnative.json` - path metadata.

### 11.2 App Routes
- `app/_layout.tsx`
- `app/index.tsx`
- `app/home.tsx`
- `app/add-camera.tsx`
- `app/live-stream.tsx`
- `app/snapshot-gallery.tsx`
- `app/test-stream.tsx`
- `app/modal.tsx`

### 11.3 Components
- `components/VLCPlayer.tsx`
- `components/ThemeProvider.tsx`
- `components/ThemeToggle.tsx`
- `components/themed-text.tsx`
- `components/themed-view.tsx`
- `components/external-link.tsx`
- `components/haptic-tab.tsx`
- `components/hello-wave.tsx`
- `components/parallax-scroll-view.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/icon-symbol.tsx`
- `components/ui/icon-symbol.ios.tsx`

### 11.4 Libraries, Hooks, Types, Constants
- `lib/storage.ts`
- `lib/snapshot.ts`
- `lib/cva.ts`
- `hooks/use-color-scheme.ts`
- `hooks/use-color-scheme.web.ts`
- `hooks/use-theme-color.ts`
- `types/camera.ts`
- `constants/theme.ts`

### 11.5 Native Android
- `android/build.gradle`
- `android/gradle.properties`
- `android/settings.gradle`
- `android/gradlew`
- `android/gradlew.bat`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradle/wrapper/gradle-wrapper.jar`
- `android/app/build.gradle`
- `android/app/proguard-rules.pro`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/kevin003/exponativewind/MainApplication.kt`
- `android/app/src/main/java/com/kevin003/exponativewind/MainActivity.kt`
- `android/app/src/debug/AndroidManifest.xml`
- `android/app/src/debugOptimized/AndroidManifest.xml`
- Android resource files under `android/app/src/main/res/...` (launcher icons, splash assets, colors, strings, styles).

### 11.6 Native iOS
- `ios/Podfile`
- `ios/Podfile.lock`
- `ios/Podfile.properties.json`
- `ios/exponativewind/AppDelegate.swift`
- `ios/exponativewind/Info.plist`
- `ios/exponativewind/exponativewind.entitlements`
- `ios/exponativewind/exponativewind-Bridging-Header.h`
- `ios/exponativewind/PrivacyInfo.xcprivacy`
- `ios/exponativewind/SplashScreen.storyboard`
- `ios/exponativewind/Supporting/Expo.plist`
- `ios/exponativewind.xcodeproj/...` project files
- iOS asset catalog files under `ios/exponativewind/Images.xcassets/...`

### 11.7 Assets & Patches
- `assets/images/...` app icons and splash assets.
- `assets/images/europe/...` seeded gallery demo images.
- `patches/react-native-vlc-media-player+1.0.98.patch` snapshot callback fix.

### 11.8 Utility/Meta
- `scripts/reset-project.js` scaffold reset utility.
- `layout.md`, `theme.md` project notes/reference docs.
- Build logs: `build_log*.txt` (diagnostic output files).

## 12. Functional Limitations / Notes for Client

- Camera connectivity test in Add Camera screen is currently simulated.
- Share action in Snapshot Gallery is currently placeholder (not implemented).
- RTSP playback behavior can vary by platform/runtime and stream source.
- iOS Expo Go has RTSP limitations; native build is preferred for real testing.

## 13. Security & Operational Notes

- Camera credentials are currently entered and stored as plain fields in local storage model.
- Release signing values are configured in Android Gradle properties.
- For production readiness, secure credential handling and secret management policy should be reviewed.

## 14. Suggested Client Delivery Summary

This app is a mobile CCTV monitoring client with camera management, RTSP stream viewing, snapshot capture, and gallery management. The core user flow is implemented end-to-end, with themed UI and native module integration for media operations. Current build issues observed are environment/storage related rather than functional feature defects.

