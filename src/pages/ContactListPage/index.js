import React from "react";
import {
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    StyleSheet,
    FlatList,
    View} from "react-native";
import Contacts from "react-native-contacts";

import ListItem from "../../components/listitem";
import Avatar from "../../components/avatar";
import RNCalendarEvents from "react-native-calendar-events";
import { connect } from 'react-redux';
import realm from '../../realm/realm'
import getAvatarInitials from '../../utils/utils'
import { deleteOldEvents, syncCalendarEvents, syncRegisteredContactEvents } from '../../tasks/events'
import { syncDeviceContacts, updateRegisteredUserStatus } from '../../tasks/contacts'
import { Button } from 'react-native-elements';

class ContactList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            contacts: []
        };

        Contacts.iosEnableNotesUsage(false);
        this.showSortedContacts = this.showSortedContacts.bind(this)
    }

    async componentDidMount() {
        this.syncCalendar()
        await syncRegisteredContactEvents()
        await updateRegisteredUserStatus()
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

    syncCalendar() {
        deleteOldEvents(this.props.user.uid)
        RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    syncCalendarEvents(this.props.calendars.calendars, this.props.user.uid)
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
            this.loadContacts();
        }
    }

    loadContacts() {
        console.log("Syncing contacts...")
        this.setState({
            loading: true
        })

        syncDeviceContacts().then(() => {
            console.log("Contacts synced!")
            this.setState({
                loading: false
            })
        })
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
                {
                    this.state.contacts.length > 0 ? (<FlatList
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
                    />) : <View style={styles.emptyText}>
                        <Button title="Sync"
                            loading={this.state.loading}
                            buttonStyle={styles.button}
                            onPress={() => this.syncContacts()}
                        />
                    </View>
                }

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
    emptyText: {
        textAlign: 'center',
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center'
    },
    button: {
        width: 100,
        borderRadius: 20,
        marginTop: 100,
        backgroundColor: '#FF8E9E'
    },
});

const mapStateToProps = (state) => {
    const { calendars, user } = state
    return { calendars, user }
};

export default connect(mapStateToProps)(ContactList);
