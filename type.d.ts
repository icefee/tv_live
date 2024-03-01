declare interface TvSource {
    url: string;
    cors?: boolean;
    parse?: boolean;
}

declare interface TvChannel {
    id: number;
    title: string;
    source: TvSource | TvSource[];
}

declare interface ChannelState {
    channel: number;
    source: number;
}