import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackPlayer, {
	Track,
	Event,
	useTrackPlayerEvents,
	AddTrack,
} from "react-native-track-player";
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
import { loadAndSubscribeToSongs, getSongs, getUser, supabase } from "@/utils/supabase";
import { Database, Tables } from "@/types/database.types";
import SongItem from "@/components/SongItem";

import { Colors } from "@/constants/Colors";
import { useDispatch, useSelector } from "react-redux";
import { playerSelector, setCurrentTrack } from "@/redux/slices/player";
import { calculateTimeLeft, TimerCountdown } from "@/components/TimerCountdown";

export default function HomeScreen() {
	const { tint, text } = Colors.dark;
	const navigation = useNavigation();
	const { currentTrack } = useSelector(playerSelector);

	const [currentUser, setCurrentUser] = useState<
		Database["public"]["Tables"]["users"]["Row"] | null
	>(null);

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [addingSongId, setAddingSongId] = useState<string | null>(null);
	const [songs, setSongs] = useState<Tables<"songs">[]>([]);
	const [showSongsList, setShowSongsList] = useState(true);
	const [currentSession, setCurrentSession] = useState<Tables<"voting_sessions"> | null>(null);
	const [canVote, setCanVote] = useState(false);

	const dispatch = useDispatch();

	// Check if user can vote
	const checkCanVote = () => {
		if (!currentUser) return false;

		const timeLeft = currentSession ? calculateTimeLeft(currentSession) : 0;

		const canVote = timeLeft > 0;
		setCanVote(canVote);
	};

	// Setup track player
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
				console.error("Error setting up player:", setupError);
			}
		}
	};

	// Fetch initial session
	const fetchInitialSession = async () => {
		const { data } = await supabase
			.from("voting_sessions")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (data) {
			setCurrentSession(data);
		} else {
			const { error } = await supabase
				.from("voting_sessions")
				.insert({
					created_at: new Date().toISOString(),
					end_time: new Date().toISOString(),
					is_active: true,
				})
				.select()
				.single();
			if (!error) {
				const { data: newSession } = await supabase
					.from("voting_sessions")
					.select("*")
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				if (newSession) {
					useRunOnce(() => {
						setCurrentSession(newSession);
					});
				}
			}
		}
	};

	const votingSessionsChannel = supabase.channel("voting-sessions-channel").on(
		"postgres_changes",
		{
			event: "INSERT",
			schema: "public",
			table: "voting_sessions",
		},
		async (payload) => {
			const { data: latestSession } = await supabase
				.from("voting_sessions")
				.select("*")
				.order("created_at", { ascending: false })
				.eq("is_active", true)
				.limit(1)
				.single();

			if (latestSession && latestSession.id !== currentSession?.id) {
				setCurrentSession(latestSession);
			}
		}
	);

	// Play song with ID
	const playSongWithId = async (songId: string) => {
		const { data: song } = await supabase.from("songs").select("*").eq("id", songId).single();

		if (song) {
			try {
				await setupPlayer();
				const track: AddTrack = {
					url: song.url || "",
					title: song.title || "",
					artist: song.artist || "",
					artwork: song.artwork || "",
					duration: parseInt(song.duration || "0"),
				};
				await TrackPlayer.reset();
				await TrackPlayer.add(track);

				const playbackState = await TrackPlayer.getPlaybackState();
				if (playbackState.state !== "playing") {
					TrackPlayer.play();
				}
			} catch (error) {
				// Handle error silently
			}
		}
	};

	// Show songs list if not playing
	const showSongsListIfNotPlaying = async () => {
		const playbackState = await TrackPlayer.getPlaybackState();
		setShowSongsList(playbackState.state !== "playing");
	};

	// Set up track player event handlers
	const setUpTrackPlayerEventHandlers = () => {
		// Handle track playback completion
		useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
			if (event.type === Event.PlaybackActiveTrackChanged) {
				const trackIndex = await TrackPlayer.getActiveTrackIndex();
				// Handle null/undefined case first
				if (trackIndex == null) {
					dispatch(setCurrentTrack(null));
					return;
				}
				const playingTrack = await TrackPlayer.getTrack(trackIndex);
				dispatch(setCurrentTrack(playingTrack ?? null));
			}
		});
	};

	// Handle search
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

	// Handle suggest song
	const handleSuggestSong = async (spotifyTrack: Track) => {
		setAddingSongId(spotifyTrack.id);
		try {
			if (!currentUser) throw new Error("User not authenticated");

			const newSong: Database["public"]["Tables"]["songs"]["Row"] = {
				id: spotifyTrack.id,
				url: spotifyTrack.url || "",
				title: spotifyTrack.title || "",
				artist: spotifyTrack.artist || "",
				vote_count: 0,
				artwork: spotifyTrack.artwork || require("@/assets/loginaudio.png"),
				duration: spotifyTrack.duration?.toString() || "0",
				created_at: new Date().toISOString(),
				added_by: currentUser.id,
			};

			const { error: songError } = await supabase.from("songs").insert(newSong);

			if (songError) {
				alert("Failed to add song. Please try again.");
				return;
			}

			await voteForSong(newSong);
		} catch (error) {
			console.error("Error adding song:", error);
			alert("Failed to add song. Please try again.");
		} finally {
			setAddingSongId(null);
		}
	};

	// Get and set current user
	const getAndSetCurrentUser = async () => {
		const user = await getUser();
		setCurrentUser(user);
		if (!user) return;
	};

	// Vote for song
	const voteForSong = async (song: Database["public"]["Tables"]["songs"]["Row"]) => {
		setAddingSongId(song.id);

		try {
			if (!currentUser) return;

			if (!currentSession?.is_active) {
				alert("No active voting session");
				return;
			}

			const { data: existingVote } = await supabase
				.from("user_votes")
				.select()
				.eq("user_id", currentUser.id)
				.eq("session_id", currentSession.id);

			if (existingVote && existingVote.length > 0) {
				alert("You already voted in this session!");
				return;
			}

			const { error: voteError } = await supabase.from("user_votes").insert({
				user_id: currentUser.id,
				session_id: currentSession.id,
				song_id: song.id,
			});

			if (voteError) {
				alert("Failed to vote. Please try again.");
				return;
			}

			const { error: songError } = await supabase.rpc("increment_vote", {
				song_id: song.id,
			});

			if (songError) {
				alert("Failed to increment vote count. Please try again.");
				return;
			}

			const { error: userError, data: updatedUser } = await supabase
				.from("users")
				.update({
					last_voted_time: new Date().toISOString(),
				})
				.eq("id", currentUser.id)
				.single();

			if (updatedUser) {
				setCurrentUser(updatedUser);
			}

			setCanVote(false);
			await loadSongs();
		} finally {
			setAddingSongId(null);
		}
	};

	const playLastVotedTopSongFromDB = async () => {
		const { data: session } = await supabase
			.from("voting_sessions")
			.select("*")
			.order("created_at", { ascending: false })
			.not("top_song_id", "is", null)
			.eq("is_active", false)
			.limit(1)
			.single();
		if (session && session.top_song_id) {
			const { data: song } = await supabase
				.from("songs")
				.select("*")
				.eq("id", session.top_song_id)
				.single();
			if (song) {
				playSongWithId(song.id);
				return;
			}
		}
	};

	const loadSongs = async () => {
		await loadAndSubscribeToSongs((songs) => {
			setSongs(songs);
		});
	};

	// Default useEffect
	useEffect(() => {
		setupPlayer();
		getAndSetCurrentUser();
		loadSongs();
		// showSongsListIfNotPlaying();
		fetchInitialSession();

		votingSessionsChannel.subscribe();
		return () => {
			votingSessionsChannel.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (currentSession && currentSession.is_active) {
			loadSongs().then(() => {
				checkCanVote();
				playLastVotedTopSongFromDB();
			});
		}
	}, [currentSession]);

	// Set up track player event handlers
	setUpTrackPlayerEventHandlers();

	function useRunOnce<T>(callback: () => T | Promise<T>): void {
		const hasRun = useRef<boolean>(false);

		useEffect(() => {
			if (hasRun.current) {
				return;
			}

			hasRun.current = true;
			callback();
		}, []);
	}

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
									<TimerCountdown
										currentSession={currentSession}
										tint={tint}
										updateCanVote={setCanVote}
									/>
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
			</ImageBackground>
		</SafeAreaView>
	);
}
