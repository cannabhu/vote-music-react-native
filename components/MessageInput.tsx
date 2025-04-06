import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";

const MessageInput = React.memo(
	({ onSend, sending }: { onSend: (message: string) => void; sending: boolean }) => {
		const { tint, text } = Colors.dark;
		const [inputMessage, setInputMessage] = useState("");

		const handleSubmit = () => {
			if (inputMessage.trim()) {
				onSend(inputMessage.trim());
				setInputMessage("");
			}
		};

		return (
			<View className="mt-2 border-t border-[#1A1A1A] pt-4 pb-10">
				<View className="flex-row items-center gap-2">
					<View className="flex-1 flex-row items-center bg-[#0A0A0A] rounded-full border border-[#1A1A1A] px-3">
						<TextInput
							className="flex-1 py-3 px-2"
							style={{ color: text }}
							placeholder="Type your message..."
							placeholderTextColor={text}
							value={inputMessage}
							onChangeText={setInputMessage}
							multiline
							maxLength={500}
						/>
					</View>

					<TouchableOpacity
						onPress={handleSubmit}
						disabled={sending || !inputMessage.trim()}
						className="p-3 rounded-full"
						style={{
							backgroundColor: !inputMessage.trim() ? "#333" : "#D4AF37",
							opacity: sending ? 0.7 : 1,
						}}
					>
						{sending ? (
							<ActivityIndicator size="small" color="#000" />
						) : (
							<FontAwesome5 name="paper-plane" size={16} color={tint} />
						)}
					</TouchableOpacity>
				</View>
			</View>
		);
	}
);

export default MessageInput;
