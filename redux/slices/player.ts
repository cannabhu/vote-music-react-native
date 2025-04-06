// redux/slices/player.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "react-native-track-player";
import { RootState } from "..";

interface PlayerState {
	currentTrack: Track | null;
}

const initialState: PlayerState = {
	currentTrack: null,
};

const playerSlice = createSlice({
	name: "player",
	initialState,
	reducers: {
		setCurrentTrack: (state, action: PayloadAction<Track | null>) => {
			state.currentTrack = action.payload;
		},
	},
});

export const { setCurrentTrack } = playerSlice.actions;
export const playerSelector = (state: RootState) => state.player;
export default playerSlice.reducer;
