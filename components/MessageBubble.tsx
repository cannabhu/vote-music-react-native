import React from "react";
import { View, Text } from "react-native";
import { Message } from "@/screens/ChatScreen";
import { Colors } from "@/constants/Colors";

const getAvatarColor = (userId: string) => {
	const colors = [
		["#FFD700", "#A68A3D"], // Gold variations
		["#D4AF37", "#A68A3D"],
		["#B8860B", "#A68A3D"],
		["#DAA520", "#A68A3D"],
	];

	// Simple hash function to get a consistent color for each user
	const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[hash % colors.length];
};

const MessageBubble = React.memo<{ msg: Message }>(({ msg }) => {
	const avatarColors = !msg.isCurrentUser ? getAvatarColor(msg.sender) : ["#D4AF37", "#A68A3D"];

	console.log("current user:", msg.senderName, msg.isCurrentUser);
	return (
		<View
			key={msg.id}
			className={`flex ${msg.isCurrentUser ? "items-end" : "items-start"} mb-4`}
		>
			<View className="flex-row items-end ">
				{!msg.isCurrentUser && (
					<View className="mr-2 mb-1">
						<Text className="text-black font-bold">{msg.senderName}</Text>
					</View>
				)}

				<View
					className={`p-3 rounded-2xl w-3/4 ${
						msg.isCurrentUser ? "rounded-tr-none" : "rounded-tl-none"
					}`}
					style={{
						backgroundColor: msg.isCurrentUser
							? Colors.dark.tabIconSelected
							: Colors.dark.icon,
						borderWidth: msg.isCurrentUser ? 0 : 1,
						borderColor: "rgba(166, 138, 61, 0.5)",
					}}
				>
					<Text
						className="text-sm font-semibold mb-1"
						style={{
							color: msg.isCurrentUser
								? Colors.dark.tabIconDefault
								: Colors.dark.tabIconSelected,
						}}
					>
						{msg.senderName}
					</Text>

					<Text
						className="text-base"
						style={{
							color: msg.isCurrentUser ? "#00040B" : "#FFFFFF",
						}}
					>
						{msg.text}
					</Text>
					<Text
						className="text-xs mt-1 text-right"
						style={{
							color: msg.isCurrentUser ? "rgba(0, 4, 11, 0.7)" : "gold",
						}}
					>
						{msg.timestamp}
					</Text>
				</View>
			</View>
		</View>
	);
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
