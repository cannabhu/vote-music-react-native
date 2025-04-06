import { Track } from "react-native-track-player";
import { FontAwesome5 } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, ActivityIndicator, Image } from "react-native";

import { Database } from "@/types/database.types";

type SongItemProps = {
	item: any;
	isSearchResult?: boolean;
	onSuggest?: (item: Track) => void;
	onVote?: (item: Database["public"]["Tables"]["songs"]["Row"]) => void;
	isAddingSong?: boolean;
	canVote?: Promise<boolean>;
};

export default function SongItem({
	item,
	isSearchResult,
	onSuggest,
	onVote,
	isAddingSong,
	canVote,
}: SongItemProps) {
	return (
		<View className="flex-row items-center justify-between p-3 bg-[#1A1A1A] rounded-lg mx-4 mb-2">
			<View className="flex-row items-center flex-1">
				<Image
					source={{ uri: item.artwork || undefined }}
					className="w-12 h-12 rounded-lg mr-3"
				/>
				<View className="flex-1">
					<Text className="text-white font-bold" numberOfLines={1}>
						{item.title}
					</Text>
					<Text className="text-gray-400 text-sm" numberOfLines={1}>
						{item.artist}
					</Text>
				</View>
			</View>
			{isSearchResult ? (
				<TouchableOpacity
					className={`flex-row items-center px-4 py-2 rounded-full ${
						canVote ? "bg-[#D4AF37]/20" : "bg-gray-500/20"
					}`}
					onPress={() => onSuggest?.(item)}
					disabled={!canVote || isAddingSong}
				>
					{isAddingSong ? (
						<ActivityIndicator size="small" color="#000" />
					) : (
						<Text
							className={` ${canVote ? "text-[#FFD700] font-bold" : "text-black font-bold"}`}
						>
							Suggest
						</Text>
					)}
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					className={`flex-row items-center px-4 py-2 rounded-full ${
						canVote ? "bg-[#D4AF37]/20" : "bg-gray-500/20"
					}`}
					onPress={() => onVote?.(item)}
					disabled={!canVote || isAddingSong}
				>
					{isAddingSong ? (
						<ActivityIndicator size="small" color="#000" />
					) : (
						<View className="flex-row items-center">
							<FontAwesome5
								name="vote-yea"
								size={16}
								color={canVote ? "#FFD700" : "#6B7280"}
							/>
							<Text
								className={`ml-2 ${canVote ? "text-[#FFD700]" : "text-gray-500"}`}
							>
								{item.vote_count}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			)}
		</View>
	);
}
