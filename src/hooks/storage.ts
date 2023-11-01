import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const getStoreData = async <T = any>(key: string) => {
    try {
        const json = await AsyncStorage.getItem(key)
        return json != null ? JSON.parse(json) as T : null;
    } catch (e) {
        console.warn('get store data error')
        return null;
    }
}

const setStoreData = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.warn('set store data error')
    }
}

export function usePersistentStorage<T extends any>(key: string, initValue: T): [T, Dispatch<SetStateAction<T>>, boolean] {

    const [store, setStore] = useState<T>(initValue)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const _getStore = async () => {
            const store = await getStoreData<T>(key)
            if (store) {
                setStore(store)
            }
            setReady(true)
        }
        _getStore()
    }, [])

    useEffect(() => {
        if (ready) {
            setStoreData(key, store)
        }
    }, [store])

    return [store, setStore, ready]
}
