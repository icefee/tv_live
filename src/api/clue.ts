import base64 from 'react-native-base64'

abstract class ParamText {

    public static special = '/'
    public static escape = '_'

    public static parse(text: string) {
        return text.replace(ParamText.escape, ParamText.special)
    }

    public static create(text: string) {
        return text.replace(ParamText.special, ParamText.escape)
    }
}

export abstract class Base64Params {

    public static parse(text: string): string | null {
        try {
            return base64.decode(ParamText.parse(text) + '='.repeat(4 - text.length % 4))
        }
        catch (err) {
            return null
        }
    }

    public static create(text: string): string {
        return ParamText.create(base64.encode(text)).replace(/\={1,2}$/, '')
    }
}
