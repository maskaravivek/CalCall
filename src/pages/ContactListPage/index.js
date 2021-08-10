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
import firestore from '@react-native-firebase/firestore';
import realm from '../../realm/realm'
import getAvatarInitials from '../../utils/utils'
import { UpdateMode } from "realm";

class ContactList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            contacts: []
        };

        Contacts.iosEnableNotesUsage(false);
        this.showSortedContacts = this.showSortedContacts.bind(this)
    }

    async componentDidMount() {
        this.syncContacts()
        this.syncCalendar()
        await this.syncRegisteredContactEvents()
        await this.updateRegisteredUserStatus()
        await this.updateContactListOnUI()
    }

    async updateContactListOnUI() {
        const contacts = realm.objects("Contact")
            .map(result => {
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

    showSortedContacts(allContacts) {
        allContacts.sort((a, b) => {
            return a.givenName.localeCompare(b.givenName)
        });

        this.setState({
            contacts: allContacts
        })
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

    async syncRegisteredContactEvents() {
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

        matchedContact.forEach(contact => {
            realm.write(() => {
                contact.status = status
                contact.statusMessage = statusMessage
            });
        })
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
                                    phoneNumber: phoneNumber
                                }, UpdateMode.Modified);
                            });
                        })
                    })
            }).then(() => console.log("Contacts synced!"));

        Contacts.checkPermission();
    }

    onFavoriteContact(recordID) {
        console.log(recordID)
        const contacts = realm.objects("Contact");
        const matchedContact = contacts.filtered(`recordID == '${recordID}'`)
        realm.write(() => {
            matchedContact[0].favorite = true
        });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.state.contacts}
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
                        description={item["statusMessage"]}
                        onPress={() => this.props.navigation.navigate('Contact', item)}
                        onDelete={() => this.onFavoriteContact(item["recordID"])}
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

const mapStateToProps = (state) => {
    const { calendars, user } = state
    return { calendars, user }
};

export default connect(mapStateToProps)(ContactList);
