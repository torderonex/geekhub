import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../http/index";

export interface File {
  id: number;
  fileName: string;
  fileLang: string;
  editorValue?: string;
  projectId: number;
}

export interface Project {
  id: number;
  projectName: string;
  owner_id: null | number;
  path?: null | string;
}

type BackendProject = Omit<Project, "projectName"> & { name: string };

interface initialState {
  projects: Project[];
  files: File[];
  selectedProject: null | Project;
  selectedFile: null | File;
  navbarFiles: null | File[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getProjectsByUserId = createAsyncThunk(
  "users/fetchByIdStatus",
  async (userId: number) => {
    const response = await api.get(`project/all/${userId}`);

    return response.data;
  }
);

export const getFileEditorValue = createAsyncThunk(
  "files/getEditorValue",
  async (fileId: number) => {
    if (fileId) {
      const response = await api.get(`project/file/${fileId}`);
      return response.data;
    }
  }
);

interface UpdateFileEditorValuePayload {
  fileId: number;
  editorValue: string;
}

interface UpdateFileEditorValueResponse {
  content: string;
}

export const updateFileEditorValue = createAsyncThunk<
  UpdateFileEditorValueResponse,
  UpdateFileEditorValuePayload
>("files/updateEditorValue", async ({ fileId, editorValue }) => {
  const formattedData = {
    content: editorValue,
  };
  const response = await api.put(`project/file/${fileId}`, {
    ...formattedData,
  });
  return response.data;
});

interface UpdateFileNameParams {
  fileId: number;
  newFileName: string;
}

export const updateFileName = createAsyncThunk<File, UpdateFileNameParams>(
  "files/updateFileName",
  async ({ fileId, newFileName }) => {
    const formattedData = {
      new_name: newFileName,
    };
    const response = await api.put<File>(
      `project/file/rename/${fileId}`,
      formattedData
    );
    return response.data;
  }
);

export const getFilesByProjectId = createAsyncThunk(
  "files/fetchByProjectIdStatus",
  async (projId: string) => {
    const response = await api.get(`project/files/${projId}`);
    return response.data;
  }
);

export const addProject = createAsyncThunk(
  "projects/addProject",
  async (params: Omit<Project, "path" | "id">) => {
    const { projectName, owner_id } = params;
    const formattedData = {
      name: projectName,
      owner_id: owner_id,
    };
    const response = await api.post(`project/create`, formattedData);

    return response.data;
  }
);

export const addFile = createAsyncThunk(
  "files/addFile",
  async ({
    selectedProject,
    fileName,
  }: {
    selectedProject: Project;
    fileName: string;
  }) => {
    const formattedData = {
      name: fileName,
      project_id: selectedProject.id,
    };

    const response = await api.post(`project/file/create`, formattedData);
    return response.data;
  }
);
interface DeleteFileArgs {
  fileId: number;
  files: File[];
}

export const deleteFile = createAsyncThunk<
  { id: number },
  DeleteFileArgs,
  { rejectValue: string }
>("files/deleteFile", async ({ fileId, files }, { rejectWithValue }) => {
  if (files.length === 1) {
    return rejectWithValue("Cannot delete the last file");
  } else {
    const response = await api.delete(`project/file/${fileId}`);
    return response.data;
  }
});

const initialState: initialState = {
  projects: [
    {
      id: 1,
      projectName: "MyProject",
      owner_id: null,
      path: null,
    },
  ],
  files: [
    {
      id: 1,
      fileName: "main.js",
      fileLang: "javascript",
      projectId: 1,
    },
  ],

  selectedProject: null,
  selectedFile: null,
  navbarFiles: [],
  status: "idle",
  error: null,
};

if (initialState.projects.length > 0) {
  initialState.selectedProject = initialState.projects[0];

  if (initialState.files.length > 0) {
    initialState.selectedFile = initialState.files[0];

    initialState.selectedFile.editorValue = `function greet(name) {\n\tconsole.log("I am " + name + "! JS");\n}\n\ngreet("compiler");`;
    initialState.navbarFiles = initialState.files;
  }
}

export const projectsSlice = createSlice({
  name: "projectsSlice",
  initialState,
  reducers: {
    renameFileInProject: (
      state,
      action: PayloadAction<{
        projectId: number;
        fileId: number;
        newFileName: string;
      }>
    ) => {
      const { projectId, fileId, newFileName } = action.payload;
      const fileIndex = state.files.findIndex(
        (f) => f.id === fileId && f.projectId === projectId
      );

      if (fileIndex !== -1) {
        state.files[fileIndex].fileName = newFileName;

        const fileExtension = newFileName.split(".").pop();
        const languages: Record<string, string> = {
          go: "go",
          js: "javascript",
          py: "python",
          cpp: "cpp",
          txt: "plaintext",
        };
        const newLanguage = languages[fileExtension as keyof typeof languages];

        if (newLanguage) {
          state.files[fileIndex].fileLang = newLanguage;
        }

        if (state.navbarFiles) {
          const navbarFileIndex = state.navbarFiles.findIndex(
            (f) => f.id === fileId
          );
          if (navbarFileIndex !== -1) {
            state.navbarFiles[navbarFileIndex].fileName = newFileName;
            state.navbarFiles[navbarFileIndex].fileLang = newLanguage;
          }
        }

        if (state.selectedFile && state.selectedFile.id === fileId) {
          state.selectedFile = {
            ...state.selectedFile,
            fileName: newFileName,
            fileLang: newLanguage,
          };
        }
      }
    },

    setSelectedProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
      const projectFiles = state.files.filter(
        (file) => file.projectId === state.selectedProject?.id
      );
      if (projectFiles.length > 0) {
        state.selectedFile = projectFiles[0];
      } else {
        state.selectedFile = null;
      }
    },

    setSelectedFile: (state, action: PayloadAction<File>) => {
      state.selectedFile = action.payload;
    },

    addFileToNavbar: (state, action: PayloadAction<File>) => {
      const newFile = action.payload;
      const existingFile = state.navbarFiles?.find(
        (file) => file.id === newFile.id
      );
      if (!existingFile) {
        state.navbarFiles = [...(state.navbarFiles || []), newFile];
      }
    },

    removeFileFromNavbar: (state, action: PayloadAction<number>) => {
      const fileIdToRemove = action.payload;

      if ((state.navbarFiles?.length || 0) === 1) {
        return;
      }

      state.navbarFiles =
        state.navbarFiles?.filter((file) => file.id !== fileIdToRemove) || [];

      if (state.selectedFile && state.selectedFile.id === fileIdToRemove) {
        const index = state.navbarFiles?.findIndex(
          (file) => file.id !== fileIdToRemove
        );
        if (index !== -1) {
          state.selectedFile = state.navbarFiles[index];
        } else {
          state.selectedFile = null;
        }
      }
    },

    setNavbarFiles(
      state,
      action: PayloadAction<
        {
          id: number;
          projectId: number;
          fileName: string;
          fileLang: string;
          editorValue?: string;
        }[]
      >
    ) {
      state.navbarFiles = action.payload;
    },

    resetProjectState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjectsByUserId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProjectsByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.projects = action.payload.map((project: BackendProject) => ({
          id: project.id,
          projectName: project.name,
          owner_id: project.owner_id ? project.owner_id : null,
          path: project.path,
        }));

        state.selectedProject = state.projects[0] || null;
        state.selectedFile = null;
        state.navbarFiles = [];

        if (state.selectedProject) {
          const projectFiles = state.files.filter(
            (file) => file.projectId === state.selectedProject?.id
          );
          if (projectFiles.length > 0) {
            state.selectedFile = projectFiles[0];
            state.navbarFiles = projectFiles;
          }
        }
      })
      .addCase(getProjectsByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch projects.";
      })
      .addCase(getFilesByProjectId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getFilesByProjectId.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.files = action.payload;
        state.selectedFile = { ...state.files[0], editorValue: "" };
        state.navbarFiles = action.payload;
      })
      .addCase(getFilesByProjectId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch files.";
      })
      .addCase(addProject.fulfilled, (state, action) => {
        const formattedData = {
          id: action.payload.id,
          projectName: action.payload.name,
          owner_id: action.payload.owner_id,
        };
        state.projects.push(formattedData);
      })
      .addCase(addFile.fulfilled, (state, action) => {
        state.files.push(action.payload);
        state.navbarFiles = state.navbarFiles
          ? [...state.navbarFiles, action.payload]
          : [action.payload];
      })
      .addCase(getFileEditorValue.fulfilled, (state, action) => {
        if (state.selectedFile) {
          state.selectedFile = {
            ...state.selectedFile,
            editorValue: action.payload.content,
          };
        }
      })
      .addCase(
        deleteFile.fulfilled,
        (state, action: PayloadAction<{ id: number }>) => {
          state.status = "succeeded";
          const fileId = action.payload.id;

          state.files = state.files.filter((file) => file.id !== fileId);
          state.navbarFiles = state.navbarFiles
            ? state.navbarFiles.filter((file) => file.id !== fileId)
            : [];

          if (state.selectedFile && state.selectedFile.id === fileId) {
            state.selectedFile = state.files.length > 0 ? state.files[0] : null;
          }
        }
      )
      .addCase(updateFileEditorValue.fulfilled, (state, action) => {
        if (state.selectedFile) {
          state.selectedFile.editorValue = action.payload.content;
        }
      })
      .addCase(updateFileName.fulfilled, (state, action) => {
        const updatedFile = action.payload;
        const fileId = updatedFile.id;

        const index = state.files.findIndex((file) => file.id === fileId);
        if (index !== -1) {
          state.files[index] = updatedFile;
        }

        if (state.selectedFile && state.selectedFile.id === fileId) {
          state.selectedFile = updatedFile;
        }

        if (state.navbarFiles) {
          const navbarFileIndex = state.navbarFiles.findIndex(
            (file) => file.id === fileId
          );
          if (navbarFileIndex !== -1) {
            state.navbarFiles[navbarFileIndex] = updatedFile;
          }
        }
      });
  },
});

export const {
  renameFileInProject,
  setSelectedFile,
  setSelectedProject,

  addFileToNavbar,
  removeFileFromNavbar,
  setNavbarFiles,
  resetProjectState,
} = projectsSlice.actions;

export default projectsSlice.reducer;
