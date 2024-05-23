import styles from './SelectButton.module.scss';
import { classNames } from 'src/helpers/classNames';

interface SelectButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    onClick?: () => void
}

export default function SelectButton({ children, onClick }: SelectButtonProps) {
    return (
        <button
            className={classNames(styles.SelectButton, {}, [])}
            onClick={onClick}
        >
            {children}
        </button>
    );
}