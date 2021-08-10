import React from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableHighlight
} from "react-native";
import { Icon } from 'react-native-elements'
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import setUser from '../../redux/actions/userAction'
import firestore from '@react-native-firebase/firestore';
import Modal from 'react-native-modal';
import { Button } from 'react-native-elements';
import uuid from 'react-native-uuid';


import { ScrollView } from "react-native-gesture-handler";

class LinkPhoneNumberPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: null
        };
        this.linkPhoneNumber = this.linkPhoneNumber.bind(this)
    }

    async componentDidMount() {
        if (this.props.user.user !== null) {
            this.props.navigation.navigate('Home')
        }
    }

    linkPhoneNumber() {
        const uid = uuid.v4();
        firestore().collection('Users')
            .doc(uid)
            .set({
                phoneNumber: this.state.phoneNumber
            }).then(() => {
                console.log('Phone Number linked!');
                this.props.setUser({
                    "uid": uid,
                    "phoneNumber": this.state.phoneNumber
                })
                this.props.navigation.navigate('Home')
            });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
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
        width: 300
    },
    buttonText: {
        textAlign: 'center',
        padding: 12,
        fontSize: 20,
        color: 'black'
    },
    title: {
        fontSize: 18,
        textAlign: "left",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginBottom: 12,
        marginLeft: 36
    },
    subtitle: {
        fontSize: 12,
        textAlign: "left",
        alignItems: "flex-start",
        alignSelf: "flex-start",
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

export default connect(mapStateToProps, mapDispatchToProps)(LinkPhoneNumberPage);