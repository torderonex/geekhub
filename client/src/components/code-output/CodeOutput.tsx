import React, { useEffect, useState } from "react";
import styles from "./CodeOutput.module.scss";
import { classNames } from "src/helpers/classNames";
import { AiOutlineStop } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import { useTranslation } from "react-i18next";
import { setCodeOutput } from "src/store/reducers/codeSlice";

export default function CodeOutput() {
  const { codeOutput, isError, isCodeOutputLoading } = useAppSelector(
    (state) => state.codeSlice
  );
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isCodeOutputLoading) {
      setLoadingStartTime(Date.now());
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const timeElapsed = currentTime - loadingStartTime;
        setElapsedTime(timeElapsed / 1000);
      }, 1);

      return () => clearInterval(intervalId);
    } else {
      setElapsedTime(0);
    }
  }, [isCodeOutputLoading, loadingStartTime]);

  return (
    <div className={classNames(styles.container, {}, [])}>
      <div className={styles.outputUpper}>
        <span>{t("log")}</span>
        <AiOutlineStop onClick={() => dispatch(setCodeOutput(null))} />
      </div>

      {isCodeOutputLoading ? (
        <div className={styles.loading}>
          {t("loading")} {elapsedTime.toFixed(3)}s
        </div>
      ) : (
        <div
          className={classNames(
            styles.output,
            { [styles.isError]: isError },
            []
          )}
        >
          {codeOutput ? (
            <textarea readOnly>{codeOutput}</textarea>
          ) : (
            t("nocode")
          )}
        </div>
      )}
    </div>
  );
}
