
import PushNotification from "react-native-push-notification";
import uuid from 'react-native-uuid';
import PushNotificationIOS from "@react-native-community/push-notification-ios";

function sendNotificationWhenUserGetsFree(contact) {
    if (!(contact.status === "IN_MEETING")) {
        return false
    }
    const date = new Date(contact.statusValidity);
    const notificationId = uuid.v4();
    if (Platform.OS === "android") {
        PushNotification.localNotificationSchedule({
            id: `${notificationId}`,
            message: `${contact.givenName} is now available for a call`,
            date: date,
            tag: `${notificationId}`,
            allowWhileIdle: false,
            userInfo: contact
        });
    } else {
        PushNotificationIOS.addNotificationRequest({
            id: `${notificationId}`,
            body: `${contact.givenName} is now available for a call`,
            fireDate: date,
            userInfo: contact
        });
    }

    console.log('Notification scheduled for', date.toLocaleTimeString())
    return true
}

export {
    sendNotificationWhenUserGetsFree
}