import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { PlayerSlider } from "@/components/PlayerSlider";
import SongInfo from "@/components/SongInfo";
import { useSelector } from "react-redux";
import { playerSelector } from "@/redux/slices/player";

function MusicScreen() {
	const { currentTrack } = useSelector(playerSelector);

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
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}

export default MusicScreen;
