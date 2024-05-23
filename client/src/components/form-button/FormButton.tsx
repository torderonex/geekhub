import styles from './FormButton.module.scss';
import { classNames } from 'src/helpers/classNames';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    title: string
}

export default function FormButton({ title, ...props }: FormButtonProps) {
    return (
        <button
            className={classNames(styles.FormButton, {}, [])}
            {...props}
        >
            {title}
        </button>
    );
}