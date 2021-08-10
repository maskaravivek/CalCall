import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    FlatList,
    Text,
    View
} from "react-native";
import ListItem from "../../components/listitem";
import Avatar from "../../components/avatar";
import { Linking } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import syncContacts from '../../redux/actions/contactsAction'
import getAvatarInitials from '../../utils/utils'
import realm from '../../realm/realm'

class FavoritesPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            contacts: []
        };
    }

    async componentDidMount() {
        this._navListener = this.props.navigation.addListener('focus', () => {
            this.updateContactListOnUI()
        });
    }

    updateContactListOnUI() {
        const contacts = realm.objects("Contact")
        let favoriteContacts = contacts.filtered("favorite == true")

        favoriteContacts = favoriteContacts.map(result => {
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
        this.showSortedContacts(favoriteContacts)
    }

    showSortedContacts(contacts) {
        contacts.sort((a, b) => {
            return a.givenName.localeCompare(b.givenName)
        });
        this.setState({
            contacts: contacts
        })
    }

    onPressContact(phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`)
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
                            onPress={() => this.onPressContact(item["phoneNumber"])}
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
        syncContacts,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesPage);