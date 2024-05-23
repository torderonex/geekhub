import { useEffect, useState } from 'react';
import styles from './TasksFilters.module.scss';
import { classNames } from 'src/helpers/classNames';
import { IoIosArrowDown } from 'react-icons/io';
import { ITask } from 'src/model/ITask';
import { useTranslation } from 'react-i18next';

interface TasksFiltersProps {
    tasks: ITask[];
    setFilteredTasks: React.Dispatch<React.SetStateAction<ITask[]>>;
}

export default function TasksFilters({ tasks, setFilteredTasks }: TasksFiltersProps) {
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<boolean | null>(null);

    const [isTypeOpen, setIsTypeOpen] = useState<boolean>(false)
    const [isDifficultyOpen, setIsDifficultyOpen] = useState<boolean>(false)
    const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false)
    const {t} = useTranslation()

    const handleFilter = (filter: string, value: string | boolean | null) => {
        switch (filter) {
            case 'type':
                setFilterType(value === filterType ? null : value as string);
                setIsTypeOpen(!isTypeOpen)
                break;
            case 'difficulty':
                setFilterDifficulty(value === filterDifficulty ? null : value as string);

                setIsStatusOpen(false)
                setIsTypeOpen(false)
                setIsDifficultyOpen(!isDifficultyOpen)
                break;
            case 'status':
                setFilterStatus(value === filterStatus ? null : value as boolean);

                setIsTypeOpen(false)
                setIsDifficultyOpen(false)
                setIsStatusOpen(!isStatusOpen)
                break;
            default:
                break;
        }
    };

    const getTypeOptions = () => {
        return Array.from(new Set(tasks.map(task => task.type)));
    };

    useEffect(() => {
        const filteredRes = tasks.filter(item => {
            if (filterType && item.type !== filterType) return false;
            if (filterDifficulty && item.difficulty !== filterDifficulty) return false;
            if (filterStatus !== null && item.status !== filterStatus) return false;
            return true;
        });
        setFilteredTasks(filteredRes);
    }, [tasks, filterType, filterDifficulty, filterStatus]);

    return (
        <div className={classNames(styles.TasksFilters, {}, [])}>
            <div className={styles.dropdown}>
                <button className={styles.dropbtn} onClick={() => {setIsTypeOpen(!isTypeOpen); setIsDifficultyOpen(false); setIsStatusOpen(false)}}>
                    {t('typeF')} {filterType && <span>({filterType})</span>} <IoIosArrowDown />
                </button>
                {isTypeOpen && <div className={styles.dropdownContent}>
                    <button onClick={() => handleFilter('type', null)}>{t('all')}</button>
                    {getTypeOptions().map((type, index) => (
                        <button key={index} onClick={() => handleFilter('type', type)}>{type}</button>
                    ))}
                </div>}
            </div>
            <div className={styles.dropdown}>
                <button className={styles.dropbtn} onClick={() => {setIsDifficultyOpen(!isDifficultyOpen);setIsStatusOpen(false);setIsTypeOpen(false)}}>
                    {t('diffF')} {filterDifficulty && <span>({filterDifficulty})</span>} <IoIosArrowDown />
                </button>
                {isDifficultyOpen && <div className={styles.dropdownContent}>
                    <button onClick={() => handleFilter('difficulty', null)}>{t('all')}</button>
                    <button onClick={() => handleFilter('difficulty', 'Легкая')}>{t('easy')}</button>
                    <button onClick={() => handleFilter('difficulty', 'Средняя')}>{t('medium')}</button>
                    <button onClick={() => handleFilter('difficulty', 'Тяжелая')}>{t('hard')}</button>
                </div>}
            </div>
            <div className={styles.dropdown}>
                <button className={styles.dropbtn} onClick={() => {setIsStatusOpen(!isStatusOpen);setIsTypeOpen(false);setIsDifficultyOpen(false)}}>
                    {t('statusF')} {filterStatus !== null && <span>({filterStatus ? t('completed') : t('pending')})</span>} <IoIosArrowDown />
                </button>
                {isStatusOpen && <div className={styles.dropdownContent}>
                    <button onClick={() => handleFilter('status', null)}>{t('all')}</button>
                    <button onClick={() => handleFilter('status', true)}>{t('completed')}</button>
                    <button onClick={() => handleFilter('status', false)}>{t('pending')}</button>
                </div>}
            </div>
        </div>
    );
}
