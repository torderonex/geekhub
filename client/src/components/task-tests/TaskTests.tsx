import { useTranslation } from 'react-i18next';
import styles from './TaskTests.module.scss';
import { classNames } from 'src/helpers/classNames';
import { useAppSelector } from 'src/hooks/redux-hooks';

type Test = {
    input: string;
    output: string;
}

interface TaskTests {
    tests: string[];
    testOutputs: Test[]
}

export default function TaskTests({tests, testOutputs}: TaskTests) {
    const {isLoading} = useAppSelector(state => state.taskSlice)
    const {t} = useTranslation()

    return (
        <div className={classNames(styles.TaskTests, {[styles.loading]: isLoading}, [])}>
            {testOutputs?.map((testCase, i) => 
                <div className={styles.case} key={i}>
                    <h1 className={classNames(styles.title, {[styles.titleFailed]: tests[i]?.includes('failed') || tests[i]?.includes('File')  || tests[i]?.includes('/tmp/'), [styles.titlePassed]: tests[i]?.includes('passed')}, [])}>Case {i+1}</h1>
                    <span>arr =</span>
                    <code>{JSON.stringify(testCase.input)}</code>
                    <span>{t('testExp')}</span>
                    <code>{JSON.stringify(testCase.output)}</code>
                    <span>{t('testRes')}</span>
                    <code>{tests[i] ? tests[i] : t('testNope')}</code>
                </div>
            )}
        </div>
    );
}