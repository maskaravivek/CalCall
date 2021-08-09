import React, { Component } from "react";
import {
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    StyleSheet,
    FlatList
} from "react-native";
import Contacts from "react-native-contacts";

import ListItem from "../../components/listitem";
import Avatar from "../../components/avatar";
import { Linking } from 'react-native'
import RNCalendarEvents from "react-native-calendar-events";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import syncContacts from '../../redux/actions/contactsAction'
import firestore from '@react-native-firebase/firestore';

type Props = {};
class ContactList extends Component<Props> {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        Contacts.iosEnableNotesUsage(false);
    }

    async componentDidMount() {
        this.syncContacts()
        this.syncCalendar()
        this.getSubscribedUserEvents(['4803528702'])
    }

    async deleteOldEvents() {
        const usersQuerySnapshot = await firestore().collection('Users')
            .doc(this.props.user.user.uid)
            .collection('userEvents')
            .where('endDate', '<', Date.now())
            .get()
        const batch = firestore().batch();

        usersQuerySnapshot.forEach(documentSnapshot => {
            batch.delete(documentSnapshot.ref);
        });

        return batch.commit();
    }

    getSubscribedUserEvents(subscribedList) {
        firestore().collection('Users')
            .where('phoneNumber', 'in', subscribedList)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.id, " => ", doc.data());
                    this.getUserEvents(doc.id)
                });
            });
    }

    getUserEvents(uid) {
        firestore().collection('Users')
            .doc(uid)
            .collection('userEvents')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.id, " => ", doc.data());
                    this.getUserEvents(doc.id)
                });
            })
    }

    syncCalendar() {
        this.deleteOldEvents()
        RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    this.props.calendars.calendars.forEach(calendar => {
                        const startDate = new Date()
                        var endDate = this.addDays(startDate, 7)
                        RNCalendarEvents.fetchAllEvents(startDate.toISOString(), endDate.toISOString(), [calendar.id])
                            .then(events => {
                                events.forEach(event => {
                                    const eventObj = {
                                        "title": event.title,
                                        "availability": event.availability,
                                        "startDate": this.getTimeInEpoch(event.startDate),
                                        "endDate": this.getTimeInEpoch(event.endDate)
                                    }
                                    this.saveEvent(event.id, eventObj)
                                })
                            });
                    })
                } else {
                    RNCalendarEvents.requestPermissions(readOnly = true);
                }
            });
    }

    getTimeInEpoch(isoDateString) {
        return Date.parse(isoDateString);
    }

    saveEvent(eventId, event) {
        firestore().collection('Users')
            .doc(this.props.user.user.uid)
            .collection('userEvents')
            .doc(eventId)
            .set(event);
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
                this.props.syncContacts(trimmedContacts)
                this.setState({ loading: false });
            })
            .catch(e => {
                this.setState({ loading: false });
            });

        Contacts.checkPermission();
    }

    onPressContact(phoneNumbers) {
        Linking.openURL(`tel:${phoneNumbers[0].number}`)
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.props.contacts.contacts}
                    keyExtractor={item => item.recordID}
                    renderItem={({ item }) => <ListItem
                        leftElement={
                            <Avatar
                                img={
                                    item.hasThumbnail
                                        ? { uri: item.thumbnailPath }
                                        : undefined
                                }
                                placeholder={getAvatarInitials(
                                    `${item["givenName"]} ${item["familyName"]}`
                                )}
                                width={40}
                                height={40}
                            />
                        }
                        key={item["recordID"]}
                        title={`${item["givenName"]} ${item["familyName"]}`}
                        onPress={() => this.onPressContact(item["phoneNumbers"])}
                    />
                    }
                />

            </SafeAreaView>
        );
    }
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

const mapStateToProps = (state) => {
    const { contacts, calendars, user } = state
    return { contacts, calendars, user }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        syncContacts,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ContactList);
