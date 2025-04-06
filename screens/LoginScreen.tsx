import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { storeData } from "@/utils/storage";
import { User } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri({
	scheme: "com.juke.app", // Matches bundle identifier
	path: "expo-auth-session",
});

const createUser = async (user: User, navigate: { navigate: (arg0: string) => void }) => {
	const newUser = {
		id: user.id,
		name: user.user_metadata?.name || "Anonymous",
		avatar: user.user_metadata?.avatar_url || "",
		last_voted_time: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from("users")
		.upsert(newUser, { onConflict: "id" })
		.select()
		.single();

	if (!error && data) {
		navigate.navigate("MainTabs");
	}
};

const createSessionFromUrl = async (url: string) => {
	const { params, errorCode } = QueryParams.getQueryParams(url);

	if (errorCode) throw new Error(errorCode);
	const { access_token, refresh_token, provider_token, provider_refresh_token, expires_at } =
		params;

	// Store Spotify tokens separately
	if (provider_token) {
		await storeData("@access_token", provider_token);
		await storeData("@refresh_token", provider_refresh_token);
		await storeData("@expires_at", expires_at);
	}

	if (!access_token) return;

	const { data, error } = await supabase.auth.setSession({
		access_token,
		refresh_token,
	});
	if (error) throw error;

	if (error) {
		throw error;
	}

	return data.session;
};

const performOAuth = async () => {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "spotify",
		options: {
			redirectTo,
			skipBrowserRedirect: true,
			scopes: [
				"user-library-read",
				"playlist-read-private",
				"user-read-recently-played",
				"user-top-read",
				"user-follow-read",
				"streaming",
				"user-read-playback-state",
			].join(" "),
		},
	});
	if (error) throw error;

	const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo);

	if (res.type === "success") {
		const { url } = res;
		await createSessionFromUrl(url);
	}
};

export default function LoginScreen() {
	const navigation = useNavigation();
	const url = Linking.useURL();
	if (url) {
		console.log("url: ", url);
		createSessionFromUrl(url);
	}

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" && session?.user) {
				if (session.user) createUser(session.user, navigation);
			}
		});

		return () => subscription?.unsubscribe();
	}, [navigation]);

	return (
		<SafeAreaView className="flex-1 bg-black">
			<ImageBackground
				source={require("@/assets/loginaudio.png")}
				className="flex-1"
				resizeMode="cover"
				imageStyle={{ opacity: 0.3 }}
			>
				<View className="flex-1 items-center justify-center p-8">
					{/* Logo Section */}
					<View className="items-center mb-16">
						<MaterialCommunityIcons
							name="trumpet"
							size={64}
							color="#FFD700"
							className="mb-4"
						/>
						<Text className="text-4xl font-bold text-[#FFD700] mb-2">Juke</Text>
						<Text className="text-gray-300 text-lg">Community Music Experience</Text>
					</View>
					{/* Login Form */}
					<View className="w-full">
						{/* Spotify Sign In Button */}
						<TouchableOpacity
							className="bg-[#1DB954] p-4 rounded-full flex-row items-center justify-center"
							activeOpacity={0.8}
							onPress={performOAuth} // Add this line to call the authenticate function
						>
							<MaterialCommunityIcons
								name="spotify"
								size={24}
								color="white"
								className="mr-3"
							/>
							<Text className="text-white font-bold text-lg">
								Continue with Spotify
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}
