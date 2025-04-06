import { getData } from "@/utils/storage";
import TrackPlayer, { Event, RepeatMode, Track } from "react-native-track-player";

interface CustomTrack extends Track {
	id: string;
	url: string;
	title: string;
	artist: string;
	artwork: string;
	duration: number;
}

export async function setupPlayer() {
	try {
		// Better initialization check
		const isInitialized = await TrackPlayer.getActiveTrackIndex();
		if (isInitialized !== undefined) return true;
	} catch (e) {
		// Player needs initialization
		await TrackPlayer.setupPlayer();
		return true;
	}
	return false;
}

// Add this new function to handle full initialization
export async function initializePlayer() {
	await setupPlayer();
	await TrackPlayer.reset();
	await addTrack();
}

export async function addTrack(): Promise<void> {
	try {
		const storedTrackData = await getData("@track");
		if (!storedTrackData) return;

		const tracks = JSON.parse(storedTrackData as string) as CustomTrack[];
		await TrackPlayer.add(tracks);
		await TrackPlayer.setRepeatMode(RepeatMode.Off);
	} catch (error) {
		console.error("Error adding track:", error);
		throw error;
	}
}

export default async function playBackService() {
	TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
	TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
	TrackPlayer.addEventListener(Event.RemoteStop, () => {
		TrackPlayer.stop();
	});

	// Add other events using the Event enum
	TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
	TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

	// Add state listeners to prevent warnings
	TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
		console.log("Playback state:", state);
	});

	TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
		console.log("Active track changed:", event);
	});
}
