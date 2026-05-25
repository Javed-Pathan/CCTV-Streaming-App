import { Snapshot } from '@/types/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

const SNAPSHOTS_STORAGE_KEY = 'cctv_snapshots';
const EUROPE_SEEDED_KEY = 'europe_snapshots_seeded';

// Bundled Europe snapshot data
const EUROPE_SNAPSHOTS_DATA = [
    {
        id: 'europe-paris-001',
        cameraId: 'eu-cam-08',
        cameraName: 'Eiffel Tower Cam',
        location: 'Paris, France',
        timestamp: '14/10/2023, 11:48:12 PM',
        date: '2023-10-14T23:48:12.000Z',
        asset: require('@/assets/images/europe/paris.png'),
        fileName: 'europe_paris.png',
    },
    {
        id: 'europe-london-002',
        cameraId: 'eu-cam-07',
        cameraName: 'Tower Bridge Cam',
        location: 'London, United Kingdom',
        timestamp: '24/10/2023, 7:42:08 PM',
        date: '2023-10-24T19:42:08.000Z',
        asset: require('@/assets/images/europe/london.png'),
        fileName: 'europe_london.png',
    },
    {
        id: 'europe-rome-003',
        cameraId: 'eu-cam-03',
        cameraName: 'Colosseum West Cam',
        location: 'Rome, Italy',
        timestamp: '27/10/2024, 6:42:15 PM',
        date: '2024-10-27T18:42:15.000Z',
        asset: require('@/assets/images/europe/rome.png'),
        fileName: 'europe_rome.png',
    },
    {
        id: 'europe-berlin-004',
        cameraId: 'eu-cam-01',
        cameraName: 'Brandenburg Gate Cam',
        location: 'Berlin, Germany',
        timestamp: '27/10/2023, 7:42:08 PM',
        date: '2023-10-27T19:42:08.000Z',
        asset: require('@/assets/images/europe/berlin.png'),
        fileName: 'europe_berlin.png',
    },
];

/**
 * Seeds the snapshot gallery with 4 pre-bundled European location images.
 * Only runs once (tracked via AsyncStorage flag).
 */
export async function seedEuropeSnapshots(): Promise<void> {
    try {
        const alreadySeeded = await AsyncStorage.getItem(EUROPE_SEEDED_KEY);
        if (alreadySeeded === 'true') return;

        await ensureDirExists();
        const snapshotDir = getSnapshotDir();

        const existingSnapshots = await getSnapshots();
        const newSnapshots: Snapshot[] = [];

        for (const item of EUROPE_SNAPSHOTS_DATA) {
            // Skip if already exists
            if (existingSnapshots.some(s => s.id === item.id)) continue;

            // Download/copy asset to document directory
            const [asset] = await Asset.loadAsync(item.asset);
            const destUri = `${snapshotDir}/${item.fileName}`;

            if (asset.localUri) {
                await FileSystem.copyAsync({
                    from: asset.localUri,
                    to: destUri,
                });
            } else if (asset.uri) {
                await FileSystem.downloadAsync(asset.uri, destUri);
            }

            newSnapshots.push({
                id: item.id,
                cameraId: item.cameraId,
                cameraName: item.cameraName,
                location: item.location,
                timestamp: item.timestamp,
                date: item.date,
                imageUri: destUri,
            });
        }

        if (newSnapshots.length > 0) {
            const allSnapshots = [...newSnapshots, ...existingSnapshots];
            await AsyncStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(allSnapshots));
        }

        await AsyncStorage.setItem(EUROPE_SEEDED_KEY, 'true');
        console.log('[Snapshot] Europe snapshots seeded successfully.');
    } catch (error) {
        console.error('[Snapshot] Error seeding Europe snapshots:', error);
    }
}

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
        const storedSnapshots: Snapshot[] = jsonValue != null ? JSON.parse(jsonValue) : [];

        const currentDocDir = FileSystem.documentDirectory;
        if (!currentDocDir) return storedSnapshots;

        // Fix URIs and ensure dates exist
        return storedSnapshots.map(snapshot => {
            let updatedUri = snapshot.imageUri;

            // If it's a file URI, rebuild it using the current document directory
            // This fixes visibility issues when the app container ID changes on iOS
            if (updatedUri.includes('/Documents/snapshots/')) {
                const fileName = updatedUri.split('/').pop();
                updatedUri = `${currentDocDir}snapshots/${fileName}`;
            }

            // Ensure date property exists for grouping (use timestamp as fallback)
            let updatedDate = snapshot.date;
            if (!updatedDate) {
                try {
                    // Try to parse timestamp (e.g., "MM/DD/YYYY, HH:MM:SS AM/PM")
                    updatedDate = new Date(snapshot.timestamp).toISOString();
                } catch (e) {
                    updatedDate = new Date().toISOString();
                }
            }

            return {
                ...snapshot,
                imageUri: updatedUri,
                date: updatedDate
            };
        });
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

export async function deleteSnapshots(ids: string[]): Promise<void> {
    try {
        const snapshots = await getSnapshots();
        const updatedSnapshots = snapshots.filter(s => {
            if (ids.includes(s.id)) {
                // Delete file asynchronously (don't wait for each one to finish if there are many)
                // but we filter the metadata immediately
                FileSystem.deleteAsync(s.imageUri).catch(err =>
                    console.error(`[Snapshot] Failed to delete file ${s.imageUri}:`, err)
                );
                return false;
            }
            return true;
        });

        await AsyncStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updatedSnapshots));
    } catch (error) {
        console.error('Error deleting snapshots:', error);
        throw new Error('Failed to delete snapshots');
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
