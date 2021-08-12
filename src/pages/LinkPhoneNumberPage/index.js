import React from "react";
import {
    Text,
    SafeAreaView,
    StyleSheet,
    TextInput,
    Image
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setUserUid, setUserPhoneNumber } from '../../redux/actions/userAction'
import firestore from '@react-native-firebase/firestore';
import { Button } from 'react-native-elements';
import uuid from 'react-native-uuid';
class LinkPhoneNumberPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: null
        };
        this.linkPhoneNumber = this.linkPhoneNumber.bind(this)
    }

    async componentDidMount() {
        if (this.props.user.uid == null) {
            const uid = uuid.v4();
            this.props.setUserUid(uid)
        }
        if (this.props.user.phoneNumber !== null) {
            this.setState({
                phoneNumber: this.props.user.phoneNumber
            })
        }
    }

    linkPhoneNumber() {
        firestore().collection('Users')
            .doc(this.props.user.uid)
            .set({
                phoneNumber: this.state.phoneNumber
            }).then(() => {
                console.log('Phone Number linked!');
                this.props.setUserPhoneNumber(this.state.phoneNumber)
                if(this.props.route.params && !this.props.route.params.onboarding) {
                    this.props.navigation.goBack()
                } else {
                    this.props.navigation.navigate('ConfigureCalendar')
                }
            });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Image source={require('../../assets/phone-call.png')}></Image>
                <Text style={styles.title}>Your primary phone number</Text>
                <Text style={styles.subtitle}>We will link your calendar events to your primary phone number so that your friends can find out when you are busy.</Text>
                <TextInput
                    keyboardType="phone-pad"
                    style={styles.input}
                    placeholder="Enter phone number"
                    onChangeText={text =>
                        this.setState({
                            phoneNumber: text
                        })
                    }
                    value={this.state.phoneNumber}
                />
                <Button title="Link"
                    buttonStyle={styles.button}
                    onPress={this.linkPhoneNumber}
                />
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
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    button: {
        width: 300,
        backgroundColor: '#FF8E9E'
    },
    buttonText: {
        textAlign: 'center',
        padding: 12,
        fontSize: 20,
        color: 'black'
    },
    title: {
        fontSize: 18,
        textAlign: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 56,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 12,
        textAlign: "justify",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 12,
        marginLeft: 36,
        marginRight: 36
    },
    input: {
        height: 40,
        margin: 12,
        width: 300,
        borderWidth: 1,
        padding: 10,
        borderRadius: 4,
    },
});

const mapStateToProps = (state) => {
    const { user } = state
    return { user }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setUserUid,
        setUserPhoneNumber
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(LinkPhoneNumberPage);