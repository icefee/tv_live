import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    SafeAreaView,
    FlatList,
    View,
    Text,
    Image,
    TouchableOpacity,
    useWindowDimensions
} from 'react-native'
import Video from 'react-native-video'
import { Picker } from '@react-native-picker/picker'
import RedirectionResolver from './components/RedirectionResolver'
import FlexCenter from './components/FlexCenter'
import { useTheme } from './hooks/theme'
import { usePersistentStorage } from './hooks/storage'
import { getTVChannels } from './api/config'

const assets: Record<string, any> = {
    tv: require('./assets/tv.png'),
    tv_active: require('./assets/tv_active.png'),
    arrow: require('./assets/arrow.png')
}

interface ChannelState {
    channel: number;
    source: number;
}

interface ChannelProps {
    data: TVChannel;
    channel: ChannelState;
    onChannelChange?: (channel: ChannelState) => void;
}

function Channel({
    data,
    channel,
    onChannelChange
}: ChannelProps) {
    const { sizeUnit, accent } = useTheme()
    const active = channel.channel === data.id
    return (
        <TouchableOpacity
            onPress={
                () => {
                    if (!active) {
                        onChannelChange?.({
                            channel: data.id,
                            source: 0
                        })
                    }
                }
            }
        >
            <View
                style={{
                    backgroundColor: active ? `rgba(${accent}, .1)` : 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: sizeUnit
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Image
                        style={{
                            width: sizeUnit * 4,
                            height: sizeUnit * 4,
                            marginRight: sizeUnit * 2
                        }}
                        source={active ? assets.tv_active : assets.tv}
                    />
                    <Text>{data.title}</Text>
                </View>
                {
                    Array.isArray(data.source) && (
                        <Picker<number>
                            style={{
                                height: sizeUnit * 4,
                                width: sizeUnit * 9,
                                flexGrow: 0,
                                display: active ? 'flex' : 'none'
                            }}
                            selectionColor={`rgb(${accent})`}
                            selectedValue={channel.source}
                            onValueChange={
                                (_, index) => onChannelChange?.({
                                    channel: data.id,
                                    source: index
                                })
                            }
                        >
                            {
                                data.source.map(
                                    (_, index) => (
                                        <Picker.Item
                                            key={index}
                                            label={`源${index + 1}`}
                                            value={index}
                                        />
                                    )
                                )
                            }
                        </Picker>
                    )
                }
            </View>
        </TouchableOpacity>
    )
}

interface ChannelListProps extends Omit<ChannelProps, 'data'> {
    height: number;
    data: TVChannel[];
}

function ChannelList({ height, data, channel: channelState, ...props }: ChannelListProps) {
    const { sizeUnit } = useTheme()
    const headerHeight = sizeUnit * 5
    const scroller = useRef<FlatList | null>(null)

    const initialIndex = useMemo(() => data.findIndex(({ id }) => id === channelState.channel), [data, channelState])

    return (
        <View
            style={{
                height
            }}
        >
            <View
                style={{
                    padding: sizeUnit,
                    height: headerHeight,
                    justifyContent: 'center'
                }}
            >
                <Text>播放列表</Text>
            </View>
            <FlatList
                contentInsetAdjustmentBehavior="automatic"
                ref={scroller}
                data={data}
                renderItem={
                    ({ item }: { item: TVChannel }) => {
                        const { id } = item
                        return (
                            <Channel key={id} data={item} channel={channelState} {...props} />
                        )
                    }
                }
                getItemLayout={
                    (_, index) => {
                        const length = sizeUnit * 6
                        const offset = length * index
                        return {
                            length,
                            offset,
                            index
                        }
                    }
                }
                initialScrollIndex={initialIndex}
                keyExtractor={item => '' + item.id}
                style={{
                    height: height - headerHeight
                }}
            />
        </View>
    )
}

function App() {
    const { width, height } = useWindowDimensions()
    const [data, setData] = useState<TVChannel[]>([])
    const [loading, setLoading] = useState(true)
    const [activeChannel, setActiveChannel, ready] = usePersistentStorage<ChannelState>('_active_channel', {
        channel: -1,
        source: 0
    })
    const [videoReady, setVideoReady] = useState(false)
    const [bufferring, setBufferring] = useState(false)
    const [playListShow, setPlayListShow] = useState(true)
    const { accent, sizeUnit } = useTheme()

    const initChannels = async () => {
        try {
            const channels = await getTVChannels()
            const [firstChannel] = channels
            if (activeChannel.channel === -1) {
                const { id } = firstChannel
                setActiveChannel({
                    channel: id,
                    source: 0
                })
            }
            setData(channels)
        }
        catch (err) { }
        finally {
            setLoading(false)
        }
    }

    const activeSource = useMemo<TvSource | null>(() => {
        const { channel, source } = activeChannel
        const tvChannel = data.find(({ id }) => id === channel)
        const activeSource = tvChannel?.source
        if (activeSource) {
            if (Array.isArray(activeSource)) {
                return activeSource[source]
            }
            return activeSource
        }
        return null
    }, [data, activeChannel])

    useEffect(() => {
        if (activeSource) {
            setVideoReady(false)
        }
    }, [activeSource])

    useEffect(() => {
        if (ready) {
            initChannels()
        }
    }, [ready])

    return (
        <SafeAreaView>
            {
                loading ? (
                    <FlexCenter>
                        <Text
                            style={{
                                color: `rgb(${accent})`
                            }}
                        >数据加载中..</Text>
                    </FlexCenter>
                ) : (
                    <View
                        style={{
                            height: '100%',
                            flexDirection: 'row',
                            alignItems: 'stretch'
                        }}
                    >
                        <View
                            style={{
                                position: 'relative',
                                width: playListShow ? width - 240 : '100%',
                                backgroundColor: '#000'
                            }}
                        >
                            {
                                activeSource && (
                                    <RedirectionResolver url={activeSource.url} redirect={activeSource.parse}>
                                        {
                                            (url) => (
                                                <Video
                                                    source={{
                                                        uri: url,
                                                        type: 'm3u8'
                                                    }}
                                                    resizeMode="contain"
                                                    onBuffer={
                                                        ({ isBuffering }) => setBufferring(isBuffering)
                                                    }
                                                    onLoad={
                                                        () => setVideoReady(true)
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        opacity: videoReady ? 1 : 0
                                                    }}
                                                />
                                            )
                                        }
                                    </RedirectionResolver>
                                )
                            }
                            {
                                (!activeSource || !activeSource?.parse && !videoReady || bufferring) && (
                                    <FlexCenter
                                        style={{
                                            zIndex: 1
                                        }}
                                        absolute
                                    >
                                        <Text
                                            style={{
                                                color: '#fff'
                                            }}
                                        >加载中..</Text>
                                    </FlexCenter>
                                )
                            }
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: height * .5 - sizeUnit * 2,
                                    right: sizeUnit * 1.5,
                                    zIndex: 2
                                }}
                                onPress={
                                    () => setPlayListShow(state => !state)
                                }
                            >
                                <Image
                                    style={{
                                        width: sizeUnit * 4,
                                        height: sizeUnit * 4,
                                        transform: [{ rotate: playListShow ? '0deg' : '180deg' }]
                                    }}
                                    source={assets.arrow}
                                />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                flexGrow: 1,
                                display: playListShow ? 'flex' : 'none'
                            }}
                        >
                            <ChannelList
                                height={height}
                                data={data}
                                channel={activeChannel}
                                onChannelChange={setActiveChannel}
                            />
                        </View>
                    </View>
                )
            }
        </SafeAreaView>
    )
}

export default App
