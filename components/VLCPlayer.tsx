import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { VLCPlayer as VLC } from 'react-native-vlc-media-player';

export type StreamState =
    | 'loading'
    | 'playing'
    | 'paused'
    | 'buffering'
    | 'error'
    | 'reconnecting';

interface VLCPlayerProps {
    url: string;
    onStateChange?: (state: StreamState) => void;
    onSnapshot?: (event: { success: boolean; path?: string; error?: string }) => void;
    style?: any;
}

export interface VLCPlayerMethods {
    snapshot: (path: string) => void;
}

// Helper function to create a mutable source object with stable RTSP settings
const createSource = (url: string) => {
    const obj = {} as any;
    obj.uri = url;
    obj.isNetwork = true;
    obj.initOptions = [
        '--network-caching=2000',       // 2 second buffer for stable playback
        '--rtsp-tcp',                    // TCP for reliable streaming (no packet loss)
        '--live-caching=2000',           // 2 second live stream buffer
        '--file-caching=2000',           // File caching buffer
        '--rtsp-caching=2000',           // RTSP specific caching
        '--codec=avcodec',               // Use ffmpeg codec
        '--avcodec-hw=any',              // Use hardware acceleration if available
        '--no-audio',                    // Disable audio for CCTV (reduces load)
    ];
    return obj;
};

export const VLCPlayer = forwardRef<VLCPlayerMethods, VLCPlayerProps>(
    ({ url, onStateChange, onSnapshot, style }, ref) => {
        const playerRef = useRef<any>(null);
        const [state, setState] = useState<StreamState>('loading');
        const [source, setSource] = useState(() => createSource(url));

        useImperativeHandle(ref, () => ({
            snapshot: (path: string) => {
                try {
                    if (playerRef.current) {
                        playerRef.current.snapshot(path);
                    } else {
                        console.error('[VLCPlayer] Cannot snapshot: playerRef is null');
                        onSnapshot?.({ success: false, error: 'Player not ready' });
                    }
                } catch (err: any) {
                    console.error('[VLCPlayer] Snapshot call threw:', err);
                    onSnapshot?.({ success: false, error: err.message || 'Native snapshot failed' });
                }
            }
        }));

        const updateState = useCallback(
            (s: StreamState) => {
                if (s !== state) {
                    console.log(`[VLCPlayer] State: ${state} -> ${s}`);
                    setState(s);
                    onStateChange?.(s);
                }
            },
            [state, onStateChange]
        );

        useEffect(() => {
            // Create completely new source object when URL changes
            setSource(createSource(url));
        }, [url]);

        return (
            <View style={[styles.container, style]}>
                <VLC
                    key={url}
                    ref={playerRef}
                    style={styles.video}
                    source={source}
                    autoplay={true}
                    autoAspectRatio={true}
                    resizeMode="contain"
                    onBuffering={() => updateState('buffering')}
                    onPlaying={() => updateState('playing')}
                    onPaused={() => updateState('paused')}
                    onEnd={() => updateState('reconnecting')}
                    onSnapshot={onSnapshot}
                    onError={(e: any) => {
                        console.log('[VLCPlayer] Error:', e);
                        updateState('error');
                    }}
                    onProgress={() => {
                        if (state === 'loading' || state === 'buffering') {
                            updateState('playing');
                        }
                    }}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    video: { flex: 1, width: '100%', height: '100%' },
});