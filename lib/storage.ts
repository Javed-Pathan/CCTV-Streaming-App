import { Camera } from '@/types/camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CAMERAS_STORAGE_KEY = '@cctv_cameras';

/**
 * Save a new camera to AsyncStorage
 */
export async function saveCamera(camera: Camera): Promise<void> {
    try {
        const existingCameras = await getCameras();
        const updatedCameras = [...existingCameras, camera];
        await AsyncStorage.setItem(CAMERAS_STORAGE_KEY, JSON.stringify(updatedCameras));
    } catch (error) {
        console.error('Error saving camera:', error);
        throw new Error('Failed to save camera');
    }
}

/**
 * Get all cameras from AsyncStorage
 */
export async function getCameras(): Promise<Camera[]> {
    try {
        const camerasJson = await AsyncStorage.getItem(CAMERAS_STORAGE_KEY);
        if (!camerasJson) {
            return [];
        }
        return JSON.parse(camerasJson) as Camera[];
    } catch (error) {
        console.error('Error getting cameras:', error);
        return [];
    }
}

/**
 * Delete a camera by ID
 */
export async function deleteCamera(id: string): Promise<void> {
    try {
        const cameras = await getCameras();
        const updatedCameras = cameras.filter(camera => camera.id !== id);
        await AsyncStorage.setItem(CAMERAS_STORAGE_KEY, JSON.stringify(updatedCameras));
    } catch (error) {
        console.error('Error deleting camera:', error);
        throw new Error('Failed to delete camera');
    }
}

/**
 * Update an existing camera
 */
export async function updateCamera(id: string, updates: Partial<Camera>): Promise<void> {
    try {
        const cameras = await getCameras();
        const updatedCameras = cameras.map(camera =>
            camera.id === id ? { ...camera, ...updates } : camera
        );
        await AsyncStorage.setItem(CAMERAS_STORAGE_KEY, JSON.stringify(updatedCameras));
    } catch (error) {
        console.error('Error updating camera:', error);
        throw new Error('Failed to update camera');
    }
}

/**
 * Get a single camera by ID
 */
export async function getCameraById(id: string): Promise<Camera | null> {
    try {
        const cameras = await getCameras();
        return cameras.find(camera => camera.id === id) || null;
    } catch (error) {
        console.error('Error getting camera by ID:', error);
        return null;
    }
}

/**
 * Clear all cameras (useful for testing/debugging)
 */
export async function clearAllCameras(): Promise<void> {
    try {
        await AsyncStorage.removeItem(CAMERAS_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing cameras:', error);
        throw new Error('Failed to clear cameras');
    }
}
