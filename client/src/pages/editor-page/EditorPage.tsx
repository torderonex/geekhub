// @ts-nocheck
import styles from "./EditorPage.module.scss";
import { classNames } from "src/helpers/classNames";
import MyEditor from "src/components/my-editor/MyEditor";
import CodeOutput from "src/components/code-output/CodeOutput";
import { PanelGroup, PanelResizeHandle, Panel } from "react-resizable-panels";
import { RiRobot2Fill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { MdDragIndicator } from "react-icons/md";
import MyButton from "src/components/my-button/MyButton";
import { FaPlay } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import {
  getFileEditorValue,
  getFilesByProjectId,
  getProjectsByUserId,
  removeFileFromNavbar,
  setNavbarFiles,
  setSelectedFile,
  updateFileEditorValue,
} from "src/store/reducers/projectsSlice";
import api from "../../http/index";
import {
  setCodeOutput,
  setEditorValue,
  setIsCodeOutputLoading,
} from "src/store/reducers/codeSlice";
import { FaFileAlt } from "react-icons/fa";
import { SidebarEditor } from "src/components/sidebar-editor/SidebarEditor";
import { useEffect } from "react";
import AiChatPage from "../ai-chat/AiChatPage";
import { openChat } from "src/store/reducers/userSlice";
import { useTranslation } from "react-i18next";
import py from "src/assets/python.svg";
import js from "src/assets/js.svg";
import cpp from "src/assets/cpp.svg";
import go from "src/assets/go.svg";
import { CgExport, CgImport } from "react-icons/cg";

const getFileIcon = (fileName: string) => {
  const extension = fileName.substring(fileName.lastIndexOf("."));

  const fileIcons = {
    javascript: <img src={js} className={styles.langLogo} />,
    python: <img src={py} className={styles.langLogo} />,
    golang: <img src={go} className={styles.langLogo} />,
    "c++": <img src={cpp} className={styles.langLogo} />,
    cpp: <img src={cpp} className={styles.langLogo} />,
  };
  return (
    fileIcons[extension as keyof typeof fileIcons] || (
      <FaFileAlt className={styles.langLogo} />
    )
  );
};

export default function EditorPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { selectedFile, navbarFiles, selectedProject, files } = useAppSelector(
    (state) => state.projectsSlice
  );
  const { user, isChatOpen, isAuth } = useAppSelector(
    (state) => state.userSlice
  );
  const editorValue = useAppSelector((state) => state.codeSlice.editorValue);

  const handleRunCode = () => {
    if (isAuth) {
      const data = {
        entry_file: selectedFile?.fileName,
        project_id: parseInt(String(selectedProject?.id)),
      };

      dispatch(setIsCodeOutputLoading(true));

      api
        .post("/project/compile", data)
        .then((response) => {
          console.log("Успешный ответ:", response.data);
          dispatch(setCodeOutput(response.data.output));
        })
        .catch((error) => {
          console.error("Ошибка при отправке запроса:", error);
        })
        .finally(() => {
          dispatch(setIsCodeOutputLoading(false));
        });
    } else {
      const data = {
        language: selectedFile?.fileLang,
        script: editorValue,
      };
      if (selectedFile?.fileLang === "cpp") {
        data.language = "c++";
      } else if (selectedFile?.fileLang === "go") {
        data.language = "golang";
      }
      dispatch(setIsCodeOutputLoading(true));
      api
        .post("/compiler/script", data)
        .then((response) => {
          console.log("Успешный ответ:", response.data);
          dispatch(setCodeOutput(response.data));
        })
        .catch((error) => {
          console.error("Ошибка при отправке запроса:", error);
        })
        .finally(() => {
          dispatch(setIsCodeOutputLoading(false));
        });
    }
  };

  const languagesDownload = {
    golang: "go",
    "c++": "cpp",
    javascript: "js",
    python: "py",
  };

  const handleDownloadCode = () => {
    if (selectedFile && selectedFile.fileName) {
      const fileName = selectedFile.fileName.split(".")[0];

      if (editorValue) {
        const blob = new Blob([editorValue], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.${
          languagesDownload[
            selectedFile.fileLang as keyof typeof languagesDownload
          ]
        }`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("editorValue is undefined");
      }
    } else {
      console.error("selectedFile or selectedFile.fileName is undefined");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;
        if (selectedFile) {
          dispatch(
            updateFileEditorValue({
              fileId: selectedFile.id,
              editorValue: content,
            })
          );
        }
        dispatch(setEditorValue(content));
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(getProjectsByUserId(user.id));
    }
  }, [user]);

  useEffect(() => {
    dispatch(setNavbarFiles(files));
    if (user) {
      dispatch(getFilesByProjectId(String(selectedProject?.id)));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (user && selectedFile?.id) {
      dispatch(getFileEditorValue(selectedFile.id));

      const interval = setInterval(() => {
        dispatch(getFileEditorValue(selectedFile.id));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [user, selectedFile?.id, dispatch]);

  return (
    <PanelGroup direction="horizontal">
      <Panel
        id="sidebar"
        minSize={20}
        maxSize={45}
        defaultSize={20}
        className={styles.panel}
      >
        <SidebarEditor />
      </Panel>
      <PanelResizeHandle
        style={{ background: "#141416", position: "relative", border: "none" }}
      >
        <MdDragIndicator
          style={{
            position: "absolute",
            left: "-10px",
            top: "50vh",
            color: "rgb(128, 128, 128)",
          }}
        />
      </PanelResizeHandle>

      <Panel id="main-panel" className={styles.panel}>
        <div className={classNames(styles.EditorPage, {}, [])}>
          <div className={styles.editorUpper}>
            <div className={styles.fileNames}>
              {navbarFiles?.map((file, i) => (
                <button
                  className={classNames(
                    styles.fileName,
                    {
                      [styles.selectedFileName]: file.id === selectedFile?.id,
                    },
                    []
                  )}
                  onClick={() => dispatch(setSelectedFile(file))}
                  key={i}
                >
                  {getFileIcon(file.fileLang)}
                  {file.fileName.length > 7
                    ? `${file.fileName.slice(0, 6)}...`
                    : file.fileName}
                  <IoMdClose
                    className={classNames(
                      styles.deleteLogo,
                      { [styles.disabledCursor]: isAuth == false },
                      []
                    )}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFileFromNavbar(file.id));
                    }}
                  />
                </button>
              ))}
            </div>
            <input
              type="file"
              accept=".cpp,.py,.go,.js"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className={classNames(styles.hover, {}, [])}
            >
              <CgExport />
            </label>

            <button
              onClick={handleDownloadCode}
              className={classNames(styles.hover, {}, [])}
            >
              <CgImport />
            </button>
            <button
              className={classNames(styles.hover, {}, [])}
              onClick={() => dispatch(openChat(!isChatOpen))}
            >
              <RiRobot2Fill />
            </button>
            <MyButton
              className={`${styles.runCodeBtn} ${
                selectedFile?.fileLang === "plaintext" ? styles.disabled : ""
              }`}
              onClick={handleRunCode}
              disabled={selectedFile?.fileLang === "plaintext"}
            >
              <FaPlay />
              <span>{t("runCode")}</span>
            </MyButton>
          </div>

          <PanelGroup direction="vertical" style={{ height: "95%" }}>
            <Panel id="top-panel" className="top-panel" defaultSize={75}>
              <PanelGroup direction="horizontal">
                <Panel className={styles.panel}>
                  <MyEditor />
                </Panel>
                {isChatOpen && (
                  <>
                    <PanelResizeHandle
                      style={{
                        background: "#141416",
                        position: "relative",
                        border: "none",
                      }}
                    >
                      <MdDragIndicator
                        style={{
                          position: "absolute",
                          left: "-15px",
                          top: "50%",
                          color: "rgb(128, 128, 128)",
                        }}
                      />
                    </PanelResizeHandle>
                    <Panel
                      defaultSize={45}
                      maxSize={55}
                      minSize={25}
                      className={styles.panel}
                    >
                      <AiChatPage />
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
            <PanelResizeHandle
              style={{
                background: "#141416",
                position: "relative",
                border: "none",
              }}
            >
              <MdDragIndicator
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-8px",
                  rotate: "90deg",
                  color: "rgb(128, 128, 128, 0.7)",
                }}
              />
            </PanelResizeHandle>
            <Panel
              id="bottom-panel"
              className="bottom-panel"
              defaultSize={25}
              style={{ background: "#181717" }}
            >
              <CodeOutput />
            </Panel>
          </PanelGroup>
        </div>
      </Panel>
    </PanelGroup>
  );
}
