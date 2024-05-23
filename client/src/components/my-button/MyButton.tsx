import { ButtonHTMLAttributes } from 'react';
import styles from './MyButton.module.scss';
import { classNames } from 'src/helpers/classNames';

interface MyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string,
}

export default function MyButton({ className, children, ...props }: MyButtonProps) {
    return (
        <button
            className={classNames(styles.MyButton, {}, [className])}
            {...props}
        >
            {children}
        </button>
    );
}