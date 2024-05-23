import styles from './TaskSidebar.module.scss';
import { classNames } from 'src/helpers/classNames';
import Markdown from 'react-markdown';
import { processText } from 'src/helpers/processText';
import { useAppDispatch, useAppSelector } from 'src/hooks/redux-hooks';
import { FaArrowLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { setLanguage } from 'src/store/reducers/taskSlice';
import { IoIosArrowDown } from 'react-icons/io';
import { SiTicktick } from 'react-icons/si';

const taskLanguages = ['javascript', 'python']

interface TaskSidebarProps {
    title: string | undefined;
    description: string | undefined;
    status: boolean | undefined;
}

export default function TaskSidebar({title, description, status}: TaskSidebarProps) {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [isPickingLanguage, setIsPickingLanguage] = useState<boolean>(false)
    const { language } = useAppSelector(state => state.taskSlice)

    const handleLanguagePick = (lang: string) => {
        dispatch(setLanguage(lang))
        setIsPickingLanguage(!isPickingLanguage)
    }

    return (
        <div className={styles.Sidebar}>
            <div className={classNames(styles.TaskSidebar, {}, [])}>
                <header>
                    <FaArrowLeft onClick={() => navigate('/tasks')} style={{cursor: 'pointer'}} />
                    <div className={styles.dropdown}>
                        <button className={styles.dropbtn} onClick={() => setIsPickingLanguage(!isPickingLanguage)}>
                            {language} <IoIosArrowDown />
                        </button>
                        {isPickingLanguage &&
                            <div className={styles.dropdownContent}>
                                {taskLanguages.map((lang, index) => (
                                    <button key={index} onClick={() => handleLanguagePick(lang)}>{lang}</button>
                                ))}
                            </div>
                        }
                    </div>
                </header>
                <h1 className={styles.title}>{title} {status ? <SiTicktick color='green'/> : null}</h1>
                <Markdown>{processText(description)}</Markdown>
            </div>
        </div>
    );
}