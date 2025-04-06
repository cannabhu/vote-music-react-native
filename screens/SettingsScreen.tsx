import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { storeData } from "@/utils/storage";
import { supabase } from "@/utils/supabase";

export default function SettingsScreen() {
	const handleLogout = async () => {
		try {
			// Clear any stored data
			await storeData("@access_token", "");
			await storeData("@refresh_token", "");

			await supabase.auth.signOut();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="px-4 py-6 border-b border-/20">
				<Text className="text-2xl font-bold text-white">Settings</Text>
			</View>

			<ScrollView className="flex-1">
				{/* Account Section */}
				<View className="px-4 py-2">
					<TouchableOpacity className="flex-row items-center py-4">
						<MaterialIcons name="person" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Profile</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color="#A68A3D"
							className="ml-auto"
						/>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center py-4">
						<FontAwesome name="heart-o" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Liked Songs</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color="#A68A3D"
							className="ml-auto"
						/>
					</TouchableOpacity>
				</View>

				{/* App Preferences */}
				<View className="px-4 py-2">
					<View className="py-2 border-b border-gold/10">
						<Text className="text-gray-200 text-sm">APP PREFERENCES</Text>
					</View>

					<TouchableOpacity className="flex-row items-center py-4">
						<Ionicons name="language" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Language</Text>
						<Text className="text-gray-200 ml-auto">English</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center py-4">
						<MaterialIcons name="contact-support" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Contact Us</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center py-4">
						<MaterialIcons name="help-outline" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">FAQs</Text>
					</TouchableOpacity>
				</View>

				{/* About Section */}
				<View className="px-4 py-2">
					<View className="py-2 border-b border-gold/10">
						<Text className="text-gray-200 text-sm">ABOUT</Text>
					</View>

					<TouchableOpacity className="flex-row items-center py-4">
						<FontAwesome name="info-circle" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Moment Apps</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center py-4">
						<MaterialIcons name="settings" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">App Settings</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center py-4">
						<MaterialIcons name="short-text" size={24} color="#D4AF37" />
						<Text className="text-white text-lg ml-4">Shortw</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
			{/* Logout Section */}
			<View className="px-4 py-2 mt-8 border-t border-gold/20">
				<TouchableOpacity className="flex-row items-center py-4" onPress={handleLogout}>
					<Ionicons name="log-out-outline" size={24} color="#EF4444" />
					<Text className="text-red-500 text-lg ml-4">Log Out</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
