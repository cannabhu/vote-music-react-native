/**
 * Black & Gold Color Theme
 * Main colors: Black (#000000) and Gold (#D4AF37)
 * Accent gold variations: #A68A3D (muted gold), #FFD700 (vivid gold)
 */

const tintColorLight = "#D4AF37"; // Primary gold
const tintColorDark = "#FFD700";
const tabIconSelected = "#D4AF37";
const tabIconDefault = "#A68A3D"; // Brighter gold

export const Colors = {
	light: {
		text: "white", // Gold text on black
		background: "#00040B", // Black background
		tint: tintColorLight,
		icon: "#A68A3D", // Muted gold icons
		tabIconDefault,
		tabIconSelected,
	},
	dark: {
		text: "white", // Bright gold text
		background: "#00040B", // Black background
		tint: tintColorDark,
		icon: "#A68A3D", // Muted gold icons
		tabIconDefault: "#A68A3D",
		tabIconSelected: tintColorDark,
	},
};
