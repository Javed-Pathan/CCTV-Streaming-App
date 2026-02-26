import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Video } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo entrance
    opacity.value = withSpring(1, { duration: 800 });
    scale.value = withSequence(
      withSpring(1.2, { duration: 600 }),
      withSpring(1, { duration: 400 })
    );

    // Navigate to home after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={animatedStyle} className="items-center">
          {/* Logo Icon */}
          <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-6 shadow-lg">
            <Video size={48} className="text-primary-foreground" />
          </View>

          {/* App Name */}
          <Text className="text-4xl font-bold text-foreground text-center mb-3">
            CCTV Live Stream
          </Text>
          
          {/* Tagline */}
          <Text className="text-lg text-muted-foreground text-center">
            Monitor Your Cameras Anywhere
          </Text>
        </Animated.View>

        {/* Version */}
        <View className="absolute bottom-12">
          <Text className="text-sm text-muted-foreground">Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}