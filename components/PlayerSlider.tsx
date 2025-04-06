import React, { useEffect } from "react";
import { colors, fontSize } from "@/constants/token";
import { defaultStyles, utilsStyles } from "@/styles";
import { formatSecondsToMinutes } from "@/utils";

import { StyleSheet, Text, View, ViewProps } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";
import TrackPlayer, { useProgress } from "react-native-track-player";

export const PlayerSlider = ({ style }: ViewProps) => {
	const { duration, position } = useProgress(250);

	const isSliding = useSharedValue(false);
	const progress = useSharedValue(0);
	const min = useSharedValue(0);
	const max = useSharedValue(duration);

	const trackElapsedTime = formatSecondsToMinutes(position);
	const trackRemainingTime = formatSecondsToMinutes(duration - position);

	// Update max value when duration changes
	useEffect(() => {
		max.value = duration;
	}, [duration]);

	// Update progress value when not sliding
	if (!isSliding.value) {
		progress.value = duration > 0 ? position : 0;
	}

	return (
		<>
			<View className="flex-row justify-between mb-2">
				<Text className="text-white">{trackElapsedTime}</Text>
				<Text className="text-white">{trackRemainingTime}</Text>
			</View>
			<View style={style}>
				<Slider
					progress={progress}
					minimumValue={min}
					maximumValue={max}
					containerStyle={utilsStyles.slider}
					thumbWidth={0}
					renderBubble={() => null}
					theme={{
						minimumTrackTintColor: colors.minimumTrackTintColor,
						maximumTrackTintColor: colors.maximumTrackTintColor,
					}}
					onSlidingStart={() => {
						isSliding.value = true;
					}}
					onValueChange={async (value) => {
						await TrackPlayer.seekTo(value);
					}}
					onSlidingComplete={async (value) => {
						isSliding.value = false;
						await TrackPlayer.seekTo(value);
					}}
				/>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	timeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
		marginTop: 20,
	},
	timeText: {
		...defaultStyles.text,
		color: colors.text,
		opacity: 0.75,
		fontSize: fontSize.xs,
		letterSpacing: 0.7,
		fontWeight: "500",
	},
});
