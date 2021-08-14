import firestore from '@react-native-firebase/firestore';
import realm from '../realm/realm'
import RNCalendarEvents from "react-native-calendar-events";
import { UpdateMode } from "realm";

const NUMBER_OF_DAYS_TO_ADD = 7

async function syncRegisteredContactEvents() {
    console.log("Syncing registered contact events")
    const contacts = realm.objects("Contact");
    const registeredContacts = contacts.filtered("uid != null")
    let userEventsPromises = registeredContacts
        .map((contact) => getEvents(contact.uid));

    return Promise.all(userEventsPromises)
        .then((values) => {
            return mergeMaps(values);
        }).then((newEvents) => {
            const existingEvents = realm.objects("Event")
                .reduce(function (map, obj) {
                    map[obj._id] = obj;
                    return map;
                }, {})
            return batchUpdateRegisteredContactEvents(newEvents, existingEvents)
        }).then(() => console.log("Synced registered contact events"))
}

function batchUpdateRegisteredContactEvents(newEvents, existingEvents) {
    const newEventIds = Object.keys(newEvents)
    const existingEventIds = Object.keys(existingEvents)
    const deleteIds = eventsToDelete(newEventIds, existingEventIds)
    const updateIds = eventsToUpdate(newEventIds, existingEventIds)
    const addIds = eventsToAdd(newEventIds, existingEventIds)

    const updateAndAddIds = updateIds.concat(addIds)

    realm.write(() => {
        deleteIds.forEach((id) => {
            realm.delete(existingEvents[id])
        })
        updateAndAddIds.forEach((id) => {
            const docData = newEvents[id][0];
            realm.create("Event", {
                _id: id,
                uid: docData.uid,
                title: docData.title,
                availability: docData.availability,
                startDate: docData.startDate,
                endDate: docData.endDate,
            }, UpdateMode.Modified);
        })

    });
}

function mergeMaps(maps) {
    return maps.reduce((acc, el) => {
        for (let key in el) {
            acc[key] = [...acc[key] || [], el[key]];
        };
        return acc;
    }, {})
}

async function getEvents(uid) {
    return firestore().collection('Users')
        .doc(uid)
        .collection('userEvents')
        .get()
        .then(querySnapshot => {
            let events = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data["uid"] = uid;
                events[doc.id] = data
            });
            return events;
        })
}

function userCalendarEvents(calendars) {
    const startDate = new Date()
    const endDate = addDays(startDate, NUMBER_OF_DAYS_TO_ADD)
    let calendarPromises = calendars
        .filter((calendar) => calendar.selected)
        .map((calendar) => {
            return RNCalendarEvents
                .fetchAllEvents(startDate.toISOString(), endDate.toISOString(), [calendar.id])
                .then(events => {
                    return events.map(event => ({
                        "id": event.id,
                        "title": event.title,
                        "availability": event.availability,
                        "startDate": getTimeInEpoch(event.startDate),
                        "endDate": getTimeInEpoch(event.endDate)
                    }))
                })
        })
    return Promise.all(calendarPromises)
}

async function syncCalendarEvents(calendars, uid) {
    console.log("Syncing user calendar events")
    return userCalendarEvents(calendars)
        .then((values) => {
            const events = [].concat.apply([], values);
            return events.reduce(function (map, obj) {
                map[obj.id] = {
                    "title": obj.title,
                    "availability": obj.availability,
                    "startDate": obj.startDate,
                    "endDate": obj.endDate
                };
                return map;
            }, {})
        }).then(async (newEvents) => {
            return getExistingEventIds(uid)
                .then((existingEvents) => batchUpdateUserEvents(newEvents, existingEvents, uid))
        }).then(() => console.log("Synced user calendar events"));

}

async function getExistingEventIds(uid) {
    return await firestore().collection('Users')
        .doc(uid)
        .collection('userEvents')
        .get()
        .then(querySnapshot => {
            let eventIds = [];
            querySnapshot.forEach((doc) => { eventIds.push(doc.id); });
            return eventIds;
        });
}

async function batchUpdateUserEvents(newEvents, existingEventIds, uid) {
    const batch = firestore().batch();

    const newEventIds = Object.keys(newEvents)
    const deleteIds = eventsToDelete(newEventIds, existingEventIds)
    const updateIds = eventsToUpdate(newEventIds, existingEventIds)
    const addIds = eventsToAdd(newEventIds, existingEventIds)

    deleteIds.forEach(id => {
        batch.delete(getEventRef(uid, id))
    })

    updateIds.forEach(id => {
        batch.update(getEventRef(uid, id), newEvents[id])
    })

    addIds.forEach(id => {
        batch.set(getEventRef(uid, id), newEvents[id])
    })

    return batch.commit();
}

function getEventRef(uid, id) {
    return firestore()
        .collection('Users')
        .doc(uid)
        .collection('userEvents')
        .doc(id);
}

function eventsToDelete(newEventIds, existingEventIds) {
    return existingEventIds.filter(id => !newEventIds.includes(id))
}

function eventsToUpdate(newEventIds, existingEventIds) {
    return newEventIds.filter(function (n) { return existingEventIds.indexOf(n) !== -1; })
}

function eventsToAdd(newEventIds, existingEventIds) {
    return newEventIds.filter(id => !existingEventIds.includes(id))
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}

function getTimeInEpoch(isoDateString) {
    return Date.parse(isoDateString);
}

export {
    syncCalendarEvents,
    syncRegisteredContactEvents
}