import styles from './TasksTable.module.scss';
import { classNames } from 'src/helpers/classNames';
import { SiTicktick } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { ITask } from 'src/model/ITask';
import { useTranslation } from 'react-i18next';

interface TasksTableProps {
    filteredTasks: ITask[];
}

export default function TasksTable({filteredTasks}: TasksTableProps) {
    const navigate = useNavigate()
    const {t} = useTranslation()

    return (
        <div className={classNames(styles.TasksTable, {}, [])}>
            {filteredTasks && filteredTasks.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '70px'}}>{t('status')}</th>
                            <th style={{ textAlign: 'left' }}>{t('title')}</th>
                            <th style={{ width: '100px'}}>{t('diff')}</th>
                            <th style={{ width: '100px'}}>{t('type')}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredTasks.map(task => (
                        <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                            <td className={styles.status}>
                                {task.status ? <SiTicktick /> : ''}
                            </td>
                            <td>{task.title}</td>
                            <td className={classNames(styles.center, {
                                    [styles.easy]: task.difficulty === 'Легкая',
                                    [styles.medium]: task.difficulty === 'Средняя',
                                    [styles.hard]: task.difficulty === 'Тяжелая'
                                }, [])}
                            >{task.difficulty}</td>
                            <td className={styles.center}>{task.type}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <span style={{color: 'white'}}>{t('noTasksF')}.</span>
            )}
        </div>
    );
}
