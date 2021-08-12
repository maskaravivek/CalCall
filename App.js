import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ContactList from './src/pages/ContactListPage';
import ChooseCalendars from './src/pages/ChooseCalendarsPage';
import LinkPhoneNumberPage from './src/pages/LinkPhoneNumberPage';
import LinkCalendarsPage from './src/pages/LinkCalendarsPage';
import SettingsPage from './src/pages/SettingsPage';
import FavoritesPage from './src/pages/FavoritesPage';
import SignInPage from './src/pages/SignInPage';
import ContactPage from './src/pages/ContactPage';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, persistor } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as PaperProvider } from 'react-native-paper';
import { Appbar, Menu } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ToastProvider } from 'react-native-toast-notifications'
import { selectContactAndSave } from './src/tasks/contacts'
import { syncContacts } from './src/redux/actions/contactsAction'

import { StyleSheet } from "react-native";

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Home() {
  return (
    <Tab.Navigator
      activeColor="white"
      inactiveColor="#E0E0E0"
      barStyle={{ backgroundColor: '#EA5B70' }}>
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
      <Tab.Screen name="Settings" component={SettingsPage} options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="cog-outline" color={color} size={26} />
        ),
      }} />
    </Tab.Navigator>
  );
}

function CustomNavigationBar({ navigation, options }) {
  const dispatch = useDispatch();

  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Appbar.Header dark={true} style={styles.appbar}>
      {options.previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {options.plus ? <Appbar.Action icon="plus" onPress={() => {
        selectContactAndSave().then((contacts) => {
          dispatch(syncContacts(contacts));
        });
      }} /> : null}
      <Appbar.Content titleStyle={styles.appbarTitle} title={options.title} />
      {options.settings &&
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon="dots-vertical" color="white" onPress={openMenu} />
          }>
          <Menu.Item onPress={() => {
            closeMenu()
            navigation.navigate('Settings')
          }} title="Settings" />
        </Menu>}
    </Appbar.Header>
  );
}

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  )
}

const App = () => {
  const user = useSelector((state) => state.user)
  return (
    <ToastProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              header: (props) => <CustomNavigationBar {...props} />,
            }}>
            {
              user.isSignedIn ? (<>
                <Stack.Screen name="Home" component={FavoritesPage} options={{ title: 'Favorites', previous: false, plus: true, settings: true }} />
                <Stack.Screen name="Settings" component={SettingsPage} options={{ title: 'Settings', previous: true, settings: false }} />
                <Stack.Screen name="Contact" component={ContactPage} options={{ title: 'Contact', previous: true, settings: false }} />
                <Stack.Screen name="EditCalendars" component={ChooseCalendars} options={{ title: 'Choose Calendars', previous: true, settings: false }} />
                <Stack.Screen name="EditPhoneNumber" component={LinkPhoneNumberPage} options={{ title: 'Edit Phone Number', previous: true, settings: false }} />
              </>) : (<>
                <Stack.Screen name="LinkPhoneNumber" component={LinkPhoneNumberPage} options={{ title: 'Link Phone Number', previous: false, settings: false }} />
                <Stack.Screen name="ConfigureCalendar" component={LinkCalendarsPage} options={{ title: 'Configure Calendar', previous: false, settings: false }} />
                <Stack.Screen name="Calendars" component={ChooseCalendars} options={{ title: 'Choose Calendars', previous: false, settings: false }} />
              </>)
            }

          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ToastProvider>

  );
}

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#EA5B70',
  },
  appbarTitle: {
    fontWeight: 'bold'
  }
});

export default AppWrapper;