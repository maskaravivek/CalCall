import React from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableHighlight
} from "react-native";
import { Icon } from 'react-native-elements'

import { ScrollView } from "react-native-gesture-handler";
import { syncDeviceContacts } from '../../tasks/contacts'
import { useToast } from "react-native-toast-notifications";

export default function SettingsPage({ navigation }) {
    const toast = useToast();

    const syncContacts = () => {
        console.log("Syncing...")
        if (Platform.OS === "android") {
            console.log("ask permission dialog")
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: "Contacts",
                message: "This app would like to view your contacts."
            }).then(() => {
                loadContacts();
            });
        } else {
            loadContacts();
        }
    }

    const loadContacts = () => {
        console.log("Syncing...")
        const id = toast.show("Syncing...", {
            placement: "bottom",
            offset: 30,
            animationType: "zoom-in",
            duration: 1000
        })
        syncDeviceContacts().then(() => {
            console.log("Contacts synced!")
            toast.update(id, "Synced successfully!", {
                type: "success"
            })
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <TouchableHighlight onPress={() => navigation.navigate('EditPhoneNumber')} underlayColor="white">
                    <View style={styles.button}>
                        <Icon
                            name='phone-portrait-outline' type='ionicon' color='#FF8E9E' /><Text style={styles.buttonText}>Change Phone Number</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => navigation.navigate('EditCalendars')} underlayColor="white">
                    <View style={styles.button}>
                        <Icon
                            name='event' color='#FF8E9E' /><Text style={styles.buttonText}>Select Calendars</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => syncContacts()} underlayColor="white">
                    <View style={styles.button}>
                        <Icon
                            name='sync' color='#FF8E9E' /><Text style={styles.buttonText}>Sync Contacts</Text>
                    </View>
                </TouchableHighlight>
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    button: {
        padding: 12,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        textAlign: 'center',
        padding: 12,
        fontSize: 20,
        color: 'black'
    }
});