import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/global.css";
import { cssInterop } from "nativewind";
import * as LucideIcons from "lucide-react-native";

// Fix Lucide icons not respecting theme colors in NativeWind v4
Object.values(LucideIcons).forEach((Icon: any) => {
  if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
    cssInterop(Icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          fill: true,
        },
      },
    });
  }
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="add-camera" />
          <Stack.Screen name="live-stream" />
          <Stack.Screen name="snapshot-gallery" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}