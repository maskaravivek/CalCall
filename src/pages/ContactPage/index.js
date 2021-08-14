import React from "react";
import {
    Text,
    SafeAreaView,
    StyleSheet,
    View,
    Share,
    Alert,
    TouchableOpacity
} from "react-native";
import { Linking } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import setUser from '../../redux/actions/userAction'
import { Icon, Badge, Button } from 'react-native-elements';
import Avatar from "../../components/avatar";
import { getAvatarInitials, getDescriptionElement, getStatusBadge } from '../../utils/utils'
import SendSMS from 'react-native-sms'

function getIOSActions(phoneNumber) {
    return {
        "call": {
            "type": "CALL",
            "key": "call",
            "icon": "call-outline",
            "text": "Call",
            "url": `tel://${phoneNumber}`
        },
        "whatsapp": {
            "type": "CALL_OR_MESSAGE",
            "key": "whatsapp",
            "icon": "logo-whatsapp",
            "text": "Whatsapp",
            "url": `whatsapp://send?phone=${phoneNumber}`
        },
        "ft-video": {
            "type": "CALL",
            "key": "ft-video",
            "icon": "videocam-outline",
            "text": "Facetime",
            "url": `facetime://${phoneNumber}`
        },
        "ft-audio": {
            "type": "CALL",
            "key": "ft-audio",
            "icon": "mic-outline",
            "text": "FT Audio",
            "url": `facetime-audio://${phoneNumber}`
        }
    }
}
class ContactPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalVisisble: false
        };
    }

    async componentDidMount() {
        this.props.navigation.setOptions({
            title: `${this.props.route.params.givenName} ${this.props.route.params.familyName}`
        })
    }

    getCallActionsIOS(status, statusValidity, firstName, phoneNumber) {
        const actions = getIOSActions(phoneNumber)
        let date = new Date(statusValidity)
        let time = date.toLocaleTimeString([], { timeStyle: 'short' })

        return Object.keys(actions)
            .map(function (key) {
                return actions[key];
            }).map(value => <TouchableOpacity key={value["key"]} onPress={() => {
                if ((status === "IN_MEETING" && value["type"] === "CALL")) {
                    Alert.alert(
                        "Do you really want to call?",
                        `${firstName} is in a meeting till ${time}. If its not urgent, send a message instead`,
                        [
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                            },
                            { text: "Send message", onPress: () => this.sendMessage(phoneNumber) },
                            { text: "Call anyway", onPress: () => Linking.openURL(value["url"]) }
                        ]
                    );

                } else {
                    Linking.openURL(value["url"])
                }
            }}>
                <View style={styles.cardView}>
                    <Icon name={value["icon"]} color='#FF8E9E' type='ionicon'></Icon>
                    <Text style={styles.cardText}>{value["text"]}</Text>
                </View>
            </TouchableOpacity>);
    }

    async onShare() {
        try {
            const result = await Share.share({
                title: 'CalCall',
                message: 'Hey there! Install CalCall so that I know when you are busy and avoid calling you during meetings!',
                url: 'https://apps.apple.com/us/app/calcall/id1580547117'
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    sendMessage(phoneNumber) {
        SendSMS.send({
            recipients: [phoneNumber],
            allowAndroidSendWithoutReadPermission: true
        }, (completed, cancelled, error) => {
            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
        });
    }

    render() {
        let item = this.props.route.params

        return (
            <SafeAreaView style={styles.container}>
                <View>
                    <Avatar
                        placeholder={getAvatarInitials(
                            `${item["givenName"]} ${item["familyName"]}`
                        )}
                        width={80}
                        height={80}
                    />

                    <Badge
                        status={getStatusBadge(item["status"])}
                        badgeStyle={styles.statusBadge}
                        containerStyle={{ position: 'absolute', top: 5, right: 5 }}
                    />
                </View>
                <Text style={styles.title}>{`${item.givenName} ${item.familyName}`}</Text>
                {
                    getDescriptionElement(item["status"], item["statusValidity"])
                }
                <View style={styles.cards}>
                    <TouchableOpacity onPress={() => {
                        this.sendMessage(item["phoneNumber"])
                    }}>
                        <View style={styles.cardView}>
                            <Icon name="chatbubble-outline" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>Message</Text>
                        </View>
                    </TouchableOpacity>
                    {
                        this.getCallActionsIOS(item["status"], item["statusValidity"], item["givenName"], item["phoneNumber"])
                    }
                </View>

                <View style={styles.fullCardView}>
                    <Text style={styles.mobileTitle}>mobile number</Text>
                    <Text style={styles.mobileNumber}>{item["phoneNumber"]}</Text>
                </View>

                {
                    item["uid"] == null
                    && <View style={styles.inviteView}>
                        <Text>Invite {item["givenName"]} to use the app!</Text>
                        <Button title="Invite"
                            loading={this.state.loading}
                            buttonStyle={styles.button}
                            onPress={() => this.onShare()}
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
        marginTop: 40,
        paddingTop: 22,
        alignItems: 'center',
    },
    statusBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "white"
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    button: {
        borderRadius: 20,
        marginTop: 18,
        alignContent: "center",
        alignItems: "center",
        backgroundColor: '#FF8E9E'
    },
    buttonText: {
        textAlign: 'center',
        padding: 12,
        fontSize: 20,
        color: 'black'
    },
    title: {
        fontSize: 24,
        marginTop: 18,
        marginBottom: 4,
    },
    cards: {
        flexDirection: "row",
        marginTop: 24,
    },
    cardText: {
        marginTop: 8,
        fontSize: 8,
        textAlign: "center",
        color: '#EA5B70'
    },
    cardView: {
        width: 60,
        height: 60,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: '#FF8E9E',
        borderRadius: 5,
        padding: 8,
        margin: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    fullCardView: {
        height: 72,
        width: "90%",
        backgroundColor: "white",
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#FF8E9E',
        padding: 8,
        paddingBottom: 16,
        margin: 12,
        marginTop: 48,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    inviteView: {
        marginTop: 64
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
        marginLeft: 36,
        marginRight: 36
    },
    mobileTitle: {
        fontSize: 18,
        textAlign: "left",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginBottom: 4,
        marginLeft: 4,
    },
    mobileNumber: {
        fontSize: 16,
        color: "#EA5B70",
        textAlign: "left",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginTop: 8,
        marginLeft: 4,
        marginBottom: 4,
    },
    input: {
        height: 40,
        margin: 12,
        width: 300,
        borderWidth: 1,
        padding: 10,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modelContentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
    modalButtonsView: {
        flexDirection: "row"
    }
});

const mapStateToProps = (state) => {
    const { user } = state
    return { user }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setUser,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ContactPage);