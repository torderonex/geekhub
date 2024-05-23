import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import { classNames } from "src/helpers/classNames";
import MyInput from "src/components/my-input/MyInput";
import FormButton from "src/components/form-button/FormButton";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import { login } from "src/store/reducers/userSlice";
import bg from 'src/assets/vovzan.svg'
import Logo from 'src/assets/logo.svg'
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {isAuth} = useAppSelector(state => state.userSlice)
  const {t} = useTranslation()
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nickname: "", password: "" });

  useEffect(() => {
    if (isAuth) navigate('/editor')
  }, [])

  const validate = () => {
    let nicknameError = "";
    let passwordError = "";

    if (!nickname) {
      nicknameError = "Required field";
    }

    if (!password) {
      passwordError = "Required field";
    }

    if (nicknameError || passwordError) {
      setErrors({ nickname: nicknameError, password: passwordError });
      return false;
    }

    setErrors({ nickname: "", password: "" });
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      dispatch(login({nickname, password}))
      navigate('/editor')
    }
  };

  return (
    <div className={classNames(styles.LoginPage, {}, [])}>
      <div className={styles.formcont}>
      <form className={styles.container} onSubmit={handleSubmit}>
        <header onClick={() => navigate('/')}>
          <img src={Logo} alt="" />
          <h2>GeekHub</h2>
        </header>
        <h6>{t('loginT')}</h6>
        <MyInput
          placeholder={t('nickname').toUpperCase()}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        {errors.nickname && <span className={styles.error}>{errors.nickname}</span>}
        <MyInput
          placeholder={t('password').toUpperCase()}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        {errors.password && <span className={styles.error}>{errors.password}</span>}
        <FormButton title={t('login')} />
        {/* <b className={styles.login}>{t('loginW')}</b>
        <div className={styles.icons}>
          <GithubAuth />
          <GoogleAuth />
        </div> */}
        {/* <div className={styles.separator}></div> */}
        <b>
          {t('new')} <Link to="/register">{t('createAcc')}</Link>
        </b>
      </form>
      </div>
      <div className={styles.divImg}>
        <img src={bg} loading="lazy"/>
      </div>
    </div>
  );
}
