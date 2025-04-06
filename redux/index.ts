import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import voteReducer from "./slices/votes";
import authReducer from "./slices/auth";
import playerReducer from "./slices/player";

// Persist configuration
const persistConfig = {
	key: "root",
	storage: AsyncStorage,
};

const rootReducer = combineReducers({
	vote: voteReducer,
	auth: authReducer,
	player: playerReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
