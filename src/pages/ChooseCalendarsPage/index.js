import React, { Component } from "react";
import {
    SafeAreaView,
    StyleSheet,
    FlatList,
    View,
} from "react-native";

import RNCalendarEvents from "react-native-calendar-events";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCalendars } from '../../redux/actions/calendarAction'
import { setIsSignedIn } from '../../redux/actions/userAction'
import { CheckBox, Button } from 'react-native-elements';

class ChooseCalendars extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    async componentDidMount() {
        this.checkPermissionsAndSyncCalendar()
    }

    checkPermissionsAndSyncCalendar() {
        RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    this.fetchCalendars();
                } else {
                    RNCalendarEvents.requestPermissions(readOnly = true).then(result => {
                        if (result === "authorized") {
                            this.fetchCalendars();
                        } else {
                            console.log("Permission denied", result)
                        }
                    });
                }
            });
    }

    fetchCalendars() {
        RNCalendarEvents.findCalendars().then(calendars => {

            let allCalendars = calendars.map(c => {
                return {
                    "id": c["id"],
                    "title": c["title"],
                    "selected": this.props.calendars.calendars.some((cal) => cal["id"] === c["id"] && cal["selected"])
                };
            });
            this.setState({ loading: false });
            this.props.setCalendars(allCalendars);
        });
    }

    updateSavedCalendars(id, isSelected) {
        const idx = this.props.calendars.calendars.findIndex((c => c.id == id));

        let calendars = this.props.calendars.calendars
        calendars[idx].selected = !isSelected
        this.props.setCalendars(calendars)
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.props.calendars.calendars}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <CheckBox checkedColor="#FF8E9E"
                        containerStyle={styles.checkboxContainerStyle}
                        checked={item.selected}
                        onPress={() => this.updateSavedCalendars(item.id, item.selected)}
                        title={item.title} />
                    }
                />
                {this.props.route.params && this.props.route.params.onboarding && <Button title="Next"
                    buttonStyle={styles.button}
                    onPress={() => {
                        this.props.setIsSignedIn(true)
                        console.log(this.props.user)
                    }}
                />}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22,
    },
    title: {
        fontSize: 32,
    },
    checkboxContainerStyle: {
        backgroundColor: '#00000000',
        flexDirection: 'row',
        borderWidth: 0,
        alignItems: "flex-start",
        alignSelf: "flex-start",
        marginLeft: 24,
    },
    button: {
        width: 300,
        marginTop: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
        backgroundColor: '#FF8E9E',
    },
});

const mapStateToProps = (state) => {
    const { calendars, user } = state
    return { calendars, user }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setCalendars,
        setIsSignedIn,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ChooseCalendars);
