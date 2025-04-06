import React, { useEffect, useState } from "react";
import { TouchableOpacity, ImageBackground } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { PlayerSlider } from "@/components/PlayerSlider";
import TrackPlayer, {
	State,
	usePlaybackState,
	Event,
	useTrackPlayerEvents,
} from "react-native-track-player";
import SongInfo from "@/components/SongInfo";
import { useDispatch, useSelector } from "react-redux";
import { playerSelector, setCurrentTrack } from "@/redux/slices/player";

function MusicScreen() {
	const playBackState = usePlaybackState();
	const dispatch = useDispatch();
	const { currentTrack } = useSelector(playerSelector);

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

	const skipToNext = () => {
		TrackPlayer.skipToNext();
	};

	const skipToPrevious = () => {
		TrackPlayer.skipToPrevious();
	};

	const togglePlayBack = async () => {
		// Remove parameter
		const currentTrack = await TrackPlayer.getActiveTrack();
		if (currentTrack) {
			if (playBackState.state === State.Paused || playBackState.state === State.Ready) {
				await TrackPlayer.play();
			} else {
				await TrackPlayer.pause();
			}
		}
	};

	useEffect(() => {
		const loadInitialTrack = async () => {
			const track = await TrackPlayer.getActiveTrack();
			dispatch(setCurrentTrack(track ?? null));
		};
		loadInitialTrack();
	}, [dispatch]);

	return (
		<SafeAreaView className="flex-1" edges={["left", "right"]}>
			<ImageBackground
				source={{ uri: currentTrack?.artwork?.toString() }}
				resizeMode="cover"
				className="flex-1"
				imageStyle={{
					opacity: 0.8,
					backgroundColor: "#000000", // Fallback if image fails
				}}
			>
				<View className="flex-1 items-center justify-end pb-10 bg-transparent">
					{/* Content container */}
					<View className=" items-center bg-black/60 rounded-xl w-11/12 py-4">
						<SongInfo track={currentTrack} />
						<View className="w-10/12">
							{/* //slider section */}
							<PlayerSlider style={{ marginTop: 32, marginBottom: 20 }} />
						</View>

						<View className="flex-row items-center justify-center gap-10">
							<TouchableOpacity className="p-2.5" onPress={skipToPrevious}>
								<FontAwesome5 name="backward" size={30} color="#FFD700" />
							</TouchableOpacity>

							<TouchableOpacity
								className="bg-[#FFD700] rounded-full p-4 shadow-md"
								onPress={togglePlayBack}
							>
								<Ionicons
									name={playBackState.state === State.Playing ? "pause" : "play"}
									size={50}
									color="#000000"
								/>
							</TouchableOpacity>

							<TouchableOpacity className="p-2.5" onPress={skipToNext}>
								<FontAwesome5 name="forward" size={30} color="#FFD700" />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}

export default MusicScreen;
