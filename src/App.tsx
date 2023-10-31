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
import { useTheme } from './hooks/theme'
import { usePersistentStorage } from './hooks/storage'
import { getTVChannels, parseSource } from './api/config'

const assets: Record<string, any> = {
  tv: require('./assets/tv.png'),
  tv_active: require('./assets/tv_active.png')
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
        () => onChannelChange?.({
          channel: data.id,
          source: 0
        })
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
                width: sizeUnit * 10,
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

  useEffect(() => {
    const activeIndex = data.findIndex(({ id }) => id === channelState.channel)
    scroller.current?.scrollToIndex({
      index: activeIndex,
      animated: true
    })
  }, [data])

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
  const [activeChannel, setActiveChannel] = usePersistentStorage<ChannelState>('_active_channel', {
    channel: -1,
    source: 0
  })
  const minimal = width < 600
  const channelListHeight = minimal ? .5 * height : height

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

  const sourceUrl = useMemo(() => {
    const { channel, source } = activeChannel
    const tvChannel = data.find(({ id }) => id === channel)
    const activeSource = tvChannel?.source
    if (activeSource) {
      if (Array.isArray(activeSource)) {
        return parseSource(activeSource[source])
      }
      return parseSource(activeSource)
    }
    return null
  }, [data, activeChannel])

  useEffect(() => {
    initChannels()
  }, [])

  return (
    <SafeAreaView>
      {
        loading ? (
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Text>加载中...</Text>
          </View>
        ) : (
          <View
            style={{
              height: '100%',
              flexDirection: minimal ? 'column' : 'row',
              alignItems: 'stretch'
            }}
          >
            <View
              style={{
                flexGrow: 1,
                backgroundColor: '#000'
              }}
            >
              {
                sourceUrl && (
                  <Video
                    source={{
                      uri: sourceUrl,
                      type: 'm3u8'
                    }}
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                  />
                )
              }
            </View>
            <View
              style={{
                width: minimal ? '100%' : 240,
                height: channelListHeight
              }}
            >
              <ChannelList
                height={channelListHeight}
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
