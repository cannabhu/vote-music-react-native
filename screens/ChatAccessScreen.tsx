import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { getUser, supabase } from "@/utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";

export default function ChatroomAccess() {
	const { icon, text } = Colors.dark;
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();

	const handleJoinChatroom = async () => {
		setLoading(true);

		console.log("work1");

		try {
			console.log("work2");
			const user = await getUser();
			if (!user) {
				throw new Error("User not found");
			}
			console.log("work3");
			if (!password.trim()) {
				throw new Error("Password is required");
			}

			// Use the verify_chatroom_password function which handles both verification
			// and member access updates, returning the chatroom UUID
			const { data: chatroomId, error } = await supabase.rpc("verify_chatroom_password", {
				password_attempt: password,
			});

			console.log("work4");

			if (error) {
				throw error;
			}

			if (!chatroomId) {
				throw new Error("Failed to verify password");
			}

			console.log("Chatroom ID:", chatroomId);

			// Navigate to chat with the verified UUID
			navigation.navigate("Chat", { chatroomId });
		} catch (error) {
			console.error("Access error:", error);
			alert(error instanceof Error ? error.message : "Access denied");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<View className="bg-black pt-16 px-6">
				<View className="flex-row justify-end items-center mb-5">
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<AntDesign name="close" size={24} color={icon} />
					</TouchableOpacity>
				</View>
			</View>
			<View className="flex-1 justify-center bg-black p-6">
				<Text className="text-2xl font-bold mb-6" style={{ color: text }}>
					Enter Chatroom Password
				</Text>
				<TextInput
					className="p-4 rounded-lg mb-4"
					style={{
						backgroundColor: "white",
						color: "black",
						borderColor: icon,
					}}
					placeholder="Password"
					placeholderTextColor={"black"}
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
				<TouchableOpacity
					className="p-4 rounded-lg items-center"
					style={{ backgroundColor: icon }}
					onPress={handleJoinChatroom}
					disabled={loading}
				>
					<Text className="font-bold text-white text-lg">
						{loading ? "Verifying..." : "Join Chatroom"}
					</Text>
				</TouchableOpacity>

				<View className="py-2">
					<Text
						onPress={() => navigation.navigate("CreateChat")}
						className="text-center text-lg underline font-semibold"
						style={{
							color: icon,
						}}
					>
						Create a Chatroom
					</Text>
				</View>
			</View>
		</>
	);
}
