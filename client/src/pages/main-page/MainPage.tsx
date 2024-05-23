import Logo from 'src/assets/logo.svg'
import styles from './MainPage.module.scss';
import { classNames } from 'src/helpers/classNames';
import { TypeAnimation } from 'react-type-animation';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";
import { useTranslation } from 'react-i18next';

export default function MainPage() {
    const navigate = useNavigate()
    const {t} = useTranslation()
    
    return (
        <div className={classNames(styles.MainPage, {}, [])}>
            <header>
                <div className={styles.logo}>
                    <img src={Logo} alt="" />
                    <h2>GeekHub</h2>
                </div>
                <div className={styles.btns}>
                    <button className={styles.login} onClick={() => navigate('/login')}>{t('login')}</button>
                    <button className={styles.entry} onClick={() => navigate('/register')}>{t('signup')}</button>
                </div>
            </header>
            <div className={styles.typing}>
                <TypeAnimation
                    sequence={[
                        t('t1'),
                        1000,
                        t('t2'),
                        1000,
                        t('t3'),
                        1000,
                    ]}
                    speed={50}
                    style={{ textAlign: 'center', margin: '0 auto' }}
                    repeat={Infinity}
                    className={styles.typing}
                />
                <br />
                <MdOutlineKeyboardDoubleArrowDown className={styles.arrow}/>
                <button onClick={() => navigate('/editor')}>
                    <span className={styles.dive}>{t('mainbtn')}</span>
                </button>
                <div className={styles.backgroundCircles}>
                    <div className={`${styles.circle} ${styles.circle1}`}></div>
                    <div className={`${styles.circle} ${styles.circle2}`}></div>
                    <div className={`${styles.circle} ${styles.circle3}`}></div>
                    <div className={`${styles.circle} ${styles.circle4}`}></div>
                    <div className={`${styles.circle} ${styles.circle5}`}></div>
                    <div className={`${styles.circle} ${styles.circle6}`}></div>
                    <div className={`${styles.circle} ${styles.circle7}`}></div>
                </div>
            </div>
        </div>
    );
}
