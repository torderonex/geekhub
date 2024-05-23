import ChatMessages from 'src/components/chat-messages/ChatMessages';
import styles from './AiChatPage.module.scss';
import { classNames } from 'src/helpers/classNames';
import ChatInput from 'src/components/chat-input/ChatInput';
import { useState } from 'react';
import { sendMessage, AiAnswering, AiNotAnswering } from 'src/store/reducers/chatSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/redux-hooks';
import ChatService from 'src/services/chatService';
import { useTranslation } from 'react-i18next';

export default function AiChatPage() {
    const [inputValue, setInputValue] = useState<string>('')
    const {t} = useTranslation()
    const firstPrompt = t('AIfirstPrompt')
    const secondPrompt = t('AIsecondPrompt')
    const dispatch = useAppDispatch();
    const {isAiAnswering} = useAppSelector(state => state.chatSlice)

    async function handleResponse(value: string) {
        dispatch(AiAnswering());
        try {
            const response = await ChatService.askAI({ code: '', prompt: value });
            dispatch(sendMessage(response.data));
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
        dispatch(AiNotAnswering());
    }
    
    

    const handleSubmitMessage = (value: string) => {
        if (isAiAnswering) return
        handleResponse(value);
        dispatch(sendMessage({ type: 'req', message: value }));
        setInputValue('');
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputValue.trim() != '') {
            handleSubmitMessage(inputValue);
        }
    };

    return (
        <div className={classNames(styles.AiChatPage, {}, [])}>
            <ChatMessages />
            <div className={styles.readyPrompts}>
                <button onClick={() => handleSubmitMessage(firstPrompt)}>{firstPrompt}</button>
                <button onClick={() => handleSubmitMessage(secondPrompt)}>{secondPrompt}</button>
            </div>
            <div className={styles.inputDiv}>
                <ChatInput 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
}