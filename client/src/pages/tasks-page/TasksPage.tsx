import TasksTable from 'src/components/tasks-table/TasksTable';
import styles from './TasksPage.module.scss';
import { classNames } from 'src/helpers/classNames';
import TasksFilters from 'src/components/tasks-filters/TasksFilters';
import { useEffect, useState } from 'react';
import { ITask } from 'src/model/ITask';
import taskService from 'src/services/taskService';
import { PulseLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TasksPage() {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<ITask[]>([])
    const [filteredTasks, setFilteredTasks] = useState<ITask[]>([])
    const {t} = useTranslation()

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await taskService.getTasks();
                setTasks(response.data)
                setFilteredTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        if (localStorage.getItem('token') == undefined) {
            navigate('/register');
            return
        }

        fetchTasks();
    }, []);

    return (
        <div className={classNames(styles.TasksPage, {}, [])}>
            <h1>{t('solveProb')}</h1>
            {tasks.length > 0 ? (
                <>
                    <TasksFilters tasks={tasks} setFilteredTasks={setFilteredTasks} />
                    <TasksTable filteredTasks={filteredTasks} />
                </>
            ) : (
                <PulseLoader color={'white'} className={styles.loader}/>
            )}
        </div>
    );
}