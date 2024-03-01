import React, { useState, useEffect } from 'react'
import { Text } from 'react-native'
import FlexCenter from './FlexCenter'

async function parseUrl(url: string) {
    try {
        let response = await fetch(url, {
            redirect: 'manual',
            headers: {
                'cache-control': 'no-cache'
            }
        })
        const contentType = response.headers.get('content-type')
        if (contentType && /application\/vnd.apple.mpegurl/i.test(contentType)) {
            return response.url
        }
        let redirectUrl = response.url
        if (/\/tc.html/.test(response.url)) {
            redirectUrl = redirectUrl.replace(/^(https?:\/\/.+)?\/tc.html\?id=/, '')
            return parseUrl(redirectUrl)
        }
        response = await fetch(redirectUrl)
        const html = await response.text()
        let matches: RegExpMatchArray | null = null
        const urlMatchRegExp = /https?:\/\/[^"]+/
        const urlMatch = html.match(
            new RegExp(`"url":\\s?"${urlMatchRegExp.source}"`)
        )
        if (urlMatch) {
            matches = urlMatch
        }
        else {
            const sourceMatch = html.match(
                new RegExp(`<source src="${urlMatchRegExp.source}" type="[a-zA-Z]+/[\\w\\-]+">`)
            )
            if (sourceMatch) {
                matches = sourceMatch
            }
            else {
                throw new Error('😥 not matched.')
            }
        }
        const matchedUrl = matches[0].match(urlMatchRegExp)?.[0]
        return matchedUrl
    }
    catch (err) {
        return null
    }
}

type RedirectionResolverProps = {
    url: string;
    redirect?: boolean;
    children: (url: string) => React.ReactNode;
}

function RedirectionResolver({ url, redirect = false, children }: RedirectionResolverProps) {

    const [parsedUrl, setParsedUrl] = useState<string | null>(null)

    const _parseUrl = async () => {
        const parsed = await parseUrl(url)
        if (parsed) {
            setParsedUrl(parsed)
        }
    }

    useEffect(() => {
        if (redirect) {
            setParsedUrl(null)
            _parseUrl()
        }
    }, [url, redirect])

    if (redirect) {
        return parsedUrl ? children(parsedUrl) : (
            <FlexCenter>
                <Text
                    style={{
                        color: '#fff'
                    }}
                >地址解析中..</Text>
            </FlexCenter>
        )
    }
    return children(url)
}

export default RedirectionResolver
