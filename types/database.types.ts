export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			chat_messages: {
				Row: {
					chatroom_id: string | null;
					created_at: string;
					edited_at: string | null;
					id: string;
					is_deleted: string | null;
					message: string | null;
					sent_at: string | null;
					user_id: string | null;
				};
				Insert: {
					chatroom_id?: string | null;
					created_at?: string;
					edited_at?: string | null;
					id?: string;
					is_deleted?: string | null;
					message?: string | null;
					sent_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					chatroom_id?: string | null;
					created_at?: string;
					edited_at?: string | null;
					id?: string;
					is_deleted?: string | null;
					message?: string | null;
					sent_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "chat_messages_chatroom_id_fkey";
						columns: ["chatroom_id"];
						isOneToOne: false;
						referencedRelation: "chatrooms";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "chat_messages_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			chatroom_members: {
				Row: {
					chatroom_id: string;
					created_at: string;
					has_access_password: boolean | null;
					id: number;
					user_id: string;
				};
				Insert: {
					chatroom_id?: string;
					created_at?: string;
					has_access_password?: boolean | null;
					id?: number;
					user_id?: string;
				};
				Update: {
					chatroom_id?: string;
					created_at?: string;
					has_access_password?: boolean | null;
					id?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "chatroom_members_chatroom_id_fkey";
						columns: ["chatroom_id"];
						isOneToOne: false;
						referencedRelation: "chatrooms";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "chatroom_members_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			chatrooms: {
				Row: {
					created_at: string;
					created_by: string | null;
					description: string | null;
					id: string;
					max_members: number | null;
					name: string | null;
					password_hash: string | null;
				};
				Insert: {
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					max_members?: number | null;
					name?: string | null;
					password_hash?: string | null;
				};
				Update: {
					created_at?: string;
					created_by?: string | null;
					description?: string | null;
					id?: string;
					max_members?: number | null;
					name?: string | null;
					password_hash?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "chatrooms_created_by_fkey";
						columns: ["created_by"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			songs: {
				Row: {
					added_by: string | null;
					artist: string | null;
					artwork: string | null;
					created_at: string;
					duration: string | null;
					id: string;
					title: string | null;
					url: string | null;
					vote_count: number;
				};
				Insert: {
					added_by?: string | null;
					artist?: string | null;
					artwork?: string | null;
					created_at?: string;
					duration?: string | null;
					id?: string;
					title?: string | null;
					url?: string | null;
					vote_count?: number;
				};
				Update: {
					added_by?: string | null;
					artist?: string | null;
					artwork?: string | null;
					created_at?: string;
					duration?: string | null;
					id?: string;
					title?: string | null;
					url?: string | null;
					vote_count?: number;
				};
				Relationships: [
					{
						foreignKeyName: "songs_added_by_fkey";
						columns: ["added_by"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					}
				];
			};
			user_votes: {
				Row: {
					session_id: string;
					song_id: string | null;
					user_id: string;
					voted_at: string | null;
				};
				Insert: {
					session_id: string;
					song_id?: string | null;
					user_id: string;
					voted_at?: string | null;
				};
				Update: {
					session_id?: string;
					song_id?: string | null;
					user_id?: string;
					voted_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "user_votes_session_id_fkey";
						columns: ["session_id"];
						isOneToOne: false;
						referencedRelation: "voting_sessions";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "user_votes_song_id_fkey";
						columns: ["song_id"];
						isOneToOne: false;
						referencedRelation: "songs";
						referencedColumns: ["id"];
					}
				];
			};
			users: {
				Row: {
					avatar: string | null;
					created_at: string;
					id: string;
					is_admin: boolean | null;
					last_voted_time: string;
					name: string | null;
				};
				Insert: {
					avatar?: string | null;
					created_at?: string;
					id?: string;
					is_admin?: boolean | null;
					last_voted_time?: string;
					name?: string | null;
				};
				Update: {
					avatar?: string | null;
					created_at?: string;
					id?: string;
					is_admin?: boolean | null;
					last_voted_time?: string;
					name?: string | null;
				};
				Relationships: [];
			};
			voting_sessions: {
				Row: {
					created_at: string;
					end_time: string;
					id: string;
					is_active: boolean | null;
					top_song_id: string | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string;
					end_time: string;
					id?: string;
					is_active?: boolean | null;
					top_song_id?: string | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string;
					end_time?: string;
					id?: string;
					is_active?: boolean | null;
					top_song_id?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "voting_sessions_top_song_id_fkey";
						columns: ["top_song_id"];
						isOneToOne: false;
						referencedRelation: "songs";
						referencedColumns: ["id"];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			check_expired_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			create_new_session: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			generate_password_hash: {
				Args: {
					plain_password: string;
				};
				Returns: string;
			};
			increment_vote: {
				Args: {
					song_id: string;
				};
				Returns: undefined;
			};
			verify_chatroom_password: {
				Args: {
					password_attempt: string;
				};
				Returns: string;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
	? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
	? PublicSchema["Enums"][PublicEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
	? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;
