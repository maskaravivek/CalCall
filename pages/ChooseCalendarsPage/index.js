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
import setCalendars from '../../redux/actions/calendarAction'
import CheckBox from 'react-native-check-box'

type Props = {};

class ChooseCalendars extends Component<Props> {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    async componentDidMount() {
        this.syncCalendar()
    }

    syncCalendar() {
        RNCalendarEvents.checkPermissions(readOnly = true)
            .then(result => {
                if (result === "authorized") {
                    RNCalendarEvents.findCalendars().then(calendars => {

                        let allCalendars = calendars.map(c => {
                            return {
                                "id": c["id"],
                                "title": c["title"],
                                "selected": this.props.calendars.calendars.some((cal) => cal["id"] === c["id"] && cal["selected"])
                            }
                        })
                        // console.log(allCalendars)
                        this.setState({ loading: false });
                        this.props.setCalendars(allCalendars);
                    });
                } else {
                    RNCalendarEvents.requestPermissions(readOnly = true);
                }
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
                    renderItem={({ item }) => <View style={styles.item}>
                        <CheckBox isChecked={item.selected}
                            onClick={() => this.updateSavedCalendars(item.id, item.selected)}
                            rightText={item.title} />
                    </View>
                    }
                />

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
    title: {
        fontSize: 32,
    },
});

const mapStateToProps = (state) => {
    const { calendars } = state
    return { calendars }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        setCalendars,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ChooseCalendars);
