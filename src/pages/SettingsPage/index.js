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
                <TouchableHighlight onPress={() => navigation.navigate('Calendars')} underlayColor="white">
                    <View style={styles.button}>
                        <Icon
                            name='event' /><Text style={styles.buttonText}>Select Calendars</Text>
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