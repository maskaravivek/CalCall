import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    FlatList,
    Text,
    RefreshControl,
    View
} from "react-native";
import ListItem from "../../components/listitem";
import Avatar from "../../components/avatar";
import { Linking } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { removeContact, syncContacts, setSelectedContact } from '../../redux/actions/contactsAction'
import { getAvatarInitials, getDescriptionElement, getStatusBadge } from '../../utils/utils'
import { Icon, Badge } from 'react-native-elements'
import { removeContactFromDB } from '../../tasks/contacts'
import { getSortedContacts } from '../../tasks/contacts'
import { sync } from '../../tasks/tasks'
import RNCalendarEvents from "react-native-calendar-events";
class FavoritesPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    async componentDidMount() {
        this.refreshUI();
        this.syncAndRefresh();
    }

    async syncAndRefresh() {
        this.performSync().then(() => this.refreshUI())
    }

    refreshUI() {
        console.log("Refreshing UI")
        const contacts = getSortedContacts()
        this.props.syncContacts(contacts)
    }

    performSync() {
        console.log('performing sync for uid', this.props.user.uid)
        return RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    return sync(this.props.user.uid, this.props.calendars.calendars)
                } else {
                    RNCalendarEvents.requestPermissions(readOnly = true);
                }
            });
    }

    onPressContact(phoneNumber) {
        Linking.openURL(`facetime-audio://+1${phoneNumber}`)
    }

    deleteContact(item) {
        removeContactFromDB(item["recordId"])
        this.props.removeContact(item)
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.props.contacts.contacts && this.props.contacts.contacts.length > 0 ? (<FlatList
                        data={this.props.contacts.contacts}
                        keyExtractor={item => item.recordId}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={() => this.syncAndRefresh()}
                            />
                        }
                        renderItem={({ item }) => <ListItem
                            leftElement={
                                <View>
                                    <Avatar
                                        placeholder={getAvatarInitials(
                                            `${item["givenName"]} ${item["familyName"]}`
                                        )}
                                        width={40}
                                        height={40}
                                    />

                                    <Badge
                                        status={getStatusBadge(item["status"])}
                                        badgeStyle={styles.statusBadge}
                                        containerStyle={{ position: 'absolute', top: 3, right: 3 }}
                                    />
                                </View>

                            }
                            key={item["recordId"]}
                            title={`${item["givenName"]} ${item["familyName"]}`}
                            description={getDescriptionElement(item["status"], item["statusValidity"])}
                            rightElement={<Icon onPress={() => this.onPressContact(item["phoneNumber"])} name="call"></Icon>}
                            onPress={() => {
                                this.props.setSelectedContact(item)
                                this.props.navigation.navigate('Contact', item)
                            }}
                            onDelete={() => this.deleteContact(item)}
                        />
                        }
                    />) :
                        <View style={styles.emptyText}>
                            <Text>No favorites added!</Text>
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

const mapStateToProps = (state) => {
    const { contacts, calendars, user } = state
    return { contacts, calendars, user }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        removeContact,
        syncContacts,
        setSelectedContact,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesPage);