export type Protocol = 'RTSP' | 'WebRTC';
export type CameraStatus = 'online' | 'offline';

export interface Camera {
    id: string;
    name: string;
    ip: string;
    port: string;
    username: string;
    password: string;
    protocol: Protocol;
    status: CameraStatus;
    location?: string;
    lastSeen?: string;
    createdAt: string;
}

export interface CameraFormData {
    name: string;
    ip: string;
    port: string;
    username: string;
    password: string;
    protocol: Protocol;
    location: string;
}

export interface Snapshot {
    id: string;
    cameraId: string;
    cameraName: string;
    location: string;
    timestamp: string;
    imageUri: string;
    date: string; // ISO string
}
