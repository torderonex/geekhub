import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import codeSlice from "src/store/reducers/codeSlice";
import chatSlice from "./reducers/chatSlice";
import taskSlice from "./reducers/taskSlice";
import projectsSlice from "./reducers/projectsSlice";
import userSlice from "./reducers/userSlice";

export const rootReducer = combineReducers({
  codeSlice,
  chatSlice,
  projectsSlice,
  taskSlice,
  userSlice
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
