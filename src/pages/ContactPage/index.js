import React from "react";
import {
    Text,
    SafeAreaView,
    StyleSheet,
    View,
    TouchableOpacity
} from "react-native";
import { Linking } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import setUser from '../../redux/actions/userAction'
import { Icon, Badge } from 'react-native-elements';
import Avatar from "../../components/avatar";
import { getAvatarInitials, getDescriptionElement } from '../../utils/utils'
import SendSMS from 'react-native-sms'

class ContactPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: null
        };
    }

    async componentDidMount() {
        this.props.navigation.setOptions({
            title: `${this.props.route.params.givenName} ${this.props.route.params.familyName}`
        })
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
                        status={item["status"] === "AVAILABLE" ? "success" : "error"}
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
                        SendSMS.send({
                            recipients: [item["phoneNumber"]],
                            allowAndroidSendWithoutReadPermission: true
                        }, (completed, cancelled, error) => {
                            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
                        });
                    }}>
                        <View style={styles.cardView}>
                            <Icon name="chatbubble-outline" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>Message</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel://${item["phoneNumber"]}`)}>
                        <View style={styles.cardView}>
                            <Icon name="call-outline" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>Call</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        console.log(item["phoneNumber"])
                        Linking.openURL(`whatsapp://send?phone=${item["phoneNumber"]}`)
                    }}>
                        <View style={styles.cardView}>
                            <Icon name="logo-whatsapp" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>WhatsApp</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`facetime://${item["phoneNumber"]}`)}>
                        <View style={styles.cardView}>
                            <Icon name="videocam-outline" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>Facetime</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`facetime-audio://${item["phoneNumber"]}`)}>
                        <View style={styles.cardView}>
                            <Icon name="mic-outline" color='#FF8E9E' type='ionicon'></Icon>
                            <Text style={styles.cardText}>FT Audio</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.fullCardView}>
                    <Text style={styles.mobileTitle}>mobile number</Text>
                    <Text style={styles.mobileNumber}>{item["phoneNumber"]}</Text>
                </View>
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
        width: 300
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