import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Song {
	id: string;
	title: string;
	artist: string;
	votes: number;
	url?: string;
	artwork?: string;
	duration?: number;
}

interface VoteState {
	voteData: Song[];
	isLoading: boolean;
	error: string | null;
}

const initialState: VoteState = {
	voteData: [],
	isLoading: false,
	error: null,
};

const voteSlice = createSlice({
	name: "vote",
	initialState,
	reducers: {
		getVote: (state) => {
			state.isLoading = true;
			state.error = null;
		},
		getVoteSuccess: (state, action: PayloadAction<Song[]>) => {
			state.isLoading = false;
			state.voteData = action.payload;
		},
		getVoteFailure: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
		incrementVote: (state, action: PayloadAction<string>) => {
			const songId = action.payload;
			const song = state.voteData.find((s) => s.id === songId);
			if (song) {
				song.votes += 1;
			}
		},
		resetVotes: (state) => {
			state.voteData = [];
			state.isLoading = false;
			state.error = null;
		},
	},
});

export const { getVote, getVoteSuccess, getVoteFailure, incrementVote, resetVotes } =
	voteSlice.actions;

export const voteSelector = (state: { vote: VoteState }) => state.vote;

export default voteSlice.reducer;
