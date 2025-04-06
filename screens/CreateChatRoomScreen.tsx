import React from "react";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { supabase } from "@/utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";

const CreateChatRoomScreen = () => {
	const { background, tint, icon, text } = Colors.dark;
	const [chatroomName, setChatroomName] = useState("");
	const [password, setPassword] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();

	const handleCreateChatroom = async () => {
		setLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("User not authenticated");

			// Generate password hash
			const { data: hashData } = await supabase.rpc("generate_password_hash", {
				plain_password: password,
			});

			// Create new chatroom
			const { data: chatroom, error } = await supabase
				.from("chatrooms")
				.insert({
					name: chatroomName,
					description,
					password_hash: hashData,
					created_by: user.id,
				})
				.select()
				.single();

			if (error) throw error;

			if (error || !chatroom) {
				throw error || new Error("Failed to create chatroom");
			}

			// Add creator as member
			await supabase.from("chatroom_members").insert({
				user_id: (await supabase.auth.getUser()).data.user?.id,
				chatroom_id: chatroom.id,
				has_access_password: true,
			});

			navigation.navigate("Chat", { chatroomId: chatroom.id });
		} catch (error) {
			console.error("Creation error:", error);
			alert("Failed to create chatroom");
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
				<Text className="text-2xl font-semibold mb-6" style={{ color: tint }}>
					Create New Chatroom
				</Text>

				{/* Chatroom Name Input */}
				<View className="mb-4">
					<Text className=" mb-1 font-semibold text-lg" style={{ color: tint }}>
						Chatroom Name
					</Text>
					<TextInput
						className="p-4 rounded-lg"
						style={{
							backgroundColor: "white",
							borderColor: icon,
							color: "black",
						}}
						placeholder="Enter chatroom name"
						placeholderTextColor={background}
						value={chatroomName}
						onChangeText={setChatroomName}
					/>
				</View>

				{/* Description Input */}
				<View className="mb-4">
					<Text className=" mb-1 font-semibold text-lg" style={{ color: tint }}>
						Description (optional)
					</Text>
					<TextInput
						className="p-4 rounded-lg"
						style={{
							backgroundColor: "white",
							color: "black",
							borderColor: icon,
							height: 120,
						}}
						placeholder="Add a description"
						placeholderTextColor={background}
						value={description}
						onChangeText={setDescription}
						multiline
						scrollEnabled={true} // Always enable scrolling
					/>
				</View>

				{/* Password Input */}
				<View className="mb-8">
					<Text className=" mb-1 font-bold text-lg" style={{ color: tint }}>
						Set Password
					</Text>
					<TextInput
						className="p-4 rounded-lg"
						style={{
							backgroundColor: "white",
							color: "black",
							borderColor: "white",
						}}
						placeholder="Create a password"
						placeholderTextColor={background}
						secureTextEntry
						value={password}
						onChangeText={setPassword}
					/>
				</View>

				<TouchableOpacity
					className="p-4 rounded-lg items-center"
					style={{ backgroundColor: icon }}
					onPress={handleCreateChatroom}
					disabled={loading || !chatroomName || !password}
				>
					<Text className="font-bold" style={{ color: "white" }}>
						{loading ? "Creating..." : "Create Chatroom"}
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

export default CreateChatRoomScreen;
