import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackPlayer, { Track } from "react-native-track-player";
import { getData, storeData } from "@/utils/storage";
import { supabase } from "@/utils/supabase";

interface Song {
	id: string;
	title: string;
	artist: string;
	artwork: string;
	url: string;
	votes: number;
}

export default function VoteScreen() {
	const { background, tint, icon, text } = Colors.dark;
	const navigation = useNavigation();
	const [sessionStart] = useState(new Date().toISOString()); // Client-generated session start
	const [songs, setSongs] = useState<Song[]>([]);
	const [timeLeft, setTimeLeft] = useState(30);
	const timerRef = useRef<NodeJS.Timeout>();
	const votingActive = timeLeft > 0;

	console.log("songs: ", songs);

	// Timer management
	useEffect(() => {
		const calculateTimeLeft = () => {
			const endTime = new Date(sessionStart);
			endTime.setSeconds(endTime.getSeconds() + 30);
			const diff = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));
			setTimeLeft(diff);
			return diff > 0;
		};

		timerRef.current = setInterval(() => {
			if (!calculateTimeLeft()) {
				clearInterval(timerRef.current!);
				endVotingSession();
			}
		}, 1000);

		return () => clearInterval(timerRef.current!);
	}, [sessionStart]);

	// Real-time subscription for votes
	useEffect(() => {
		console.log("working 1");
		const channel = supabase
			.channel("votes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "votes",
					filter: `voted_at=gte.${sessionStart}`,
				},
				() => fetchSongsWithVotes()
			)
			.subscribe();
		console.log("working 2");
		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionStart]);

	const fetchSongsWithVotes = async () => {
		const { data, error } = await supabase.rpc("get_session_vote_songs", {
			session_start_time: sessionStart,
		});

		console.log("song error: ", error);

		if (!error) {
			console.log("fetch songs: ", data);
			setSongs(
				data.map((song: any) => ({
					id: song.song_id,
					title: song.title,
					artist: song.artist,
					artwork: song.artwork,
					url: song.url,
					votes: song.vote_count,
				}))
			);
		}
	};

	const handleVote = async (songId: string) => {
		if (timeLeft <= 0) return;

		try {
			const { error } = await supabase.rpc("cast_session_vote", {
				session_start_time: sessionStart,
				song_id_param: songId,
				vote_value_param: true,
			});

			if (error) throw error;
		} catch (error) {
			console.error("Error recording vote:", error);
			fetchSongsWithVotes();
		}
	};

	const endVotingSession = async () => {
		const { data: winner, error } = await supabase.rpc("end_voting_session", {
			session_start_time: sessionStart,
		});

		if (winner?.[0]?.song_id) {
			// Play winning song
		}
	};

	// Sort songs by votes
	const sortedSongs = [...songs].sort((a, b) => b.votes - a.votes);

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View>
				<View className="rounded-t-2xl p-5" style={{ backgroundColor: background }}>
					{/* Header with Timer */}
					<View className="flex-row justify-between items-center mb-5">
						<View>
							<Text className="text-2xl font-bold" style={{ color: text }}>
								Vote Next Song
							</Text>
							<Text className="text-sm" style={{ color: tint }}>
								Time remaining: {timeLeft}s
							</Text>
						</View>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<AntDesign name="close" size={24} color={icon} />
						</TouchableOpacity>
					</View>

					{/* Song List */}
					<ScrollView className="mb-4">
						{sortedSongs.map((song) => (
							<View
								key={song.id}
								className="flex-row justify-between items-center py-3 border-b border-icon"
							>
								<View className="flex-1 mr-4">
									<Text
										className="text-base font-semibold mb-1"
										style={{ color: text }}
									>
										{song.title}
									</Text>
									<Text className="text-sm" style={{ color: tint }}>
										{song.artist}
									</Text>
								</View>

								<View className="flex-row items-center gap-3">
									<Text className="text-lg font-bold" style={{ color: text }}>
										{song.votes}
									</Text>
									<TouchableOpacity
										className="border rounded-full py-1.5 px-4"
										style={{
											borderColor: votingActive ? icon : "gray",
											opacity: votingActive ? 1 : 0.5,
										}}
										onPress={() => handleVote(song.id)}
										disabled={!votingActive}
									>
										<Text
											className="font-bold text-sm"
											style={{ color: votingActive ? text : "gray" }}
										>
											VOTE
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</ScrollView>
				</View>
			</View>
		</SafeAreaView>
	);
}
