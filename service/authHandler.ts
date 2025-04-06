import { getData, storeData } from "@/utils/storage";
import { supabase } from "@/utils/supabase";

const handleAuthError = async () => {
	await storeData("@access_token", "");
	await storeData("@refresh_token", "");
};
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
	try {
		const accessToken = await getData("@access_token");

		const response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (response.status === 401) {
			await handleAuthError();
			throw new Error("Authentication failed");
		}

		return response;
	} catch (error) {
		console.error("Fetch error:", error);
		await supabase.auth.signOut();
		throw error;
	}
};
