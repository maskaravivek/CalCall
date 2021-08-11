import React from "react";
import {
    Text,
    SafeAreaView,
    StyleSheet,
    Image
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSyncEventTitle, setShareWithContacts } from '../../redux/actions/calendarAction'
import { Button, CheckBox } from 'react-native-elements';

class LinkCalendarsPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    async componentDidMount() {

    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Image source={require('../../assets/schedule.png')}></Image>
                <Text style={styles.title}>Calendar Settings</Text>
                <Text style={styles.subtitle}>We will sync your availability from your calendar events and link it to your phone number. You are in full control of your data and can customize what get synced and who can access it.</Text>
                <CheckBox checkedColor="#FF8E9E" containerStyle={styles.checkboxContainerStyle} checked={this.props.calendars.syncEventTitle}
                    onPress={() => {
                        this.props.setSyncEventTitle(!this.props.calendars.syncEventTitle)
                    }}
                    title="Sync event title" />
                <CheckBox checkedColor="#FF8E9E" containerStyle={styles.checkboxContainerStyle} checked={this.props.calendars.shareWithContacts}
                    onPress={() => {
                        this.props.setShareWithContacts(!this.props.calendars.shareWithContacts)
                    }}
                    title="Share with contacts" />
                <Button title="Next"
                    buttonStyle={styles.button}
                    onPress={() => this.props.navigation.navigate('Calendars', {
                        onboarding: true
                    })}
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
    checkboxContainerStyle: {
        backgroundColor: '#00000000',
        flexDirection: 'row',
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginLeft: 24,
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    button: {
        width: 300,
        marginTop: 24,
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
    const { calendars } = state
    return { calendars }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setShareWithContacts,
        setSyncEventTitle,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(LinkCalendarsPage);