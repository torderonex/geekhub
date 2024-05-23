import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.scss";
import { classNames } from "src/helpers/classNames";
import MyInput from "src/components/my-input/MyInput";
import FormButton from "src/components/form-button/FormButton";
import { useAppDispatch } from "src/hooks/redux-hooks";
import { registration } from "src/store/reducers/userSlice";
import bg from 'src/assets/vovzan.svg'
import Logo from 'src/assets/logo.svg'
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {t} = useTranslation()
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nickname: "", password: "" });

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
      dispatch(registration({nickname, password}))
      navigate('/editor')
      console.log("Form submitted with:", { nickname, password });
    }
  };

  return (
    <div className={classNames(styles.RegisterPage, {}, [])}>
      <div className={styles.formcont}>
        <form className={styles.container} onSubmit={handleSubmit}>
          <header onClick={() => navigate('/')}>
            <img src={Logo} />
            <h2>GeekHub</h2>
          </header>
          <h6>{t('createAcc')}</h6>
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
          <FormButton title={t('signup')} />
          {/* <b className={styles.login}>Log in with accounts</b>
          <div className={styles.icons}>
            <GithubAuth />
            <GoogleAuth />
          </div> */}
          {/* <div className={styles.separator}></div> */}
          <b>
            {t('notNew')} <Link to="/login">{t('loginIns')}</Link>
          </b>
        </form>
      </div>
      <div className={styles.divImg}>
        <img src={bg} loading="lazy"/>
      </div>
    </div>
  );
}
