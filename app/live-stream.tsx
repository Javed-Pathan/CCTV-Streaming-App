import { StreamState, VLCPlayer, VLCPlayerMethods } from '@/components/VLCPlayer';
import { saveSnapshot } from '@/lib/snapshot';
import { getCameraById } from '@/lib/storage';
import { Camera as CameraType } from '@/types/camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, RotateCw, WifiOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';

export default function LiveStreamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vlcPlayerRef = useRef<VLCPlayerMethods>(null);


  const [camera, setCamera] = useState<CameraType | null>(null);
  const [streamState, setStreamState] = useState<StreamState>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // ... (getRtspUrl, useEffect loadCamera, handleReconnect, handleStateChange)
  // Construct RTSP URL from camera data (raw credentials as user requested)
  const getRtspUrl = (): string => {
    if (!camera) return '';

    const { username, password, ip, port, protocol } = camera;

    if (protocol === 'RTSP') {
      const auth = username && password ? `${username}:${password}@` : '';
      return `rtsp://${auth}${ip}:${port}`;
    }

    return '';
  };

  const rtspUrl = getRtspUrl();

  // Load camera data from storage
  useEffect(() => {
    const loadCamera = async () => {
      if (params.cameraId) {
        const cameraData = await getCameraById(params.cameraId as string);
        if (cameraData) {
          setCamera(cameraData);
        } else {
          Alert.alert('Error', 'Camera not found');
          router.back();
        }
      }
    };
    loadCamera();
  }, [params.cameraId]);

  const handleReconnect = () => {
    setStreamState('loading');
    setRetryCount(prev => prev + 1);
  };

  const handleStateChange = (newState: StreamState) => {
    if (streamState === 'playing' && newState === 'loading') return;
    setStreamState(newState);
  };

  // Animation values
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const handleSnapshot = async () => {
    if (!camera || !vlcPlayerRef.current || streamState !== 'playing') {
      Alert.alert('Info', 'Snapshot can only be taken when stream is playing');
      return;
    }

    try {
      setIsCapturing(true);

      // Use stable legacy FileSystem.cacheDirectory (always ends with '/')
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) {
        throw new Error('Cache directory is not available');
      }

      // Ensure cache directory actually exists (critical on iOS)
      const cacheDirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!cacheDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }

      const fileName = `vlc_snapshot_${Date.now()}.jpg`;
      const fullUri = `${cacheDir}${fileName}`;

      // VLC native layer expects a raw POSIX path (no file:// prefix)
      const vlcPath = fullUri.startsWith('file://')
        ? fullUri.substring('file://'.length)
        : fullUri;

      console.log(`[LiveStream] Platform: ${Platform.OS}, Triggering snapshot to VLC path: ${vlcPath}`);
      vlcPlayerRef.current.snapshot(vlcPath);

      // Safety timeout: reset isCapturing after 10s if no snapshot event arrives
      setTimeout(() => {
        setIsCapturing((current) => {
          if (current) {
            console.warn('[LiveStream] Snapshot timeout — resetting isCapturing');
            Alert.alert('Timeout', 'Snapshot did not complete in time. Please try again.');
          }
          return false;
        });
      }, 10000);
    } catch (error: any) {
      setIsCapturing(false);
      console.error('[LiveStream] Snapshot trigger error:', error);
      Alert.alert('Error', `Failed to trigger snapshot: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSnapshotEvent = async (event: { success: boolean; path?: string; error?: string }) => {
    try {
      setIsCapturing(false);
      console.log('[LiveStream] Snapshot event received:', JSON.stringify(event));

      if (event.success && event.path && camera) {
        try {
          console.log(`[LiveStream] Calling saveSnapshot with path: ${event.path}`);
          await saveSnapshot(
            camera.id,
            camera.name,
            camera.location || 'Unknown Location',
            event.path
          );

          Alert.alert(
            'Snapshot Captured',
            'Snapshot saved to gallery and phone Photos successfully!',
            [
              { text: 'View Gallery', onPress: () => router.push('/snapshot-gallery') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } catch (saveError: any) {
          console.error('[LiveStream] Error in saveSnapshot handler:', saveError);
          Alert.alert('Error', `Failed to save snapshot: ${saveError.message || 'Unknown error'}`);
        }
      } else {
        const errMsg = event.error || 'Unknown snapshot error';
        console.error('[LiveStream] VLC Snapshot Error:', errMsg);
        Alert.alert('Error', `Failed to capture frame: ${errMsg}`);
      }
    } catch (outerError) {
      setIsCapturing(false);
      console.error('[LiveStream] Unexpected error in handleSnapshotEvent:', outerError);
      Alert.alert('Error', 'An unexpected error occurred during snapshot processing');
    }
  };

  const renderStreamContent = () => {
    if (streamState === 'error') {
      return (
        <View className="absolute inset-0 items-center justify-center bg-black/90 px-6">
          <WifiOff size={48} color="#ef4444" />
          <Text className="text-white text-xl font-bold text-center mt-4">Connection Failed</Text>
          <Text className="text-gray-400 text-center mt-2 mb-6">Unable to connect to camera stream.</Text>
          <TouchableOpacity onPress={handleReconnect} className="bg-primary px-8 py-3 rounded-lg flex-row items-center gap-2">
            <RotateCw size={20} color="white" />
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (streamState === 'loading' || streamState === 'buffering') {
      return (
        <View className="absolute inset-0 items-center justify-center bg-black/40 pointer-events-none">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-white text-lg font-semibold mt-4">
            {streamState === 'loading' ? 'Connecting...' : 'Buffering...'}
          </Text>
        </View>
      );
    }

    return null;
  };

  if (!camera) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 relative">
        {/* VLC Video Player */}
        {rtspUrl ? (
          <VLCPlayer
            ref={vlcPlayerRef}
            key={`${rtspUrl}-${retryCount}`}
            url={rtspUrl}
            onStateChange={handleStateChange}
            onSnapshot={handleSnapshotEvent}
            style={styles.video}
          />
        ) : (
          <View style={styles.video} className="bg-black" />
        )}

        {/* Overlays */}
        {renderStreamContent()}

        {/* UI Overlay */}
        <View className="absolute top-0 left-0 right-0 p-4 flex-row justify-between items-start pointer-events-box-none">
          <TouchableOpacity onPress={() => router.back()} className="bg-black/40 p-2 rounded-full">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          {streamState === 'playing' && (
            <View className="flex-row items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
              <Animated.View style={pulseStyle}>
                <View className="w-2 h-2 bg-red-500 rounded-full" />
              </Animated.View>
              <Text className="text-white text-xs font-bold">LIVE</Text>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-20">
          <Text className="text-white text-xl font-bold">{camera.name}</Text>
          <Text className="text-gray-300 text-sm mb-4">{camera.location}</Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-4" />
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleSnapshot}
                disabled={isCapturing || streamState !== 'playing'}
                className={`p-3 rounded-full ${isCapturing ? 'bg-gray-500' : 'bg-white/20'}`}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Camera size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});