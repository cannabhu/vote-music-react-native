import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackPlayer, { Track, Event, useTrackPlayerEvents } from "react-native-track-player";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
	View,
	TextInput,
	TouchableOpacity,
	Text,
	ActivityIndicator,
	FlatList,
	ImageBackground,
} from "react-native";

import { searchSong } from "@/service/fetchSongs";
import { getData, storeData } from "@/utils/storage";
import { getSongs, getUser, supabase } from "@/utils/supabase";
import { Database } from "@/types/database.types";
import SongItem from "@/screens/SongItem";

import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { playerSelector } from "@/redux/slices/player";

export default function HomeScreen() {
	const { tint, text } = Colors.dark;
	const navigation = useNavigation();
	const { currentTrack } = useSelector(playerSelector);

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [addingSongId, setAddingSongId] = useState<string | null>(null);
	const [canVote, setCanVote] = useState(false);
	const [songs, setSongs] = useState<Database["public"]["Tables"]["songs"]["Row"][]>([]);
	const [showSongsList, setShowSongsList] = useState(false);
	const [hasAttemptedFinalize, setHasAttemptedFinalize] = useState(false);
	const [currentSession, setCurrentSession] = useState<
		Database["public"]["Tables"]["voting_sessions"]["Row"] | null
	>(null);
	const [winningSongSession, setWinningSongSession] = useState<
		Database["public"]["Tables"]["voting_sessions"]["Row"] | null
	>(null);
	const [previousWinningSong, setPreviousWinningSong] = useState<
		Database["public"]["Tables"]["songs"]["Row"] | null
	>(null);

	const prevSessionRef = useRef(currentSession);

	// Calculate time remaining
	const calculateTimeLeft = () => {
		if (!currentSession?.end_time) return 0;
		const end = new Date(currentSession.end_time).getTime();
		const now = Date.now();
		return Math.max(Math.ceil((end - now) / 1000), 0);
	};
	// Add state for time left
	const [timeRemaining, setTimeRemaining] = useState(calculateTimeLeft());

	const loadSongs = async () => {
		const songs = await getSongs();
		setSongs(songs);
	};

	const checkCanVote = async () => {
		const user = await getUser();
		if (!user) return false;

		const currentTime = new Date();
		const lastVotedTime = user.last_voted_time ? new Date(user.last_voted_time) : new Date(0);
		const timeDifferenceInSeconds = Math.floor(
			(currentTime.getTime() - lastVotedTime.getTime()) / 1000
		);

		return timeDifferenceInSeconds >= 20;
	};

	// Setup TrackPlayer
	useEffect(() => {
		const setupPlayer = async () => {
			try {
				// Check if player is already initialized
				const setupResult = await TrackPlayer.getState();
				if (setupResult === null) {
					await TrackPlayer.setupPlayer();
				}
			} catch (error) {
				// If getState throws an error, it means player is not initialized
				try {
					await TrackPlayer.setupPlayer();
				} catch (setupError) {
					console.log("Error setting up player:", setupError);
				}
			}
		};
		setupPlayer();
	}, []);

	// Subscribe to real-time session updates
	useEffect(() => {
		// Initial fetch
		const fetchInitialSession = async () => {
			console.log("Fetching initial session...");
			const { data } = await supabase
				.from("voting_sessions")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (!data) console.log("No data from Initial fetch");
			console.log("Initial session data:", data);
			if (data) {
				setCurrentSession(data);
				if (data.is_active) {
					console.log("Initial session is active, checking user vote");
					checkUserVote(data.id);
				} else if (data.top_song_id) {
					console.log("Initial session has top song, playing:", data.top_song_id);
					playTopSong(data.top_song_id);
				}
			} else {
				console.log("No session found, creating new session...");
				const { error } = await supabase.rpc("create_new_session");
				if (error) {
					console.error("Error creating new session:", error);
				} else {
					console.log("New session created successfully");
					// Fetch the newly created session
					const { data: newSession } = await supabase
						.from("voting_sessions")
						.select("*")
						.order("created_at", { ascending: false })
						.limit(1)
						.single();

					if (newSession) {
						console.log("newly created session: ", newSession);
						setCurrentSession(newSession);
					}
				}
			}
		};

		fetchInitialSession();

		// Set up realtime subscription
		console.log("Setting up realtime subscription...");
		const channel = supabase.channel("voting-sessions-channel").on(
			"postgres_changes",
			{
				event: "*",
				schema: "public",
				table: "voting_sessions",
			},
			async (payload) => {
				console.log("Received realtime update:", payload);

				// Fetch latest session
				const { data: latestSession } = await supabase
					.from("voting_sessions")
					.select("*")
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				if (latestSession) {
					const previousSession = prevSessionRef.current;

					console.log("previous session after new session:", previousSession);
					if (previousSession?.id !== latestSession.id) {
						// Fetch updated previous session
						const { data: updatedPreviousSession } = await supabase
							.from("voting_sessions")
							.select("*")
							.eq("id", previousSession.id)
							.single();

						setWinningSongSession(updatedPreviousSession);
					}
				}

				// Handle session updates

				setCurrentSession(latestSession);
			}
		); // Start the subscription
		channel.subscribe((status) => {
			console.log("Subscription status:", status);
		});

		return () => {
			console.log("Cleaning up subscription...");
			channel.unsubscribe();
		};
	}, []);

	// Update ref whenever currentSession changes
	useEffect(() => {
		prevSessionRef.current = currentSession;
	}, [currentSession]);

	// Handle session updates
	useEffect(() => {
		if (currentSession) {
			if (currentSession.is_active) {
				checkUserVote(currentSession.id);
			} else if (currentSession.top_song_id) {
				playTopSong(currentSession.top_song_id);
			}
		}
	}, [currentSession]);

	const playTopSong = async (songId: string) => {
		console.log("Attempting to play song from the latest session:", songId);
		const { data: song } = await supabase.from("songs").select("*").eq("id", songId).single();
		console.log("Retrieved song data:", song);

		if (song) {
			try {
				console.log("Resetting track player...");
				await TrackPlayer.reset();
				console.log("Adding song to track player:", song);
				await TrackPlayer.add({
					id: song.id,
					url: song.url,
					title: song.title,
					artist: song.artist,
					artwork: song.artwork,
					duration: parseInt(song.duration || "0"),
				});
				console.log("Starting playback...");
				await TrackPlayer.play();
			} catch (error) {
				console.error("Error during playback:", error);
			}
		}
	};

	// check playback state
	useEffect(() => {
		const checkInitialState = async () => {
			const playbackState = await TrackPlayer.getPlaybackState();
			setShowSongsList(playbackState.state !== "playing");
		};
		loadSongs();
		checkInitialState();
	}, []);

	// Handle track playback completion
	useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
		console.log("PlaybackActiveTrackChanged event:", event);
		if (!event.track) {
			console.log("No active track, creating new session...");
			// When track finishes, create new session
			const { error } = await supabase.rpc("create_new_session");
			if (error) {
				console.error("Error creating new session:", error);
			} else {
				console.log("New session created successfully");
			}
		}
	});

	useTrackPlayerEvents([Event.PlaybackState], async (event) => {
		if (event.type === Event.PlaybackState) {
			const playbackState = await TrackPlayer.getPlaybackState();
			setShowSongsList(playbackState.state !== "playing");
		}
	});

	// Check user's vote status
	const checkUserVote = async (sessionId: string) => {
		const user = await getUser();
		if (!user) return;

		const { data } = await supabase
			.from("user_votes")
			.select("song_id")
			.eq("user_id", user.id)
			.eq("session_id", sessionId)
			.single();
	};

	const handleSearch = async (song: string) => {
		if (song.trim() === "") {
			setSearchResults([]);
			return;
		}
		setIsSearching(true);
		try {
			const songInfo = await searchSong(song);
			setSearchResults(songInfo ? [songInfo] : []);
		} catch (error) {
			console.error("Search failed:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSuggestSong = async (spotifyTrack: Track) => {
		setAddingSongId(spotifyTrack.id);
		try {
			const user = await getUser();
			if (!user) throw new Error("User not authenticated");

			const newSong: Database["public"]["Tables"]["songs"]["Row"] = {
				id: spotifyTrack.id,
				url: spotifyTrack.url || "",
				title: spotifyTrack.title || "",
				artist: spotifyTrack.artist || "",
				vote_count: 1,
				artwork: spotifyTrack.artwork || require("@/assets/loginaudio.png"),
				duration: spotifyTrack.duration?.toString() || "0",
				created_at: new Date().toISOString(),
				added_by: user.id,
			};

			await voteForSong(newSong);
		} catch (error) {
			console.error("Error adding song:", error);
			alert("Failed to add song. Please try again.");
		} finally {
			setAddingSongId(null);
		}
	};

	//Get User status

	useEffect(() => {
		const userStatus = async () => {
			const user = await getUser();
			await storeData("@userInfo", user?.id);
			if (!user) return;
		};
		userStatus();
	}, []);

	const voteForSong = async (song: Database["public"]["Tables"]["songs"]["Row"]) => {
		console.log("Voting for song: ", song);
		const user = await getUser();
		if (!user) return;

		if (!currentSession?.is_active) {
			alert("No active voting session");
			return;
		}

		// Check existing vote
		const { data: existingVote } = await supabase
			.from("user_votes")
			.select()
			.eq("user_id", user.id)
			.eq("session_id", currentSession.id);

		if (existingVote && existingVote.length > 0) {
			alert("You already voted in this session!");
			return;
		}

		const { error: voteError } = await supabase.from("user_votes").insert({
			user_id: user.id,
			session_id: currentSession.id,
			song_id: song.id,
		});

		if (voteError) {
			return;
		}

		// Update song votes
		const { error: songError } = await supabase.rpc("increment_vote", {
			song_id: song.id,
		});

		if (songError) console.error("Vote update failed:", songError);
	};

	useEffect(() => {
		const timer = setInterval(async () => {
			const newTimeLeft = calculateTimeLeft();
			setTimeRemaining(newTimeLeft);

			// If time has run out, update the session to trigger the finalize_voting_session function
			if (newTimeLeft === 0 && currentSession?.is_active && !hasAttemptedFinalize) {
				console.log("Session expired, updating to trigger finalization...");
				setHasAttemptedFinalize(true); // Prevent further attempts

				const { error } = await supabase
					.from("voting_sessions")
					.update({ is_active: true }) // Force an update to trigger the finalize_voting_session
					.eq("id", currentSession.id);

				if (error) {
					console.error("Error updating expired session:", error);
				}
			}
		}, 1000);

		// Cleanup interval on unmount
		return () => clearInterval(timer);
	}, [currentSession, hasAttemptedFinalize]);

	// Reset the finalization flag when the session changes
	useEffect(() => {
		setHasAttemptedFinalize(false);
	}, [currentSession?.id]);

	return (
		<SafeAreaView className="flex-1 bg-black">
			{/* Header Controls */}
			<View className="flex-row items-end p-4">
				{/* <TouchableOpacity className="p-2" onPress={() => navigation.navigate("Vote")}>
					<MaterialCommunityIcons name="trumpet" size={24} color="#D4AF37" />
				</TouchableOpacity> */}

				<View className="flex-row gap-4">
					<TouchableOpacity
						className="p-2"
						onPress={() => navigation.navigate("ChatAccess", { chatroomId: "general" })}
					>
						<Ionicons name="chatbubbles-outline" size={24} color="#D4AF37" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Search Bar */}
			<View className="flex-row items-center bg-[#1A1A1A] rounded-lg p-2 mx-4 mb-4">
				<TextInput
					className="flex-1 text-white p-2"
					placeholder="Search songs on Spotify..."
					placeholderTextColor="#A0A0A0"
					value={searchQuery}
					onChangeText={setSearchQuery}
					onSubmitEditing={() => handleSearch(searchQuery)}
				/>
				<TouchableOpacity onPress={() => handleSearch(searchQuery)} disabled={isSearching}>
					{isSearching ? (
						<ActivityIndicator color="#FFD700" />
					) : (
						<MaterialCommunityIcons name="magnify" size={24} color="#FFD700" />
					)}
				</TouchableOpacity>
			</View>

			{/* Header with Timer */}
			<ImageBackground
				source={{ uri: currentTrack?.artwork?.toString() }}
				resizeMode="cover"
				className="flex-1"
				imageStyle={{
					opacity: 0.8,
					backgroundColor: "#000000", // Fallback if image fails
				}}
			>
				<View className="flex-row justify-between items-center mx-4 mb-5">
					{!isSearching &&
						searchResults.length === 0 &&
						songs.length > 0 &&
						showSongsList && (
							<View>
								<Text className="text-2xl font-bold" style={{ color: text }}>
									Vote Next Song
								</Text>
								{currentSession && (
									<Text className="text-sm mt-1" style={{ color: tint }}>
										Time remaining: {timeRemaining}s
									</Text>
								)}
							</View>
						)}
				</View>

				{/* Search Results */}
				{searchResults.length > 0 && (
					<FlatList
						data={searchResults}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<SongItem
								item={item}
								isSearchResult={true}
								onSuggest={handleSuggestSong}
								isAddingSong={addingSongId === item.id}
								canVote={canVote}
								onVote={voteForSong}
							/>
						)}
						ListEmptyComponent={
							<Text className="text-gray-400 text-center mt-4">
								{isSearching ? "Searching..." : "No results found"}
							</Text>
						}
					/>
				)}

				{/* Show songs list only when playback is stopped and no search results */}
				{!isSearching &&
					searchResults.length === 0 &&
					songs.length > 0 &&
					showSongsList && (
						<FlatList
							data={songs}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<SongItem
									item={item}
									isSearchResult={false}
									onSuggest={handleSuggestSong}
									isAddingSong={addingSongId === item.id}
									canVote={checkCanVote()}
									onVote={voteForSong}
								/>
							)}
							ListEmptyComponent={
								<Text className="text-gray-400 text-center mt-4">
									{isSearching ? "Searching..." : "No results found"}
								</Text>
							}
						/>
					)}
			</ImageBackground>
		</SafeAreaView>
	);
}
