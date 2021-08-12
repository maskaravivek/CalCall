import firestore from '@react-native-firebase/firestore';
import realm from '../realm/realm'
import RNCalendarEvents from "react-native-calendar-events";
import { UpdateMode } from "realm";

async function syncRegisteredContactEvents() {
    const contacts = realm.objects("Contact");
    console.log(contacts)
    const registeredContacts = contacts.filtered("uid != null")
    const uids = registeredContacts.map((contact) => contact.uid);
    uids.forEach(uid => getUserEvents(uid))
}

async function getUserEvents(uid) {
    console.log('fetching user events', uid)
    firestore().collection('Users')
        .doc(uid)
        .collection('userEvents')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                realm.write(() => {
                    realm.create("Event", {
                        _id: doc.id,
                        uid: uid,
                        title: docData.title,
                        availability: docData.availability,
                        startDate: docData.startDate,
                        endDate: docData.endDate,
                    }, UpdateMode.Modified);
                });
            });
        }).then(() => console.log("User event synced:", uid))
}

function syncCalendarEvents(calendars, uid) {
    calendars.forEach(calendar => {
        const startDate = new Date()
        var endDate = addDays(startDate, 7)
        RNCalendarEvents.fetchAllEvents(startDate.toISOString(), endDate.toISOString(), [calendar.id])
            .then(events => {
                events.forEach(event => {
                    const eventObj = {
                        "title": event.title,
                        "availability": event.availability,
                        "startDate": getTimeInEpoch(event.startDate),
                        "endDate": getTimeInEpoch(event.endDate)
                    }
                    saveEvent(uid, event.id, eventObj)
                })
            }).then(() => console.log('calendar synced', calendar.id));
    })
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function getTimeInEpoch(isoDateString) {
    return Date.parse(isoDateString);
}

function saveEvent(uid, eventId, event) {
    firestore().collection('Users')
        .doc(uid)
        .collection('userEvents')
        .doc(eventId)
        .set(event);
}

async function deleteOldEvents(uid) {
    const usersQuerySnapshot = await firestore().collection('Users')
        .doc(uid)
        .collection('userEvents')
        .where('endDate', '<', Date.now())
        .get()
    const batch = firestore().batch();

    usersQuerySnapshot.forEach(documentSnapshot => {
        batch.delete(documentSnapshot.ref);
    });

    return batch.commit();
}

export {
    deleteOldEvents,
    syncCalendarEvents,
    syncRegisteredContactEvents
}