import React, { Component } from "react";
import {
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    ActivityIndicator
} from "react-native";
import Contacts from "react-native-contacts";

import ListItem from "../../components/listitem";
import Avatar from "../../components/avatar";
import { Linking } from 'react-native'
import RNCalendarEvents from "react-native-calendar-events";


type Props = {};
export default class ContactList extends Component<Props> {
    constructor(props) {
        super(props);

        this.state = {
            contacts: [],
            loading: true
        };

        Contacts.iosEnableNotesUsage(false);
    }

    async componentDidMount() {
        this.syncContacts()
        this.syncCalendar()
    }

    syncCalendar() {
        RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    RNCalendarEvents.findCalendars().then(calendars => {
                        calendars.forEach(calendar => {
                            console.log(calendar.title)
                            const startDate = new Date()
                            var endDate = this.addDays(startDate, 7)
                            console.log(startDate, endDate)
                            RNCalendarEvents.fetchAllEvents(startDate.toISOString(), endDate.toISOString(), [calendar.id])
                                .then(events => {
                                    console.log(events)
                                });
                        })
                    });
                } else {
                    RNCalendarEvents.requestPermissions(readOnly = true);
                }
            });
    }

    syncContacts() {
        if (Platform.OS === "android") {
            console.log("ask permission dialog")
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: "Contacts",
                message: "This app would like to view your contacts."
            }).then(() => {
                this.loadContacts();
            });
        } else {
            console.log("else block")
            this.loadContacts();
        }
    }

    addDays(date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }

    loadContacts() {
        Contacts.getAll()
            .then(contacts => {
                const trimmedContacts = contacts
                    .filter(c => c.phoneNumbers.length > 0)
                    .map(c => {
                        return {
                            "hasThumbnail": c["hasThumbnail"],
                            "thumbnailPath": c["thumbnailPath"],
                            "givenName": c["givenName"],
                            "familyName": c["familyName"],
                            "recordID": c["recordID"],
                            "phoneNumbers": c["phoneNumbers"],
                        }
                    })
                this.setState({ contacts: trimmedContacts, loading: false });
            })
            .catch(e => {
                this.setState({ loading: false });
            });

        Contacts.checkPermission();
    }

    onPressContact(phoneNumbers) {
        console.log(phoneNumbers)
        Linking.openURL(`tel:${phoneNumbers[0].number}`)
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View
                    style={{
                        paddingLeft: 100,
                        paddingRight: 100,
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                </View>
                {
                    this.state.loading === true ?
                        (
                            <View style={styles.spinner}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                        ) : (
                            <ScrollView style={{ flex: 1 }}>
                                {this.state.contacts.map(contact => {
                                    return (
                                        <ListItem
                                            leftElement={
                                                <Avatar
                                                    img={
                                                        contact.hasThumbnail
                                                            ? { uri: contact.thumbnailPath }
                                                            : undefined
                                                    }
                                                    placeholder={getAvatarInitials(
                                                        `${contact["givenName"]} ${contact["familyName"]}`
                                                    )}
                                                    width={40}
                                                    height={40}
                                                />
                                            }
                                            key={contact["recordID"]}
                                            title={`${contact["givenName"]} ${contact["familyName"]}`}
                                            onPress={() => this.onPressContact(contact["phoneNumbers"])}
                                        />
                                    );
                                })}
                            </ScrollView>
                        )
                }

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    spinner: {
        flex: 1,
        flexDirection: 'column',
        alignContent: "center",
        justifyContent: "center"
    },
    inputStyle: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        textAlign: "center"
    }
});

const getAvatarInitials = textString => {
    if (!textString) return "";

    const text = textString.trim();

    const textSplit = text.split(" ");

    if (textSplit.length <= 1) return text.charAt(0);

    const initials =
        textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);

    return initials;
};