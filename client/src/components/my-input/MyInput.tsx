import styles from './MyInput.module.scss';
import { classNames } from 'src/helpers/classNames';

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    className?: string,
}

export default function MyInput({...props }: MyInputProps) {
    return (
        <input
            className={classNames(styles.MyInput, {}, [])}
            {...props}
        />
    );
}