// @ts-nocheck
import React, { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import styles from "./FileItem.module.scss";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";

import { LANGUAGE_SNIPPETS } from "src/consts/language-snippets";
import {
  setEditorLanguage,
  setEditorValue,
} from "src/store/reducers/codeSlice";
import { FiCheck, FiEdit, FiX } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import {
  File,
  addFileToNavbar,
  deleteFile,
  renameFileInProject,
  setSelectedFile,
  updateFileName,
} from "src/store/reducers/projectsSlice";
import { classNames } from "src/helpers/classNames";
import { useTranslation } from "react-i18next";
import py from "src/assets/python.svg";
import js from "src/assets/js.svg";
import cpp from "src/assets/cpp.svg";
import go from "src/assets/go.svg";

{
  /* <IoLogoPython style={{ color: "blue" }} className={styles.langLogo} /> */
}
const fileIcons = {
  ".js": <img src={js} className={styles.langLogo} />,

  ".py": <img src={py} className={styles.langLogo} />,
  ".go": <img src={go} className={styles.langLogo} />,
  ".cpp": <img src={cpp} className={styles.langLogo} />,
};

const languages = {
  ".js": "javascript",
  ".py": "python",
  ".cpp": "cpp",
  ".go": "go",
};
interface FileItemProps {
  file: File;
}

export const FileItem: React.FC<FileItemProps> = ({ file }) => {
  console.log(file, "file");
  const { isAuth } = useAppSelector((state) => state.userSlice);
  const [fileName, setFileName] = useState(file.fileName);
  const [isEdit, setIsEdit] = useState(false);
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(
    (state) => state.projectsSlice.selectedProject
  );

  const [tempFileName, setTempFileName] = useState(file.fileName);
  const files = useAppSelector((state) => state.projectsSlice.files);
  const { t } = useTranslation();

  const handleCheckClick = () => {
    const extension = tempFileName.substring(tempFileName.lastIndexOf("."));
    const fileNameWithoutExtension = tempFileName.substring(
      0,
      tempFileName.lastIndexOf(".")
    );
    const validNamePattern = /^[a-zA-Z0-9_]+$/;
    const validExtensions = Object.keys(languages);
    const editorLanguage = languages[extension as keyof typeof languages];
    const dotCount = (tempFileName.match(/\./g) || []).length;
    const fileNameExists = files.some(
      (f) => f.fileName === tempFileName && f.id !== file.id
    );

    if (
      (validExtensions.includes(extension) || extension === ".txt") &&
      validNamePattern.test(fileNameWithoutExtension) &&
      dotCount === 1 &&
      !fileNameExists
    ) {
      setFileName(tempFileName);
      setIsEdit(false);
      dispatch(setEditorLanguage(editorLanguage));
      dispatch(
        setEditorValue(
          LANGUAGE_SNIPPETS[editorLanguage as keyof typeof LANGUAGE_SNIPPETS]
        )
      );
      if (isAuth) {
        if (selectedProject) {
          dispatch(
            updateFileName({
              fileId: file.id,
              newFileName: tempFileName,
            })
          );
        }
      } else {
        if (selectedProject) {
          dispatch(
            renameFileInProject({
              projectId: selectedProject.id,
              fileId: file.id,
              newFileName: tempFileName,
            })
          );
        }
      }
    } else {
      alert(t("invalidFileName"));
    }
  };
  const getFileIcon = (fileName: string) => {
    const extension = fileName.substring(fileName.lastIndexOf("."));
    return (
      fileIcons[extension as keyof typeof fileIcons] || (
        <FaFileAlt className={styles.langLogo} />
      )
    );
  };

  return (
    <div>
      {!isEdit && (
        <div
          className={styles.files}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`.${styles.filesRight}`)) {
              dispatch(setSelectedFile(file));
              dispatch(addFileToNavbar(file));
            }
          }}
        >
          <div className={styles.filesLeft}>
            {getFileIcon(file.fileName)}
            <p>{file.fileName}</p>
          </div>
          <div className={styles.filesRight}>
            <FiEdit
              className={styles.editLogo}
              onClick={() => {
                setTempFileName(file.fileName);
                setIsEdit(true);
              }}
            />
            <IoMdClose
              className={classNames(
                styles.deleteLogo,
                { [styles.disabled]: isAuth == false },
                []
              )}
              onClick={() => {
                dispatch(deleteFile({ fileId: file.id, files: files }));
              }}
            />
          </div>
        </div>
      )}
      {isEdit && (
        <div className={styles.files}>
          <div className={styles.filesLeft}>
            {getFileIcon(tempFileName)}
            <input
              type="text"
              value={tempFileName}
              onChange={(e) => setTempFileName(e.target.value)}
              className={styles.fileInput}
            />
          </div>
          <div>
            <FiCheck className={styles.icon} onClick={handleCheckClick} />
            <FiX
              className={styles.icon}
              onClick={() => {
                setIsEdit(false);
                setTempFileName(fileName);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
