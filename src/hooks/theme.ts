
interface ThemeColor {
    sizeUnit: number;
    accent: string;
}

export function useTheme(): ThemeColor {
    const common = {
        sizeUnit: 8,
        accent: '85, 23, 227'
    }
    return common
}
