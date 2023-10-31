declare interface TvSource {
    url: string;
    cors?: boolean;
    parse?: boolean;
}

declare interface TVChannel {
    id: number;
    title: string;
    source: TvSource | TvSource[];
}