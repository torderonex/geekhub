import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { IUser } from "src/model/IUser";
import AuthService from "src/services/AuthService";

interface UserState {
    user: IUser | null;
    isAuth: boolean;
    isChatOpen: boolean
}

const initialState: UserState = {
    user: null,
    isAuth: false,
    isChatOpen: false
}

interface CustomJwtPayload extends JwtPayload {
    user_id: number;
}

interface LoginAndRegister {
    nickname: string;
    password: string;
}

export const login = createAsyncThunk(
    'users/login',
    async (credentials: LoginAndRegister) => {
        const response = await AuthService.login(credentials.nickname, credentials.password);
        const accessToken = response.data.token;
        localStorage.setItem('token', accessToken);

        const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
        const userId = decodedToken.user_id;

        return { nickname: credentials.nickname, id: userId };
    }
);

export const registration = createAsyncThunk(
    'users/registration',
    async (credentials: LoginAndRegister) => {
        console.log('1')
        const response = await AuthService.registration(credentials.nickname, credentials.password);
        const accessToken = response.data.token;
        localStorage.setItem('token', accessToken);

        const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
        const userId = decodedToken.user_id;

        return { nickname: credentials.nickname, id: userId };
    }
);

export const logout = createAsyncThunk(
    'users/logout',
    async () => {
        const response = await AuthService.logout();
        console.log(response)
        localStorage.removeItem('token');
    }
)

export const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        setCurrentUser(state, action) {
            state.user = action.payload;
            state.isAuth = true
        },
        openChat(state, action) {
            state.isChatOpen = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isAuth = true;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
                console.log('login success')
            })
            .addCase(registration.fulfilled, (state, action) => {
                state.isAuth = true;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
                console.log('registration success')
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuth = false;
                state.user = null;
                localStorage.removeItem('user');
                console.log('logout success')
            })
    }
});

export const {setCurrentUser, openChat} = userSlice.actions;

export default userSlice.reducer;