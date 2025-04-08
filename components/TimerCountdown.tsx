import { Tables } from "@/types/database.types";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

interface TimerCountdown {
	currentSession: any;
	tint: string;
	updateCanVote: (canVote: boolean) => void;
}

// Calculate time remaining
export const calculateTimeLeft = (currentSession: Tables<"voting_sessions">, endTime?: string) => {
	if (!currentSession.end_time) return 0;
	const end = new Date(endTime || currentSession.end_time).getTime();
	const now = Date.now();
	return Math.max(Math.ceil((end - now) / 1000), 0);
};

export const calculateTimeToNextSession = (currentSession: Tables<"voting_sessions">) => {
	if (!currentSession.end_time) return 0;
	const end = new Date(currentSession.end_time).getTime();
	const now = Date.now();
	return Math.max(45 - Math.ceil((now - end) / 1000), 0);
};

export const TimerCountdown: React.FC<TimerCountdown> = ({
	currentSession,
	tint,
	updateCanVote,
}) => {
	// Add state for time left
	const [timeRemaining, setTimeRemaining] = useState(calculateTimeLeft(currentSession));
	const [timeToNextSession, setTimeToNextSession] = useState(
		calculateTimeToNextSession(currentSession)
	);

	useEffect(() => {
		const timer = setInterval(async () => {
			const newTimeLeft = calculateTimeLeft(currentSession);
			setTimeRemaining(newTimeLeft);

			// If time has run out, update the session to trigger the finalize_voting_session function
			if (newTimeLeft === 0 && currentSession.is_active) {
				clearInterval(timer);

				const { error } = await supabase
					.from("voting_sessions")
					.update({ is_active: true }) // Force an update to trigger the finalize_voting_session
					.eq("id", currentSession.id);

				if (error) {
					console.error("Error updating expired session:", error);
				}

				updateCanVote(false);
			}
		}, 1000);

		// Cleanup interval on unmount
		return () => clearInterval(timer);
	}, [currentSession]);

	useEffect(() => {
		const timer = setInterval(async () => {
			const newTimeToNextSession = calculateTimeToNextSession(currentSession);
			setTimeToNextSession(newTimeToNextSession);
		}, 1000);

		// Cleanup interval on unmount
		return () => clearInterval(timer);
	}, [currentSession]);

	return (
		<Text className="text-sm mt-1" style={{ color: tint }}>
			{timeRemaining <= 0
				? `Finalizing highest voted song in ${timeToNextSession}s`
				: `Voting ends in ${timeRemaining}s`}
		</Text>
	);
};
