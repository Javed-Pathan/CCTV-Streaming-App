import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StreamState = 'loading' | 'playing' | 'error';

export default function TestStreamScreen() {
    const router = useRouter();
    const [streamState, setStreamState] = useState<StreamState>('loading');

    // HARDCODED camera details as requested
    const RTSP_URL = 'rtsp://demo:Demo@123@192.168.1.26:554';

    console.log('[TestStream] Initializing with URL:', RTSP_URL);

    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';

    // Only initialize player on Android
    const player = isAndroid ? useVideoPlayer(RTSP_URL, (player) => {
        player.loop = true;
        player.play();
    }) : null;

    useEffect(() => {
        if (!player) return;

        const subscription = player.addListener('statusChange', (status) => {
            console.log('[TestStream] Player status:', status.status);

            if (status.status === 'readyToPlay') {
                setStreamState('playing');
            } else if (status.status === 'error') {
                console.error('[TestStream] Error:', status.error);
                setStreamState('error');
            }
        });

        return () => {
            subscription.remove();
        };
    }, [player]);

    // iOS Warning Screen
    if (isIOS) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
                <AlertCircle size={48} color="#f59e0b" />
                <Text className="text-white text-xl font-bold mb-4 mt-4 text-center">iOS Limitation</Text>
                <Text className="text-gray-400 text-center mb-4">
                    iOS does not natively support RTSP streams in Expo Go.
                </Text>
                <Text className="text-blue-400 text-center text-sm mb-4">
                    Please use an Android device to test RTSP streaming, or use VLC app.
                </Text>
                <Text className="text-gray-500 text-xs text-center bg-black/50 p-3 rounded mb-6">
                    {RTSP_URL}
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-3 rounded-lg">
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-10 p-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="bg-black/60 p-2 rounded-full">
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>

                {streamState === 'playing' && (
                    <View className="bg-red-500/80 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">● LIVE</Text>
                    </View>
                )}
            </View>

            {/* Video Player */}
            <View className="flex-1">
                {player && (
                    <VideoView
                        style={styles.video}
                        player={player}
                        allowsFullscreen
                        contentFit="contain"
                    />
                )}

                {/* Loading Overlay */}
                {streamState === 'loading' && (
                    <View className="absolute inset-0 items-center justify-center bg-black/80">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="text-white text-lg mt-4">Connecting to camera...</Text>
                        <Text className="text-gray-400 text-sm mt-2">{RTSP_URL}</Text>
                    </View>
                )}

                {/* Error Overlay */}
                {streamState === 'error' && (
                    <View className="absolute inset-0 items-center justify-center bg-black/80 px-6">
                        <Text className="text-red-500 text-xl font-bold mb-4">Connection Failed</Text>
                        <Text className="text-gray-400 text-center mb-2">
                            Unable to connect to the camera stream.
                        </Text>
                        <Text className="text-gray-500 text-xs text-center mb-6">
                            URL: {RTSP_URL}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-primary px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Bottom Info */}
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <Text className="text-white text-xl font-bold">Demo Camera Test</Text>
                <Text className="text-gray-300 text-sm">192.168.1.26:554</Text>
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
