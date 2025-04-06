import { Track } from "react-native-track-player";
import { fetchWithAuth } from "./authHandler";

async function fetchSpotifyTracks(trackName: string) {
	const searchParams = new URLSearchParams({
		q: trackName,
		type: "track",
		limit: "10",
	});

	const response = await fetchWithAuth(`https://api.spotify.com/v1/search?${searchParams}`);

	const data = await response.json();

	return data.tracks?.items || [];
}

async function fetchPreviewUrl(trackId: string) {
	try {
		const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`);

		if (response.ok) {
			const trackData = await response.text();
			const previewUrlMatch = trackData.match(
				/https:\/\/p\.scdn\.co\/mp3-preview\/[a-zA-Z0-9]+/
			);

			if (previewUrlMatch) {
				return previewUrlMatch[0];
			} else {
				console.log("No preview URL found.");
			}
		}
		return null;
	} catch (error) {
		console.error("Error fetching preview URL:", error);
		return null;
	}
}

export async function searchSong(query: string): Promise<Track | null> {
	try {
		if (!query.trim()) {
			throw new Error("Search query cannot be empty");
		}

		const tracks = await fetchSpotifyTracks(query);

		if (tracks.length === 0) {
			return null;
		}

		const firstTrack = tracks[0];

		const previewUrl = await fetchPreviewUrl(firstTrack.id);

		if (!previewUrl) {
			return null;
		}

		const trackData: Track = {
			id: firstTrack.id,
			artist: firstTrack.artists[0].name,
			url: previewUrl,
			artwork: firstTrack.album.images[0].url,
			title: firstTrack.name,
			duration: 30,
		};

		return trackData;
	} catch (error) {
		console.error("Error in searchSong:", error);
		throw error;
	}
}
