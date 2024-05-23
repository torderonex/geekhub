import { useState } from "react";
import styles from "./Navbar.module.scss";
import { classNames } from "src/helpers/classNames";
import { FaCode } from "react-icons/fa6";
import { GoCodeReview } from "react-icons/go";
import { CiLogin, CiLogout } from "react-icons/ci";
import { MdLanguage } from "react-icons/md";
import { PiMoonStars } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegEnvelope } from "react-icons/fa";
import Modal from "../modal/Modal";
import MyInput from "../my-input/MyInput";
import { SiLeetcode } from "react-icons/si";
import MyButton from "../my-button/MyButton";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import { logout } from "src/store/reducers/userSlice";
import { PulseLoader } from "react-spinners";
import ChatService from "src/services/chatService";
import Markdown from "react-markdown";
import { processText } from "src/helpers/processText";
import { resetProjectState } from "src/store/reducers/projectsSlice";
import { useTheme } from "src/hooks/useTheme";
import api from "../../http/index";
import Logo from "src/assets/logo.svg";
import LangSwitcher from "../lang-switcher/LangSwitcher";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toggleTheme } = useTheme();

  const [inviteLink, setInviteLink] = useState<string>(
    "localhost:5173/inviteLink"
  );
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewedCode, setReviewedCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const { user, isAuth, isChatOpen } = useAppSelector(
    (state) => state.userSlice
  );
  const { selectedProject } = useAppSelector((state) => state.projectsSlice);
  const { editorValue } = useAppSelector((state) => state.codeSlice);

  async function handleResponse() {
    try {
      const response = await ChatService.reviewCode({ code: editorValue });
      setReviewedCode(response.data.message);
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }
  }

  const handleIsModalOpen = () => {
    setIsModalOpen(!isModalOpen);
    setIsCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setIsCopied(true);
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
        setIsCopied(false);
      });
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetProjectState());
    navigate("/");
  };

  const handleTasksClick = () => {
    isAuth ? navigate("/tasks") : navigate("/login");
  };

  const handleInviteClick = async () => {
    if (isAuth) {
      try {
        const formattedData = {
          project_id: selectedProject.id,
        };
        const response = await api.post("project/invite/create", formattedData);
        console.log(response.data, "resp.data");
        setInviteLink(`http://localhost:5173${response.data.link}`);
        handleIsModalOpen();
      } catch (error) {
        console.error("Error creating invite:", error);
      }
    } else {
      navigate("/login");
    }
  };

  const handleCodeReview = () => {
    setIsReviewOpen(!isReviewOpen);
    handleResponse();
  };

  const handleIsReviewClose = () => {
    setIsReviewOpen(false);
    setReviewedCode("");
  };

  return (
    <div className={classNames(styles.Navbar, {}, [])}>
      <div className={styles.icons}>
        {isAuth ? (
          <button className={styles.profile}>
            <div className={styles.cicrle}>
              {user?.nickname.slice(0, 1).toUpperCase()}
            </div>
          </button>
        ) : (
          <div className={styles.logo} onClick={() => navigate("/")}>
            <img src={Logo} />
          </div>
        )}
        <button
          className={classNames(
            styles.hover,
            { [styles.active]: pathname === "/editor" },
            []
          )}
          onClick={() => navigate("/editor")}
        >
          <FaCode />
        </button>
        {/* <button className={classNames(styles.hover, {}, [])} onClick={() => dispatch(openChat(!isChatOpen))}>
                    <GoDependabot />
                </button> */}
        {isAuth && (
          <button
            className={classNames(
              styles.hover,
              { [styles.active]: pathname.slice(0, 6) === "/tasks" },
              []
            )}
            onClick={handleTasksClick}
          >
            <SiLeetcode />
          </button>
        )}
        {isAuth && (
          <button
            className={classNames(styles.hover, {}, [])}
            onClick={handleInviteClick}
          >
            <FaRegEnvelope />
          </button>
        )}
      </div>
      <div className={styles.icons}>
        {/* <button className={styles.hover}>
          <MdLanguage />
        </button> */}
        <LangSwitcher className={styles.hover}>
          <MdLanguage />
        </LangSwitcher>
        <button className={styles.hover} onClick={toggleTheme}>
          <PiMoonStars />
        </button>
        {!isAuth && (
          <button
            className={styles.hover}
            onClick={() => navigate("/register")}
          >
            <CiLogin />
          </button>
        )}
        {isAuth && (
          <button className={styles.hover} onClick={handleLogout}>
            <CiLogout />
          </button>
        )}
      </div>
      {pathname === "/editor" && (
        <button className={styles.reviewCode} onClick={handleCodeReview}>
          <GoCodeReview />
        </button>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={handleIsModalOpen}
        className={styles.inviteModal}
        title={t("invitePeople")}
      >
        <MyInput readOnly value={inviteLink} />
        <MyButton onClick={handleCopy} className={styles.modalBtn}>
          {isCopied ? t("copied") : t("copy")}
        </MyButton>
      </Modal>
      <Modal
        isOpen={isReviewOpen}
        onClose={handleIsReviewClose}
        className={styles.inviteModal}
        title={t("codeReview")}
      >
        {reviewedCode !== "" ? (
          <div className={styles.markdown}>
            <Markdown>{processText(reviewedCode)}</Markdown>
          </div>
        ) : (
          <PulseLoader color={"white"} className={styles.loader} />
        )}
      </Modal>
    </div>
  );
}
