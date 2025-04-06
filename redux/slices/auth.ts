// redux/slices/auth.ts
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

interface AuthState {
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state) => {
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.isAuthenticated = false;
		},
	},
});

export const { login, logout } = authSlice.actions;
export const authSelector = (state: RootState) => state.auth;
export default authSlice.reducer;
