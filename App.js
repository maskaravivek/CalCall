import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ContactList from './src/pages/ContactListPage';
import ChooseCalendars from './src/pages/ChooseCalendarsPage';
import LinkPhoneNumberPage from './src/pages/LinkPhoneNumberPage';
import LinkCalendarsPage from './src/pages/LinkCalendarsPage';
import SettingsPage from './src/pages/SettingsPage';
import FavoritesPage from './src/pages/FavoritesPage';
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
import BackgroundTask from 'react-native-background-task'
import { backgroundSync } from './src/tasks/tasks'

import { StyleSheet } from "react-native";
import "./src/push"
import { sendNotificationWhenUserGetsFree } from "./src/push/push"
import { useToast } from "react-native-toast-notifications";

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

BackgroundTask.define(async () => {
  backgroundSync()
  BackgroundTask.finish()
})

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
  const contact = useSelector((state) => state.contacts.selectedContact)
  const dispatch = useDispatch();
  const toast = useToast();


  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Appbar.Header dark={true} style={styles.appbar}>
      {options.previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {options.plus ? <Appbar.Action icon="plus" onPress={() => {
        selectContactAndSave().then((contacts) => {
          if (contacts != null) {
            dispatch(syncContacts(contacts));
          }
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
      {options.notifcation && contact.status === "IN_MEETING" ? <Appbar.Action icon="bell" onPress={() => {
        if (sendNotificationWhenUserGetsFree(contact)) {
          toast.show(`We will notify you when ${contact.givenName} get free!`, {
            type: "normal",
            placement: "bottom",
            duration: 1000,
            offset: 30,
            animationType: "zoom-in",
          });
        }
      }} /> : null}
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

  checkStatus = async () => {
    const status = await BackgroundTask.statusAsync()

    if (status.available) {
      console.log("background tasks enabled")
      return
    }

    const reason = status.unavailableReason
    console.log("background task disabled with reason", reason)
  }

  useEffect(() => {
    BackgroundTask.schedule({
      period: 1800, // Aim to run every 30 mins - more conservative on battery
    })
    checkStatus()
  });
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
                <Stack.Screen name="Contact" component={ContactPage} options={{ title: 'Contact', previous: true, settings: false, notifcation: true }} />
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