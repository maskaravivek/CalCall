import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableHighlight
} from "react-native";
import { Icon } from 'react-native-elements'
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import setUser from '../../redux/actions/userAction'


import { ScrollView } from "react-native-gesture-handler";

class SignInPage extends React.Component {

    async componentDidMount() {
        this._configureGoogleSignIn();
        if (await GoogleSignin.isSignedIn()) {
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
        return auth().signInWithCredential(googleCredential);
    }

    render() {
        const { navigation } = this.props;

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <TouchableHighlight
                        onPress={() => this.onGoogleButtonPress().then((user) => {
                            console.log('Signed in with Google!')
                            this.props.setUser(user)
                            navigation.navigate('Contacts')
                        })}
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

export default connect(mapStateToProps, mapDispatchToProps)(SignInPage);