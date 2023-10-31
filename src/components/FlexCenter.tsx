import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

function FlexCenter({ children, absolute = false, style }: React.PropsWithChildren<{
    absolute?: boolean;
    style?: StyleProp<ViewStyle>;
}>) {
    return (
        <View
            style={[
                {
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...absolute ? {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                    } : {
                        height: '100%'
                    }
                },
                style
            ]}>
            {children}
        </View>
    )
}

export default FlexCenter
