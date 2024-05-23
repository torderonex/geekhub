import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { classNames } from 'src/helpers/classNames';

export enum Languages{
    RU = 'ru',
    EN = 'en',
}

interface LangSwitcherProps extends PropsWithChildren {
    className?: string;
}

export default function LangSwitcher({className, children}: LangSwitcherProps) {
	const { i18n } = useTranslation();

	function langHandle(){
		i18n.changeLanguage(i18n.language === Languages.EN ? Languages.RU : Languages.EN);
	}

	return (
		<button 
			className={classNames('',{},[className])}
			onClick={langHandle}>
			{children}
		</button>
	);
}