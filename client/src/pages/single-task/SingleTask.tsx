import styles from './SingleTask.module.scss';
import { classNames } from 'src/helpers/classNames';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { MdDragIndicator } from 'react-icons/md';
import MyButton from 'src/components/my-button/MyButton';
import TaskEditor from 'src/components/task-editor/TaskEditor';
import TaskTests from 'src/components/task-tests/TaskTests';
import TaskSidebar from 'src/components/task-sidebar/TaskSidebar';
import taskService from 'src/services/taskService';
import { useAppDispatch, useAppSelector } from 'src/hooks/redux-hooks';
import { useEffect, useState } from 'react';
import { setCode, setIsLoading } from 'src/store/reducers/taskSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ITask } from 'src/model/ITask';
import { useTranslation } from 'react-i18next';
import { FaPlay } from 'react-icons/fa6';

export default function SingleTask() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch();
    const { id } = useParams<string>();
    const [currentTask, setCurrentTask] = useState<ITask>()
    const {code, language} = useAppSelector(state => state.taskSlice)
    const {user} = useAppSelector(state => state.userSlice)
    const [tests, setTests] = useState<string[]>([])
    const [testOutputs, setTestOutputs] = useState([])
    const {t} = useTranslation()

    useEffect(() => {
        if (localStorage.getItem('token') == undefined) {
            navigate('/register');
            return
        }
        if (id) {
          const loadTask = async () => {
            try {
              const response = await taskService.getTaskById(parseInt(id));
              setCurrentTask(response.data);
              setTestOutputs(response.data.testOutputs);
              dispatch(setCode(response.data.defaultValue))
            } catch (e) {
              console.log(e);
            }
          };
    
          loadTask();
        }
      }, [id]);

    const handleSubmit = async () => {
        if (id && user?.id) {
            dispatch(setIsLoading(true));
            try {
              const response = await taskService.testSolution(code, language, parseInt(id), user.id);
              setTests(response.data.split('\n'));
            } catch (e) {
              console.log(e);
            } finally {
              dispatch(setIsLoading(false));
            }
        }
    }

    return (
        <PanelGroup direction="horizontal">
            <Panel id="sidebar" minSize={30} maxSize={35} defaultSize={30} className={styles.panel}>
                <TaskSidebar title={currentTask?.title} description={currentTask?.description} status={currentTask?.status}/>
            </Panel>
            <PanelResizeHandle
                style={{ background: "#141416", position: "relative" }}
            >
                <MdDragIndicator
                style={{
                    position: "absolute",
                    left: "-10px",
                    top: "50vh",
                    color: "rgb(128, 128, 128)",
                }}
                />
            </PanelResizeHandle>

            <Panel id="main-panel" className={styles.panel}>
                <div className={classNames(styles.SingleTask, {}, [])}>
                    <div className={styles.editorUpper}>
                        <MyButton className={styles.runCodeBtn} onClick={handleSubmit}>
                            <FaPlay />  
                            <span>{t('submit')}</span>
                        </MyButton>
                    </div>

                    <PanelGroup direction="vertical" style={{ height: "95%" }}>
                        <Panel id="top-panel" className="top-panel" defaultSize={75}>
                            <TaskEditor/>
                        </Panel>
                        <PanelResizeHandle
                            style={{ background: "#141416", position: "relative" }}
                        >
                            <MdDragIndicator
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "-10px",
                                rotate: "90deg",
                                color: "rgb(128, 128, 128, 0.7)",
                            }}
                            />
                        </PanelResizeHandle>
                        <Panel
                            id="bottom-panel"
                            className="bottom-panel"
                            defaultSize={45}
                            style={{ background: "#181717" }}
                        >
                            <TaskTests tests={tests} testOutputs={testOutputs}/>
                        </Panel>
                    </PanelGroup>
                </div>
            </Panel>
        </PanelGroup>
    );
}