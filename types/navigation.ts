export type RootStackParamList = {
	Login: undefined;
	MainTabs: undefined;
	ChatAccess: { chatroomId: string };
	CreateChat: undefined;
	Chat: { chatroomId: string };
	Vote: undefined;
};

// Extend the navigation type for useNavigation hook
declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
