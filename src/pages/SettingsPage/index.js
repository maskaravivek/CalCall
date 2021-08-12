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

export default function SettingsPage({ navigation }) {

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <TouchableHighlight onPress={() => navigation.navigate('EditPhoneNumber', {
                    onboarding: false
                })} underlayColor="white">
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