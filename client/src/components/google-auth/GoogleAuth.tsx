import styles from './GoogleAuth.module.scss';
import google from 'src/assets/google.svg'

export default function GoogleAuth() {
    return (
        <button className={styles.btn}>
            <img src={google} className={styles.icon} /> Continue with Google
        </button>
    );
}