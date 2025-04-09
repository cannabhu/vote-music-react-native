import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Animated,
	Dimensions,
	ActivityIndicator,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { getNameById, getUser, getUserById, supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { Database } from "@/types/database.types";

export type Message = {
	id: string;
	text: string;
	sender: string;
	senderName: string;
	timestamp: string;
	isCurrentUser: boolean;
};

interface Props {
	route: {
		params: {
			chatroomId: string;
		};
	};
}

export default function ChatScreen({ route }: Props) {
	const { background, tint, icon, text } = Colors.dark;
	const navigation = useNavigation();
	const [hasAccess, setHasAccess] = useState(false);
	const [sending, setSending] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState<Database["public"]["Tables"]["users"]["Row"] | null>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	const { chatroomId } = route.params;

	// Realtime subscription
	const setupRealtime = () => {
		const subscription = supabase
			.channel("custom-filter-channel")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "chat_messages",
					filter: `chatroom_id=eq.${chatroomId}`,
				},
				async (payload) => {
					const formatted = await formatMessage(payload.new);
					setMessages((prev) => {
						// Check if message with this ID already exists
						if (prev.some((msg) => msg.id === formatted.id)) {
							return prev;
						}
						return [...prev, formatted];
					});
					setTimeout(() => {
						scrollViewRef.current?.scrollToEnd({ animated: true });
					}, 100);
				}
			)
			.subscribe();

		return () => supabase.removeChannel(subscription);
	};

	// Format Supabase message.
	const formatMessage = async (dbMessage: any): Promise<Message> => {
		const isCurrentUser = dbMessage.user_id === user?.id;
		const senderName = (await getNameById(dbMessage.user_id)) || "Unknown User";

		return {
			id: dbMessage.id,
			text: dbMessage.message,
			sender: dbMessage.user_id,
			senderName,
			timestamp: new Date(dbMessage.sent_at).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			isCurrentUser,
		};
	};

	const MemoizedMessageBubble = React.memo(MessageBubble);

	// Update your loadMessages function to filter valid messages
	const loadMessages = useCallback(async () => {
		if (!user || !hasAccess) return; // Don't load messages if user isn't initialized or no access

		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("chat_messages")
				.select("*")
				.eq("chatroom_id", chatroomId)
				.is("is_deleted", null)
				.order("sent_at", { ascending: true });

			if (error) {
				console.error("Error fetching messages:", error);
				return;
			}

			if (data) {
				const formattedMessages = await Promise.all(data.map(formatMessage));
				setMessages(formattedMessages);
				setTimeout(() => {
					scrollViewRef.current?.scrollToEnd({ animated: false });
				}, 300);
			}
		} catch (error) {
			console.error("Error loading messages:", error);
		} finally {
			setLoading(false);
		}
	}, [user, hasAccess, chatroomId]); // Add dependencies

	const handleSend = useCallback(
		async (message: string) => {
			setSending(true);
			const { error } = await supabase.from("chat_messages").insert({
				chatroom_id: chatroomId,
				user_id: user?.id,
				message: message.trim(),
			});
			setSending(false);
		},
		[chatroomId, user?.id]
	);

	useEffect(() => {
		const loadUserAndCheckAccess = async () => {
			setLoading(true);
			try {
				const currentUser = await getUser();
				setUser(currentUser);

				if (!currentUser) {
					navigation.navigate("MainTabs");
					return;
				}

				const { data, error } = await supabase
					.from("chatroom_members")
					.select("has_access_password")
					.eq("chatroom_id", chatroomId)
					.eq("user_id", currentUser.id)
					.single();

				if (data) {
					setHasAccess(true);
				}
			} catch (error) {
				console.error("Error:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUserAndCheckAccess();
	}, [chatroomId, navigation]);

	// Separate useEffect for loading messages when user and access are ready
	useEffect(() => {
		if (user && hasAccess) {
			loadMessages();
		}
	}, [user, hasAccess, loadMessages]);

	// Separate useEffect for realtime subscription
	useEffect(() => {
		if (!user || !hasAccess) return;

		const subscription = setupRealtime();
		return () => {
			subscription();
		};
	}, [user, hasAccess, chatroomId]);

	return (
		<View className="h-full bg-black px-2">
			{/* Header */}
			<View className="flex-row justify-between items-center pt-16 ">
				<TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
					<Ionicons name="chevron-back" size={24} color={icon} />
				</TouchableOpacity>

				<View className="flex-row items-center gap-2">
					<FontAwesome5 name="comments" size={14} color="#000000" />

					<Text className="text-xl font-bold" style={{ color: text }}>
						Live Chat
					</Text>
				</View>

				<TouchableOpacity className="p-2">
					<MaterialCommunityIcons name="dots-vertical" size={24} color={icon} />
				</TouchableOpacity>
			</View>

			{/* Date indicator */}
			<View className="items-center my-2">
				<View className="bg-[#1A1A1A] px-4 py-1 rounded-full">
					<Text className="text-xs" style={{ color: "#A68A3D" }}>
						{new Date().toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
						})}
					</Text>
				</View>
			</View>

			{/* Messages List */}
			{
				<ScrollView
					ref={scrollViewRef}
					className="flex-1 px-2"
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 10,
						paddingTop: 10,
					}}
					showsVerticalScrollIndicator={false}
				>
					{messages.length === 0 ? (
						<View className="flex-1 justify-center items-center h-[300]">
							<MaterialCommunityIcons
								name="chat-outline"
								size={60}
								color="#A68A3D"
								style={{ opacity: 0.5 }}
							/>
							<Text className="text-[#A68A3D] mt-4 text-center opacity-70">
								No messages yet.{"\n"}Start the conversation!
							</Text>
						</View>
					) : (
						messages.map((msg) => <MemoizedMessageBubble key={msg.id} msg={msg} />)
					)}
				</ScrollView>
			}

			{/* Message Input */}
			<MessageInput onSend={handleSend} sending={sending} />
		</View>
	);
}
