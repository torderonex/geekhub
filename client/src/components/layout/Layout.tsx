import React, { useMemo } from "react";
import Navbar from "../navbar/Navbar";
import styles from "./Layout.module.scss";
import { classNames } from "src/helpers/classNames";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children }) => {
  const memoizedNavbar = useMemo(() => <Navbar />, []);

  return (
    <div className={classNames(styles.Layout, {}, [])}>
      {memoizedNavbar}
      {children}
    </div>
  );
});

export default Layout;
