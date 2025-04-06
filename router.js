import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import { initializePlayer } from "./service";
import BottomTabs from "./components/BottomTabs";
import ChatScreen from "./screens/ChatScreen";
import VoteScreen from "./screens/VoteScreen";
import LoginScreen from "./screens/LoginScreen";
import { supabase } from "./utils/supabase";

import "./global.css";
import ChatAccessScreen from "./screens/ChatAccessScreen";
import CreateChatRoomScreen from "./screens/CreateChatRoomScreen";

const Stack = createNativeStackNavigator();

const Router = () => {
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [session, setSession] = useState(null);

	const setup = async () => {
		try {
			await initializePlayer();
			setIsPlayerReady(true);
		} catch (error) {
			console.error("Failed to initialize player:", error);
			setIsPlayerReady(false);
		}
	};

	useEffect(() => {
		setup();
		// Cleanup function
		return () => {
			TrackPlayer.reset().catch(() => {});
		};
	}, []);
	useEffect(() => {
		// Handle initial session
		const handleInitialSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
		};

		// Handle auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
		});

		// Run initial session check
		handleInitialSession();

		// Cleanup function
		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	if (!isPlayerReady) {
		return (
			<SafeAreaView>
				<ActivityIndicator />
			</SafeAreaView>
		);
	}

	return (
		<NavigationContainer>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Stack.Navigator>
					{!session ? (
						<Stack.Screen
							name="Login"
							component={LoginScreen}
							options={{
								headerShown: false,
							}}
						/>
					) : (
						<>
							<Stack.Screen
								name="MainTabs"
								component={BottomTabs}
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="CreateChat"
								component={CreateChatRoomScreen}
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="ChatAccess"
								component={ChatAccessScreen}
								options={{
									presentation: "Modal",
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="Chat"
								component={ChatScreen}
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="Vote"
								component={VoteScreen}
								options={{
									presentation: "FullScreenModal",
									headerShown: false,
								}}
							/>
						</>
					)}
				</Stack.Navigator>
			</GestureHandlerRootView>
		</NavigationContainer>
	);
};

export default Router;
