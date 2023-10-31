type VoidFunction = () => void;

declare module 'react-native-video' {
    import type { ClassicComponentClass } from 'react'
    import type { StyleProp, ViewStyle, ImageResizeMode } from 'react-native';

    export type ProcessParams = {
        currentTime: number;
        playableDuration: number;
        seekableDuration: number;
    }
    export type VideoMeta = {
        duration: number;
    }
    export type SeekParams = {
        currentTime: number;
        seekTime: number;
    }
    const _default: ClassicComponentClass<{
        source: {
            uri: string;
            type?: 'mpd' | 'm3u8' | 'ism';
            title?: string;
            subtitle?: string;
            description?: string;
            customImageUri?: string;
        };
        controls?: boolean;
        paused?: boolean;
        minLoadRetryCount?: number;
        resizeMode?: Exclude<ImageResizeMode, 'center' | 'repeat'> | 'none';
        onReadyForDisplay?: VoidFunction;
        onError?: (error: any) => void;
        onLoad?: (info: VideoMeta) => void;
        onProgress?: (payload: ProcessParams) => void;
        onPlaybackStateChanged?: (payload: { isPlaying: boolean; }) => void;
        onSeek?: (payload: SeekParams) => void;
        onEnd?: VoidFunction;
        onBuffer?: (payload: { isBuffering: boolean; }) => void;
        reportBandwidth?: boolean;
        onBandwidthUpdate?: (payload: { bitrate: number; }) => void;
        style?: StyleProp<ViewStyle>
    }>;

    export interface PlayerRef {
        presentFullscreenPlayer: VoidFunction;
        dismissFullscreenPlayer: VoidFunction;
        seek(duration: number): void;
    }

    export default _default;
}