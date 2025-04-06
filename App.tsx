import { Provider } from "react-redux";
import Router from "./router";
import { persistor, store } from "./redux";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator } from "react-native";

const App = () => (
	<Provider store={store}>
		<PersistGate loading={<ActivityIndicator />} persistor={persistor}>
			<Router />
		</PersistGate>
	</Provider>
);

export default App;
