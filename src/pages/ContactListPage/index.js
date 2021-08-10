import React from "react";
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
import realm from '../../realm/realm'
import { UpdateMode } from "realm";

class ContactList extends React.Component {
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
        this.syncRegisteredContactEvents()
        this.updateRegisteredUserStatus()
        this.updateContactListOnUI()
    }

    updateContactListOnUI() {
        const contacts = realm.objects("Contact")
        .map(result => {
            console.log(result.givenName, result.phoneNumber)
            return {
                recordID: result.recordID,
                uid: result.uid,
                thumbnailPath: result.thumbnailPath,
                givenName: result.givenName,
                familyName: result.familyName,
                hasThumbnail: result.hasThumbnail,
                phoneNumber: result.phoneNumber,
                status: result.status,
                statusMessage: result.statusMessage
            }
        });
        this.showSortedContacts(contacts)
    }

    showSortedContacts(contacts) {
        console.log(contacts.length)
        contacts.sort((a, b) => {
            return a.givenName.localeCompare(b.givenName)
        });
        this.props.syncContacts(contacts)
    }

    async updateRegisteredUserStatus() {
        const events = realm.objects("Event");
        const filteredEvents = events
            .filtered(`(startDate > ${Date.now()} && startDate <= ${Date.now() + (100 * 15 * 60000)}) 
        || (startDate < ${Date.now()} && endDate > ${Date.now()})`)

        let userStatusMap = {}
        filteredEvents.forEach(event => {
            if (event.startDate < Date.now() && event.endDate > Date.now()) {
                userStatusMap[event.uid] = {
                    "status": "IN_MEETING",
                    "statusMessage": "In a meeting"
                }
            } else if (event.startDate <= (Date.now() + (100 * 15 * 60000))) {
                if (!(event.uid in userStatusMap)) {
                    userStatusMap[event.uid] = {
                        "status": "UPCOMING_MEETING",
                        "statusMessage": "Has a meeting in 15 minutes"
                    }
                }
            }
        })

        for (const [uid, value] of Object.entries(userStatusMap)) {
            this.updateContactStatus(uid, value["status"], value["statusMessage"])
        }
    }

    syncRegisteredContactEvents() {
        const contacts = realm.objects("Contact");
        const registeredContacts = contacts.filtered("uid != null")
        const uids = registeredContacts.map((contact) => contact.uid);
        uids.forEach(uid => this.getUserEvents(uid))
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

    async getPhoneNumberUidMap() {
        return firestore().collection('Users')
            .get()
            .then(querySnapshot => {
                let phoneNumberUidMap = {}
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    phoneNumberUidMap[docData.phoneNumber] = doc.id
                });
                return phoneNumberUidMap;
            })
    }

    updateContactStatus(uid, status, statusMessage) {
        const contacts = realm.objects("Contact");
        const matchedContact = contacts.filtered(`uid == '${uid}'`)
        realm.write(() => {
            matchedContact[0].status = status
            matchedContact[0].statusMessage = statusMessage
        });
    }

    async getUserEvents(uid) {
        firestore().collection('Users')
            .doc(uid)
            .collection('userEvents')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    realm.write(() => {
                        realm.create("Event", {
                            _id: doc.id,
                            uid: uid,
                            title: docData.title,
                            availability: docData.availability,
                            startDate: docData.startDate,
                            endDate: docData.endDate,
                        }, UpdateMode.Modified);
                    });
                });
            }).then(() => console.log("User event synced:", uid))
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
                    .filter(c => c.phoneNumbers.length > 0 && c.givenName.length > 0)
                    .map(c => {
                        return {
                            "hasThumbnail": c["hasThumbnail"],
                            "thumbnailPath": c["thumbnailPath"],
                            "givenName": c["givenName"] || "",
                            "familyName": c["familyName"] || "",
                            "recordID": c["recordID"],
                            "phoneNumbers": c["phoneNumbers"],
                        }
                    })
                this.setState({ loading: false });
                return trimmedContacts;
            })
            .catch(e => {
                this.setState({ loading: false });
            }).then(contacts => {
                console.log('contacts', contacts.length)

                this.getPhoneNumberUidMap()
                    .then(phoneNumberUidMap => {
                        contacts.forEach(contact => {
                            const phoneNumber = contact.phoneNumbers[0].number.replace(/[^\d]/g, '').slice(-10)
                            let uid = phoneNumberUidMap[phoneNumber];
                            realm.write(() => {
                                realm.create("Contact", {
                                    recordID: contact.recordID,
                                    uid: uid,
                                    thumbnailPath: contact.thumbnailPath,
                                    givenName: contact.givenName,
                                    familyName: contact.familyName,
                                    hasThumbnail: contact.hasThumbnail,
                                    phoneNumber: phoneNumber,
                                    status: "AVAILABLE",
                                    statusMessage: "Available"
                                }, UpdateMode.Modified);
                            });
                        })
                    })
            }).then(() => console.log("Contacts synced!"));

        Contacts.checkPermission();
    }

    onPressContact(phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`)
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
                        description={item["statusMessage"] || "Available"}
                        onPress={() => this.onPressContact(item["phoneNumber"])}
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
