import { View, Text } from "react-native";
import React, { PropsWithChildren } from "react";
import { Track } from "react-native-track-player";

type SongInfoProps = PropsWithChildren<{ track: Track | null | undefined }>;

const SongInfo = ({ track }: SongInfoProps) => {
	return (
		<View className="items-center mb-7">
			<Text className="text-2xl font-bold text-white">{track?.title || "Unknown Title"}</Text>
			<Text className="text-base text-gray-300 ">{track?.artist || "Unknown Artist"}</Text>
		</View>
	);
};

export default SongInfo;
