import { ChangeEvent, useState } from "react";
import { FiFilePlus, FiPlus } from "react-icons/fi";

import styles from "./SideBarEditor.module.scss";
import {
  Project,
  addFile,
  addProject,
  setSelectedProject,
} from "src/store/reducers/projectsSlice";
import { classNames } from "src/helpers/classNames";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import { Files } from "../files/Files";
import Modal from "../modal/Modal";
import MyButton from "../my-button/MyButton";
import { useTranslation } from "react-i18next";

export const SidebarEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.userSlice);
  const { projects, selectedProject, files } = useAppSelector(
    (state) => state.projectsSlice
  );
  const user = useAppSelector((state) => state.userSlice.user);
  const [addNewProjectInput, setAddNewProjectInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [addNewFileInput, setAddNewFileInput] = useState("");
  const { t } = useTranslation();

  const handleAddNewProjectInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddNewProjectInput(e.target.value);
  };

  const handleAddNewFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddNewFileInput(e.target.value);
  };

  const handleSelect = (project: Project) => {
    setIsOpen(false);
    dispatch(setSelectedProject(project));
  };

  const handleIsModalOpen = () => {
    if (isAuth == false) return;
    setIsModalOpen(!isModalOpen);
    setAddNewProjectInput("");
  };

  const handleIsFileModalOpen = () => {
    if (isAuth == false) return;
    setIsFileModalOpen(!isFileModalOpen);
    setAddNewFileInput("");
  };

  const handleAddProject = () => {
    const isValidName = /^[a-zA-Z0-9_-\s]+$/.test(addNewProjectInput);

    if (addNewProjectInput.trim() && isValidName) {
      const ownerId: number | null = user?.id ?? null;
      dispatch(
        addProject({ projectName: addNewProjectInput, owner_id: ownerId })
      );

      setIsModalOpen(!isModalOpen);
      setAddNewProjectInput("");
    } else {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 3000);
    }
  };

  const handleAddNewFile = () => {
    const validExtensions = [".py", ".cpp", ".js", ".go"];
    const fileName = addNewFileInput.trim();
    const fileExtension = fileName.slice(fileName.lastIndexOf("."));

    const isFileNameValid = /^[a-zA-Z0-9_-]+\.[a-zA-Z]+$/.test(fileName);
    const isExtensionValid = validExtensions.includes(fileExtension);
    const isFileNameUnique = !files.some((file) => file.fileName === fileName);
    console.log(
      fileName,
      isFileNameValid,
      isFileNameUnique,
      isExtensionValid,
      "test"
    );

    if (fileName && isFileNameValid && isExtensionValid && isFileNameUnique) {
      if (selectedProject) {
        dispatch(
          addFile({
            selectedProject: selectedProject,
            fileName: fileName,
          })
        );
      } else {
        console.error("selectedProject is null");
      }

      setIsFileModalOpen(!isFileModalOpen);
      setAddNewFileInput("");
    } else {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 3000);
    }
  };

  console.log(addNewFileInput);

  return (
    <div className={styles.Sidebar}>
      <div className={styles.editorSidebar}>
        <div className={styles.sideBarExplorer}>
          <span>{t("explorer")}</span>
        </div>
        <div className={styles.projects}>
          <span>{t("projects")}</span>
          <FiPlus
            className={classNames(
              styles.icon,
              { [styles.disabled]: isAuth == false },
              []
            )}
            onClick={handleIsModalOpen}
          />
        </div>
        <div className={styles.dropdown}>
          <div
            className={styles.dropdownHeader}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* {selectedProject.projectName} */}
            {t("chooseProject")}
            <span className={styles.dropdownArrow}>&#9660;</span>
          </div>
          {isOpen && (
            <div className={styles.dropdownList}>
              <ul>
                {projects.map((project) => (
                  <li
                    key={project.projectName}
                    className={classNames(
                      styles.dropdownItem,
                      {
                        [styles.selectedProjectItem]:
                          project.projectName === selectedProject.projectName,
                      },
                      []
                    )}
                    onClick={() => handleSelect(project)}
                  >
                    {project.projectName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className={styles.projectInfo}>
          {selectedProject
            ? selectedProject.projectName
            : "No project selected"}

          <div>
            <FiFilePlus
              className={classNames(
                styles.icon,
                { [styles.disabled]: isAuth == false },
                []
              )}
              onClick={() => {
                if (isAuth == false) return;
                setIsFileModalOpen(!isFileModalOpen);
              }}
            />
          </div>
        </div>
        <Files />
        <Modal
          isOpen={isModalOpen}
          onClose={handleIsModalOpen}
          className={styles.inviteModal}
          title={t("addProject")}
        >
          <input
            type="text"
            className={styles.modalInput}
            placeholder={t("enterProject")}
            value={addNewProjectInput}
            onChange={handleAddNewProjectInputChange}
          />
          <MyButton onClick={handleAddProject} className={styles.modalBtn}>
            {t("create")}
          </MyButton>
          {isError && (
            <p className={styles.errorText}>{t("incorrectProject")}</p>
          )}
        </Modal>
        <Modal
          isOpen={isFileModalOpen}
          onClose={handleIsFileModalOpen}
          className={styles.inviteModal}
          title={t("addFile")}
        >
          <input
            type="text"
            className={styles.modalInput}
            placeholder={t("enterFile")}
            value={addNewFileInput}
            onChange={handleAddNewFileInputChange}
          />
          <MyButton onClick={handleAddNewFile} className={styles.modalBtn}>
            {t("create")}
          </MyButton>
          {isError && <p className={styles.errorText}>{t("incorrectFile")}</p>}
        </Modal>
      </div>
    </div>
  );
};
