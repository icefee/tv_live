
export const server = 'https://spacedeta-1-f1000878.deta.app'

export async function getTVChannels() {
    const response = await fetch(`${server}/api/video/tv?inherit=1`)
    const data: TvChannel[] = await response.json()
    return data
}
