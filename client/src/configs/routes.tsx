import { RouteProps } from "react-router-dom";
import Layout from "src/components/layout/Layout";
import EditorPage from "src/pages/editor-page/EditorPage";
import { InvitePage } from "src/pages/invite-page/InvitePage";
import LoginPage from "src/pages/login-page/LoginPage";
import MainPage from "src/pages/main-page/MainPage";
import RegisterPage from "src/pages/register-page/RegisterPage";
import SingleTask from "src/pages/single-task/SingleTask";
import TasksPage from "src/pages/tasks-page/TasksPage";

export enum routesPath {
  EDITOR = "/editor",
  TASKS = "/tasks",
  SINGLE_TASK = "/tasks/:id",
  LOGIN = "/login",
  REGISTER = "/register",
  MAIN = "/",
  INVITE = "/invite/:inviteCode",
}

export const routerConfig: RouteProps[] = [
  {
    path: routesPath.EDITOR,
    element: (
      <Layout>
        <EditorPage />
      </Layout>
    ),
  },
  // {
  //     path: routesPath.AICHAT,
  //     element: <Layout><AiChatPage/></Layout>
  // },
  {
    path: routesPath.TASKS,
    element: (
      <Layout>
        <TasksPage />
      </Layout>
    ),
  },
  {
    path: routesPath.SINGLE_TASK,
    element: (
      <Layout>
        <SingleTask />
      </Layout>
    ),
  },
  {
    path: routesPath.LOGIN,
    element: <LoginPage />,
  },
  {
    path: routesPath.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: routesPath.MAIN,
    element: <MainPage />,
  },
  {
    path: routesPath.INVITE,
    element: <InvitePage />,
  },
];
