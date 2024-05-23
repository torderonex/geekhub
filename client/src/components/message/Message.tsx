import { CgProfile } from 'react-icons/cg';
import styles from './Message.module.scss';
import { classNames } from 'src/helpers/classNames';
import { GoDependabot } from 'react-icons/go';

interface MessageProps extends React.HTMLAttributes<HTMLDivElement>{
    type: string,
}

export default function Message({ type, children }: MessageProps) {
    return (
        <div className={classNames(styles.Message, {[styles.res]: type === 'res'}, [])}>
            <header>
                {type === 'req' ? <CgProfile /> : <GoDependabot />}
                <span>{type === 'req' ? 'You' : 'Geekhub AI'}</span>
            </header>
            <span>{children}</span>
        </div>
    );
}