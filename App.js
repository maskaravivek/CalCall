import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ContactList from './pages/ContactListPage';
import ChooseCalendars from './pages/ChooseCalendarsPage';
import SettingsPage from './pages/SettingsPage';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as PaperProvider } from 'react-native-paper';
import { Appbar, Menu } from 'react-native-paper';


const Stack = createNativeStackNavigator();

function CustomNavigationBar({ navigation, options }) {
  return (
    <Appbar.Header>
      {options.previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={options.title} />
      {!options.previous && <Appbar.Action icon="cog-outline" onPress={() => navigation.navigate("Settings")} />}
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
                header: (props) => <CustomNavigationBar {...props} />,
              }}>
              <Stack.Screen name="Contacts" component={ContactList} options={{ title: 'Contacts' }}/>
              <Stack.Screen name="Settings" component={SettingsPage} options={{ title: 'Settings', previous: true }}/>
              <Stack.Screen name="Calendars" component={ChooseCalendars} options={{ title: 'Choose Calendars', previous: true }}/>
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>

      </PersistGate>
    </Provider>
  );
}

export default App;