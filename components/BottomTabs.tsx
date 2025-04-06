import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import MusicScreen from "../screens/MusicScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Colors } from "../constants/Colors";

const Tab = createBottomTabNavigator();

type EntypoIconName = keyof typeof Entypo.glyphMap;

const BottomTabs = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let iconName: EntypoIconName = "home";

					switch (route.name) {
						case "Home":
							iconName = "home";
							break;
						case "Music":
							iconName = "list"; // Changed to valid Entypo icon name
							break;
						case "Settings":
							iconName = "cog"; // Changed to valid Entypo icon name
							break;
					}

					return <Entypo name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: Colors.dark.tint,
				tabBarInactiveTintColor: Colors.dark.icon,
				tabBarStyle: {
					backgroundColor: Colors.dark.background,
					// Black background
					borderTopWidth: 0, // Remove top border
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
			<Tab.Screen name="Music" component={MusicScreen} options={{ headerShown: false }} />
			<Tab.Screen
				name="Settings"
				component={SettingsScreen}
				options={{ headerShown: false }}
			/>
		</Tab.Navigator>
	);
};

export default BottomTabs;
