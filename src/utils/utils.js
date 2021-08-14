import React from "react";
import {
    View,
    Text,
    StyleSheet
} from "react-native";

function getAvatarInitials(textString) {
    if (!textString) return "";
    const text = textString.trim();
    const textSplit = text.split(" ");
    if (textSplit.length <= 1) return text.toUpperCase().charAt(0);
    const initials =
        textSplit[0].toUpperCase().charAt(0) + textSplit[textSplit.length - 1].toUpperCase().charAt(0);
    return initials;
};

function getDescriptionElement(status, statusValidity) {
    let date = new Date(statusValidity)
    let time = date.toLocaleTimeString([], { timeStyle: 'short' })
    if (status === "AVAILABLE") {
        return <Text>Available</Text>;
    } else if (status === "IN_MEETING") {
        return <View style={styles.viewContainer}><Text style={styles.text}>In a meeting till {time}</Text></View>
    } else if (status === "IN_MEETING") {
        return <View style={styles.viewContainer}><Text style={styles.text}>Has a meeting at {time}</Text></View>
    } else {
        return <View />
    }
}

function getStatusBadge(status) {
    if (status === "AVAILABLE") {
        return "success"
    } else if (status === "IN_MEETING") {
        return "error"
    } else {
        return "warning"
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        flexDirection: "row"
    },
    text: {
        fontSize: 14,
    },
});

export {
    getAvatarInitials,
    getDescriptionElement,
    getStatusBadge
}