import React from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Button,
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


import { ScrollView } from "react-native-gesture-handler";

class SignInPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalVisisble: false,
            phoneNumber: null,
            uid: null
        };
        this.linkPhoneNumber = this.linkPhoneNumber.bind(this)
    }

    async componentDidMount() {
        this._configureGoogleSignIn();
        if (await GoogleSignin.isSignedIn() && this.props.user.user.phoneNumber !== undefined) {
            this.props.navigation.navigate('Contacts')
        }
    }

    _configureGoogleSignIn() {
        GoogleSignin.configure({
            webClientId: "427029793980-vto8ufprdpbbfpjufskoq8htep7jtm46.apps.googleusercontent.com",
            offlineAccess: false,
        });
    }

    async onGoogleButtonPress() {
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const user = await auth().signInWithCredential(googleCredential);
        this.checkAndInsertUser(user)
    }

    linkPhoneNumber() {
        firestore().collection('Users')
            .doc(this.state.uid)
            .update({
                phoneNumber: this.state.phoneNumber
            }).then(() => {
                console.log('Phone Number linked!');
                this.setState({
                    isModalVisisble: false
                })
                this.saveUserAndNavigateToHome(this.state.uid)
            });
    }

    checkAndInsertUser(user) {
        const uid = user.user.uid;
        const userDocRef = firestore().collection('Users').doc(uid);

        userDocRef.get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    const userData = docSnapshot.data()
                    return userData.phoneNumber !== undefined;
                } else {
                    userDocRef.set({
                        'displayName': user.user.displayName,
                        'email': user.user.email,
                        'photoURL': user.user.photoURL
                    })
                    return false
                }
            }).then(isPhoneNumberLinked => {
                if (!isPhoneNumberLinked) {
                    this.setState({
                        isModalVisisble: true,
                        uid: uid
                    })
                } else {
                    this.saveUserAndNavigateToHome(uid)
                }
            });
    }

    saveUserAndNavigateToHome(uid) {
        const userDoc = firestore().collection('Users').doc(uid).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    let userData = docSnapshot.data()
                    userData["uid"] = uid
                    this.props.setUser(userData)
                    this.props.navigation.navigate('Contacts')
                } else {
                    console.log("Error occurred!")
                }
            });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Modal isVisible={this.state.isModalVisisble}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modelContentTitle}>Link phone number</Text>
                        <TextInput
                            keyboardType="phone-pad"
                            style={styles.input}
                            onChangeText={text =>
                                this.setState({
                                    phoneNumber: text
                                })
                            }
                            value={this.state.phoneNumber}
                        />
                        <Button title="Link"
                            onPress={this.linkPhoneNumber}
                        />
                    </View>
                </Modal>
                <ScrollView>
                    <TouchableHighlight
                        onPress={() => this.onGoogleButtonPress()}
                        underlayColor="white">
                        <View style={styles.button}>
                            <Icon
                                name='event' /><Text style={styles.buttonText}>Google Sign In</Text>
                        </View>
                    </TouchableHighlight>
                </ScrollView>

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
    input: {
        height: 40,
        margin: 12,
        width: 280,
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

export default connect(mapStateToProps, mapDispatchToProps)(SignInPage);