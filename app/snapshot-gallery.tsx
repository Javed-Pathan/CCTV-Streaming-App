import { clearAllSnapshots, deleteSnapshot, getSnapshots, deleteSnapshots, seedEuropeSnapshots } from '@/lib/snapshot';
import { Snapshot } from '@/types/camera';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { ArrowLeft, Trash2, Camera, Calendar, Clock, X, Share2, MapPin, CheckCircle2, Circle } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2; // 2 columns with padding

export default function SnapshotGalleryScreen() {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load snapshots when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSnapshots();
    }, [])
  );

  const handleShareSnapshot = (snapshot: Snapshot) => {
    Alert.alert('Share', 'Sharing functionality is not implemented yet.');
  };

  const loadSnapshots = async () => {
    await seedEuropeSnapshots();
    const data = await getSnapshots();
    setSnapshots(data);
  };

  const handleDeleteSnapshot = (id: string) => {
    Alert.alert(
      'Delete Snapshot',
      'Are you sure you want to delete this snapshot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSnapshot(id);
              await loadSnapshots();
              setModalVisible(false);
              Alert.alert('Success', 'Snapshot deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete snapshot');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Snapshots',
      'Are you sure you want to delete all snapshots? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllSnapshots();
              await loadSnapshots();
              Alert.alert('Success', 'All snapshots deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete snapshots');
            }
          },
        },
      ]
    );
  };

  const openPreview = (snapshot: Snapshot) => {
    if (isSelectionMode) {
      toggleSelection(snapshot.id);
      return;
    }
    setSelectedSnapshot(snapshot);
    setModalVisible(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedIds.size === snapshots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(snapshots.map(s => s.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Delete Snapshots',
      `Are you sure you want to delete ${selectedIds.size} selected snapshot${selectedIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSnapshots(Array.from(selectedIds));
              await loadSnapshots();
              exitSelectionMode();
              Alert.alert('Success', 'Selected snapshots deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete snapshots');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return 'Unknown Date';
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group snapshots by date
  const groupedSnapshots = snapshots.reduce((groups, snapshot) => {
    const dateKey = formatDate(new Date(snapshot.date));
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(snapshot);
    return groups;
  }, {} as Record<string, Snapshot[]>);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => isSelectionMode ? exitSelectionMode() : router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">
              {isSelectionMode ? `${selectedIds.size} Selected` : 'Snapshot Gallery'}
            </Text>
            <Text className="text-sm text-muted-foreground">{snapshots.length} snapshots</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          {snapshots.length > 0 && (
            <>
              {isSelectionMode ? (
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity onPress={handleSelectAll}>
                    <Text className="text-primary font-semibold">
                      {selectedIds.size === snapshots.length ? 'None' : 'All'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedIds.size === 0}>
                    <Trash2 className={selectedIds.size > 0 ? "text-destructive" : "text-muted-foreground"} size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={exitSelectionMode}>
                    <Text className="text-primary font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={enterSelectionMode}>
                  <Text className="text-primary font-semibold">Select</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {!isSelectionMode && <ThemeToggle />}
        </View>
      </View>

      {snapshots.length === 0 ? (
        // Empty State
        <View className="flex-1 items-center justify-center px-6">
          <Camera className="text-muted-foreground mb-4" size={64} />
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            No Snapshots Yet
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            Capture snapshots from live streams to see them here
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/home')}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">Go to Cameras</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {Object.entries(groupedSnapshots).map(([date, dateSnapshots]) => (
            <View key={date} className="mb-6">
              {/* Date Header */}
              <View className="flex-row items-center gap-2 mb-3 mt-4">
                <Calendar className="text-primary" size={18} />
                <Text className="text-lg font-bold text-foreground">{date}</Text>
                <View className="flex-1 h-[1px] bg-border ml-2" />
              </View>

              {/* Grid Layout */}
              <View className="flex-row flex-wrap gap-3">
                {dateSnapshots.map((snapshot) => (
                  <TouchableOpacity
                    key={snapshot.id}
                    onPress={() => openPreview(snapshot)}
                    style={{ width: imageSize }}
                    className="bg-card rounded-xl overflow-hidden border border-border"
                  >
                    {/* Snapshot Image */}
                    <Image
                      source={{ uri: snapshot.imageUri }}
                      style={{ width: imageSize, height: imageSize }}
                      resizeMode="cover"
                    />

                    {/* Selection Indicator */}
                    {isSelectionMode && (
                      <View className="absolute top-2 right-2 z-10 shadow-2xl">
                        {selectedIds.has(snapshot.id) ? (
                          <View className="bg-primary rounded-full p-0.5 border-2 border-white shadow-lg">
                            <CheckCircle2 color="white" size={20} fill="rgba(255,255,255,0.2)" />
                          </View>
                        ) : (
                          <View className="bg-black/50 rounded-full p-0.5 border-2 border-white/80 shadow-md">
                            <Circle color="white" size={20} />
                          </View>
                        )}
                      </View>
                    )}

                    {/* Overlay Info */}
                    {!isSelectionMode && (
                      <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                        <View className="flex-row items-center gap-1 mb-1">
                          <Camera className="text-white" size={12} />
                          <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                            {snapshot.cameraName}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Clock className="text-white/80" size={10} />
                          <Text className="text-white/80 text-[10px]">
                            {snapshot.timestamp.split(' ')[1]}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Selected Overlay */}
                    {isSelectionMode && selectedIds.has(snapshot.id) && (
                      <View className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-xl" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }} className="flex-1">
          {selectedSnapshot && (
            <>
              {/* Close Button */}
              <SafeAreaView>
                <View className="flex-row items-center justify-between px-6 py-4">
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X color="#fff" size={28} />
                  </TouchableOpacity>
                  <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => handleShareSnapshot(selectedSnapshot)}>
                      <Share2 color="#fff" size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSnapshot(selectedSnapshot.id)}>
                      <Trash2 color="#ef4444" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>

              {/* Full Image */}
              <View className="flex-1 items-center justify-center px-4">
                <Image
                  source={{ uri: selectedSnapshot.imageUri }}
                  style={{ width: width - 32, height: width - 32 }}
                  resizeMode="contain"
                />
              </View>

              {/* Info Panel */}
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="px-6 py-6">
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <Camera color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Camera</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.cameraName}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <MapPin color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Location</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.location}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <Clock color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Timestamp</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.timestamp}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}