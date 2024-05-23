import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';

// Enum for Theme
export enum Theme {
    LIGHT = 'light',
    DARK = 'dark'
}

// Interface for ThemeContext properties
export interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// Creating ThemeContext with default values
export const ThemeContext = createContext<ThemeContextProps>({
    theme: Theme.LIGHT,
    setTheme: () => {},
});

// Key for localStorage
export const LOCAL_STORAGE_THEME_KEY = 'theme';

// Custom hook to use ThemeContext
interface useThemeResult {
    toggleTheme: () => void;
    theme: Theme;
}

export function useTheme(): useThemeResult {
    const { theme, setTheme } = useContext(ThemeContext);

    const toggleTheme = () => {
        const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        setTheme(newTheme);
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
    };

    return {
        theme,
        toggleTheme
    };
}

interface ThemeProviderProps extends PropsWithChildren {
}

// Provider component to wrap the app with ThemeContext
export const ThemeProvider: React.FC = ({ children }:  ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme;
        return savedTheme || Theme.LIGHT;
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
