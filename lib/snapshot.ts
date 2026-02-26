import { Snapshot } from '@/types/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

const SNAPSHOTS_STORAGE_KEY = 'cctv_snapshots';

// Ensure snapshot directory exists using stable API
const getSnapshotDir = () => {
    // Use stable legacy FileSystem.documentDirectory (always ends with '/')
    return `${FileSystem.documentDirectory}snapshots`;
};

const ensureDirExists = async () => {
    const dir = getSnapshotDir();
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
};

// Helper to wait for a file to exist (polling)
async function waitForFile(uri: string, maxRetries = 15, interval = 200): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) return true;
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    const finalInfo = await FileSystem.getInfoAsync(uri);
    return finalInfo.exists;
}

export async function saveSnapshot(
    cameraId: string,
    cameraName: string,
    location: string,
    imageUri: string
): Promise<Snapshot> {
    console.log(`[Snapshot] saveSnapshot started for camera: ${cameraName}, uri: ${imageUri}`);
    try {
        await ensureDirExists();
        const snapshotDir = getSnapshotDir();

        const timestamp = new Date();
        const fileName = `snapshot_${timestamp.getTime()}.jpg`;
        const destUri = `${snapshotDir}/${fileName}`;

        // Normalize imageUri for Expo FileSystem
        let sourceUri = imageUri;
        if (!sourceUri.startsWith('http') && !sourceUri.startsWith('file://')) {
            sourceUri = `file://${sourceUri}`;
        }

        // 1. Store in App's Document Directory
        if (sourceUri.startsWith('http')) {
            console.log('[Snapshot] Downloading remote image...');
            await FileSystem.downloadAsync(sourceUri, destUri);
        } else {
            console.log('[Snapshot] Copying local image...');
            const exists = await waitForFile(sourceUri);
            if (!exists) {
                console.error(`[Snapshot] Source file not found: ${sourceUri}`);
                throw new Error(`Source file does not exist: ${sourceUri}`);
            }

            // Short buffer for file system stability
            await new Promise(resolve => setTimeout(resolve, 300));

            await FileSystem.copyAsync({
                from: sourceUri,
                to: destUri
            });
            console.log('[Snapshot] Copy completed.');
        }

        // 2. Save to Phone Gallery (non-critical — don't crash if this fails)
        try {
            console.log('[Snapshot] Requesting media library permissions...');
            const { status } = await MediaLibrary.requestPermissionsAsync();
            console.log(`[Snapshot] Media library permission status: ${status}`);

            if (status === 'granted') {
                const destInfo = await FileSystem.getInfoAsync(destUri);
                if (destInfo.exists) {
                    // Small delay for file system stability before saving to gallery
                    await new Promise(resolve => setTimeout(resolve, 500));
                    console.log('[Snapshot] Calling saveToLibraryAsync...');
                    await MediaLibrary.saveToLibraryAsync(destUri);
                    console.log('[Snapshot] Saved to phone gallery.');
                } else {
                    console.warn('[Snapshot] Dest file not found, skipping gallery save.');
                }
            } else {
                console.warn('[Snapshot] Permission to access media library denied.');
            }
        } catch (galleryError: any) {
            console.error('[Snapshot] Gallery save failed (non-critical):', galleryError?.message || galleryError);
        }

        const newSnapshot: Snapshot = {
            id: Math.random().toString(36).substr(2, 9),
            cameraId,
            cameraName,
            location,
            timestamp: timestamp.toLocaleString(),
            date: timestamp.toISOString(),
            imageUri: destUri
        };

        // 3. Save metadata to AsyncStorage
        const existingSnapshots = await getSnapshots();
        const updatedSnapshots = [newSnapshot, ...existingSnapshots];
        await AsyncStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updatedSnapshots));

        return newSnapshot;
    } catch (error: any) {
        console.error('[Snapshot] Error in saveSnapshot:', error);
        throw new Error(`Failed to save snapshot: ${error.message || 'Unknown error'}`);
    }
}

export async function getSnapshots(): Promise<Snapshot[]> {
    try {
        const jsonValue = await AsyncStorage.getItem(SNAPSHOTS_STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error getting snapshots:', error);
        return [];
    }
}

export async function deleteSnapshot(id: string): Promise<void> {
    try {
        const snapshots = await getSnapshots();
        const snapshotToDelete = snapshots.find(s => s.id === id);

        if (snapshotToDelete) {
            const info = await FileSystem.getInfoAsync(snapshotToDelete.imageUri);
            if (info.exists) {
                await FileSystem.deleteAsync(snapshotToDelete.imageUri);
            }

            const updatedSnapshots = snapshots.filter(s => s.id !== id);
            await AsyncStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updatedSnapshots));
        }
    } catch (error) {
        console.error('Error deleting snapshot:', error);
        throw new Error('Failed to delete snapshot');
    }
}

export async function clearAllSnapshots(): Promise<void> {
    try {
        const snapshotDir = getSnapshotDir();
        const dirInfo = await FileSystem.getInfoAsync(snapshotDir);
        if (dirInfo.exists) {
            await FileSystem.deleteAsync(snapshotDir);
        }
        await AsyncStorage.removeItem(SNAPSHOTS_STORAGE_KEY);
        await ensureDirExists();
    } catch (error) {
        console.error('Error clearing snapshots:', error);
        throw new Error('Failed to clear snapshots');
    }
}
