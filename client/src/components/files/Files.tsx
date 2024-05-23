// @ts-nocheck
import { classNames } from "src/helpers/classNames";
import styles from "./Files.module.scss";
import { FileItem } from "../file-item/FileItem";
import { useAppSelector } from "src/hooks/redux-hooks";

export const Files = () => {
  const files = useAppSelector((state) => state.projectsSlice.files);

  return (
    <div
      className={classNames(styles.container, {}, [])}
      style={{ width: "100%" }}
    >
      {files.map((file: File) => (
        <FileItem file={file} key={file.id} />
      ))}
    </div>
  );
};
