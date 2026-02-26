import { ThemeToggle } from '@/components/ThemeToggle';
import { deleteCamera, getCameras } from '@/lib/storage';
import { Camera } from '@/types/camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image as ImageIcon, Play, Plus, Search, Trash2, Video, Wifi, WifiOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load cameras from storage when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCameras();
    }, [])
  );

  const loadCameras = async () => {
    try {
      setLoading(true);
      const storedCameras = await getCameras();
      setCameras(storedCameras);
    } catch (error) {
      console.error('Error loading cameras:', error);
      Alert.alert('Error', 'Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const offlineCameras = cameras.filter(c => c.status === 'offline').length;

  const handleDeleteCamera = async (id: string) => {
    Alert.alert(
      'Delete Camera',
      'Are you sure you want to remove this camera?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCamera(id);
              await loadCameras(); // Reload cameras after deletion
            } catch (error) {
              Alert.alert('Error', 'Failed to delete camera');
            }
          }
        }
      ]
    );
  };

  const handleViewStream = (camera: Camera) => {
    if (camera.status === 'offline') {
      Alert.alert('Camera Offline', 'This camera is currently offline. Please check the connection.');
      return;
    }
    router.push({
      pathname: '/live-stream',
      params: { cameraId: camera.id, cameraName: camera.name }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">My Cameras</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              {cameras.length} camera{cameras.length !== 1 ? 's' : ''} configured
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.push('/snapshot-gallery')}>
              <ImageIcon size={24} className="text-foreground" />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
          <Search size={20} className="text-muted-foreground mr-3" />
          <TextInput
            placeholder="Search cameras..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-foreground"
          />
        </View>

        {/* Test Stream Button */}
        <TouchableOpacity
          onPress={() => router.push('/test-stream')}
          className="bg-blue-500 rounded-xl p-4 mt-3 flex-row items-center justify-center gap-2"
        >
          <Video size={20} color="white" />
          <Text className="text-white font-bold text-base">Test Demo Camera Stream</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Stats Cards */}
        <View className="px-6 py-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Wifi size={20} className="text-green-500" />
                <Text className="text-2xl font-bold text-foreground">{onlineCameras}</Text>
              </View>
              <Text className="text-sm text-muted-foreground">Online</Text>
            </View>

            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <WifiOff size={20} className="text-red-500" />
                <Text className="text-2xl font-bold text-foreground">{offlineCameras}</Text>
              </View>
              <Text className="text-sm text-muted-foreground">Offline</Text>
            </View>

            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Video size={20} className="text-primary" />
                <Text className="text-2xl font-bold text-foreground">{cameras.length}</Text>
              </View>
              <Text className="text-sm text-muted-foreground">Total</Text>
            </View>
          </View>
        </View>

        {/* Camera List */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">Camera List</Text>
            <TouchableOpacity
              onPress={() => router.push('/add-camera')}
              className="flex-row items-center bg-primary rounded-xl px-4 py-2"
            >
              <Plus size={18} className="text-primary-foreground mr-2" />
              <Text className="text-primary-foreground font-semibold">Add Camera</Text>
            </TouchableOpacity>
          </View>

          {filteredCameras.length === 0 ? (
            <View className="items-center py-12">
              <Video size={48} className="text-muted-foreground mb-4" />
              <Text className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No cameras found' : 'No cameras yet'}
              </Text>
              <Text className="text-muted-foreground text-center mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add your first camera to start monitoring'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  onPress={() => router.push('/add-camera')}
                  className="bg-primary rounded-xl px-6 py-3"
                >
                  <Text className="text-primary-foreground font-semibold">Add Camera</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="gap-3">
              {filteredCameras.map((camera, index) => (
                <Animated.View
                  key={camera.id}
                  entering={FadeInDown.delay(index * 100).springify()}
                >
                  <TouchableOpacity
                    onPress={() => handleViewStream(camera)}
                    className="bg-card rounded-2xl p-4 border border-border"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View
                            className={`w-2 h-2 rounded-full mr-2 ${camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                          />
                          <Text className="text-lg font-bold text-foreground">{camera.name}</Text>
                        </View>
                        <Text className="text-sm text-muted-foreground mb-1">
                          {camera.location}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {camera.ip}:{camera.port} • {camera.protocol}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => handleViewStream(camera)}
                          className="w-10 h-10 bg-primary rounded-xl items-center justify-center"
                        >
                          <Play size={18} className="text-primary-foreground" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteCamera(camera.id)}
                          className="w-10 h-10 bg-destructive/10 rounded-xl items-center justify-center"
                        >
                          <Trash2 size={18} className="text-destructive" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-border">
                      <View className="flex-row items-center">
                        {camera.status === 'online' ? (
                          <Wifi size={14} className="text-green-500 mr-2" />
                        ) : (
                          <WifiOff size={14} className="text-red-500 mr-2" />
                        )}
                        <Text
                          className={`text-xs font-medium ${camera.status === 'online' ? 'text-green-500' : 'text-red-500'
                            }`}
                        >
                          {camera.status === 'online' ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        Last seen: {camera.lastSeen}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}