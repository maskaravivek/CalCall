import * as React from 'react';
import { Link, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ContactList from './src/pages/ContactListPage';
import ChooseCalendars from './src/pages/ChooseCalendarsPage';
import LinkPhoneNumberPage from './src/pages/LinkPhoneNumberPage';
import SettingsPage from './src/pages/SettingsPage';
import FavoritesPage from './src/pages/FavoritesPage';
import SignInPage from './src/pages/SignInPage';
import { Provider } from 'react-redux';
import { store, persistor } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as PaperProvider } from 'react-native-paper';
import { Appbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Home() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Favorites" component={FavoritesPage} options={{
        tabBarLabel: 'Favorites',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="heart" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Contacts" component={ContactList} options={{
        tabBarLabel: 'Contacts',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="contacts" color={color} size={26} />
        ),
      }} />
    </Tab.Navigator>
  );
}

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
              initialRouteName="LinkPhoneNumber"
              screenOptions={{
                header: (props) => <CustomNavigationBar {...props} />,
              }}>
              <Stack.Screen name="Login" component={SignInPage} options={{ title: 'Login' }} />
              <Stack.Screen name="LinkPhoneNumber" component={LinkPhoneNumberPage} options={{ title: 'Link Phone Number' }} />
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Settings" component={SettingsPage} options={{ title: 'Settings', previous: true }} />
              <Stack.Screen name="Calendars" component={ChooseCalendars} options={{ title: 'Choose Calendars', previous: true }} />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>

      </PersistGate>
    </Provider>
  );
}

export default App;