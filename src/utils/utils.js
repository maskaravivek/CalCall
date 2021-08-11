import React from "react";
import {
    View,
    Text,
    StyleSheet
} from "react-native";
import TimeAgo from 'react-native-timeago';

function getAvatarInitials(textString) {
    if (!textString) return "";
    const text = textString.trim();
    const textSplit = text.split(" ");
    if (textSplit.length <= 1) return text.toUpperCase().charAt(0);
    const initials =
        textSplit[0].toUpperCase().charAt(0) + textSplit[textSplit.length - 1].toUpperCase().charAt(0);
    return initials;
};

function getDescriptionElement(status, statusMessage) {
    if (status === "AVAILABLE") {
        return <Text>{statusMessage}</Text>;
    } else if (status === "IN_MEETING") {
        return <View style={styles.viewContainer}><Text style={styles.text}>In a meeting till </Text><TimeAgo time={parseInt(statusMessage)} /></View>
    } else if (status === "IN_MEETING") {
        return <View style={styles.viewContainer}><Text style={styles.text}>Has a meeting in </Text><TimeAgo time={parseInt(statusMessage)} /></View>
    } else {
        return <View />
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
    getDescriptionElement
}