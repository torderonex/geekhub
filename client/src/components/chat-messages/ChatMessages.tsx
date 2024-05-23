import { useAppSelector } from 'src/hooks/redux-hooks';
import Message from '../message/Message';
import styles from './ChatMessages.module.scss';
import { classNames } from 'src/helpers/classNames';
import { useEffect, useRef } from 'react';
import { BeatLoader } from 'react-spinners';
import Markdown from 'react-markdown'
import Logo from 'src/assets/logo.svg'
import { useTranslation } from 'react-i18next';

export default function ChatMessages() {
    const {chatMessages} = useAppSelector(state => state.chatSlice)
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {isAiAnswering} = useAppSelector(state => state.chatSlice)
    const {t} = useTranslation()

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={classNames(styles.ChatMessages, {}, [])}>
            {chatMessages.length == 0 && <h2>{t('askAIanything')}</h2>}
            {chatMessages.length == 0 && <img src={Logo} className={styles.logo} />}
            {chatMessages.map((mes, i) => 
                <Message type={mes.type} key={i}>
                    <Markdown>{mes.message}</Markdown>
                </Message>
            )}
            {isAiAnswering &&
                <Message type='res'>
                    <BeatLoader color='white' size={12}/>
                </Message >
            }
            <div ref={messagesEndRef} />
        </div>
    );
}