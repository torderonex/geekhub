import styles from './ChatInput.module.scss';
import { classNames } from 'src/helpers/classNames';

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    className?: string,
}

export default function ChatInput({ ...props }: ChatInputProps) {
    return (
        <input
            className={classNames(styles.ChatInput, {}, [])}
            {...props}
        />
    );
}