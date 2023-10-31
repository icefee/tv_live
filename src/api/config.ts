
export const server = 'https://spacedeta-1-f1000878.deta.app'

export async function getTVChannels() {
    const data = await fetch(`${server}/api/video/tv?inherit=1`).then<TVChannel[]>(
        response => response.json()
    )
    return data;
}
