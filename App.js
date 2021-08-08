import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ContactList from './pages/ContactListPage';
import ChooseCalendars from './pages/ChooseCalendarsPage';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as PaperProvider } from 'react-native-paper';
import { Appbar, Menu } from 'react-native-paper';


const Stack = createNativeStackNavigator();

function CustomNavigationBar({ navigation, previous }) {
  return (
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="CalCall" />
      <Appbar.Action icon="cog-outline" onPress={() => navigation.navigate("Calendars")} />
    </Appbar.Header>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                header: CustomNavigationBar,
              }}>
              <Stack.Screen name="Contacts" component={ContactList} />
              <Stack.Screen name="Calendars" component={ChooseCalendars} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>

      </PersistGate>
    </Provider>
  );
}

export default App;