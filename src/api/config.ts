import { Base64Params } from './clue'

export const server = 'https://spacedeta-1-f1000878.deta.app'

export async function getTVChannels() {
    const data = await fetch(`${server}/api/video/tv?inherit=1`).then<TVChannel[]>(
        response => response.json()
    )
    return data;
}

export function parseSource({ parse, url }: TvSource) {
    if (parse) {
        return `${server}/api/video/tv/parse/${Base64Params.create(url)}`
    }
    return url
}
