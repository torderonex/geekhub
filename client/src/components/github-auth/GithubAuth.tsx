import styles from './GithubAuth.module.scss';
import github from 'src/assets/github.svg'


export default function GithubAuth() {
    return (
        <button className={styles.btn}>
            <img src={github} className={styles.icon} /> Continue with GitHub
        </button>
    );
}