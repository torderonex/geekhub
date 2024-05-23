import React, { useMemo } from 'react';
import { LOCAL_STORAGE_THEME_KEY, Theme, ThemeContext } from 'src/hooks/useTheme';

const defualtTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme || Theme.LIGHT;

export default function ThemeProvider({ children } : React.PropsWithChildren) {
	const [theme,setTheme] = React.useState<Theme>(defualtTheme);
  
	const defualtProps = useMemo(() => ({
		theme:  theme,
		setTheme : setTheme
	}), [theme]);

	return (
		<ThemeContext.Provider value={defualtProps}>
			{children}
		</ThemeContext.Provider>
	);
}
