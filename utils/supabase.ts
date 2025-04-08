import { Database, Tables } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, User } from "@supabase/supabase-js";
import { AppState } from "react-native";

if (!process.env.REACT_NATIVE_SUPABASE_URL || !process.env.REACT_NATIVE_SUPABASE_ANON_KEY) {
	throw new Error("Missing Supabase environment variables");
}

const supabaseUrl = process.env.REACT_NATIVE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_NATIVE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});

export const getUser = async (): Promise<Database["public"]["Tables"]["users"]["Row"] | null> => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return null;
	}

	const { data: supabaseUserData, error } = await supabase
		.from("users")
		.select()
		.eq("id", user.id)
		.single();
	if (!supabaseUserData) {
		return null;
	}

	return supabaseUserData;
};

export const getUserById = async (userId: string): Promise<Database["public"]["Tables"]["users"]["Row"] | null> => {

	const { data: supabaseUserData, error } = await supabase
		.from("users")
		.select()
		.eq("id", userId)
		.single();
	if (!supabaseUserData) {
		return null;
	}

	return supabaseUserData;
};

export const getSongs = async (): Promise<Database["public"]["Tables"]["songs"]["Row"][]> => {
	const { data: songsData, error: songsError } = await supabase
		.from("songs")
		.select()
		.order("vote_count", { ascending: false });

	if (songsError) {
		return [];
	}

	return songsData;
};

export const loadAndSubscribeToSongs = async (updateSongs: (songs: Tables<"songs">[]) => void) => {
	// Fetch initial songs data
	const songs = await getSongs();
	updateSongs(songs);
};

export const getNameById = async (userId: string): Promise<string | null> => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select("name")
			.eq("id", userId)
			.maybeSingle();

		if (error || !data) {
			console.error("Error fetching user name:", error);
			return null;
		}

		return data.name;
	} catch (error) {
		console.error("Unexpected error:", error);
		return null;
	}
};

export const getChatroomId = async (userId: string): Promise<string | null> => {
	const { data: chatroomMembers, error: chatroomMemberError } = await supabase
		.from("chatroom_members")
		.select(
			`
			chatroom_id,
			created_at
		`
		)
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(1);

	if (chatroomMemberError || !chatroomMembers || chatroomMembers.length === 0) {
		console.error("Failed to fetch chatroom ID:", chatroomMemberError);
		return null;
	}

	// Return the most recently joined chatroom
	return chatroomMembers[0].chatroom_id;
};

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
