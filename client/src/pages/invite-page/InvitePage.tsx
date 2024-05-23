import { useEffect } from "react";
import styles from "./InvitePage.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../http/index";
import { useTranslation } from "react-i18next";

export const InvitePage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const decodedInviteCode = JSON.parse(atob(String(inviteCode)));
  const {t} = useTranslation()

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const formattedData = {
          project_id: parseInt(decodedInviteCode.project_id),
        };
        await api.put("project/invite/accept", formattedData);
        navigate("/editor");
      } catch (error) {
        console.error("Failed to accept invite:", error);
        navigate("/login");
      }
    };
    acceptInvite();
  }, [decodedInviteCode, navigate]);
  return <div className={styles.invitePage}>{t('redirectWait')}</div>;
};
