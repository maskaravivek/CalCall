import firestore from '@react-native-firebase/firestore';
import realm from '../realm/realm'
import Contacts from "react-native-contacts";
import { UpdateMode } from "realm";

async function syncDeviceContacts() {
    return Contacts.getAll()
        .then(contacts => {
            return contacts
                .filter(c => c.phoneNumbers.length > 0 && c.givenName.length > 0)
                .map(c => {
                    return {
                        "hasThumbnail": c["hasThumbnail"],
                        "thumbnailPath": c["thumbnailPath"],
                        "givenName": c["givenName"] || "",
                        "familyName": c["familyName"] || "",
                        "recordID": c["recordID"],
                        "phoneNumbers": c["phoneNumbers"],
                    }
                })
        }).then(contacts => {
            getPhoneNumberUidMap()
                .then(phoneNumberUidMap => {
                    contacts.forEach(contact => {
                        const phoneNumber = contact.phoneNumbers[0].number.replace(/[^\d]/g, '').slice(-10)
                        let uid = phoneNumberUidMap[phoneNumber];
                        realm.write(() => {
                            realm.create("Contact", {
                                recordID: contact.recordID,
                                uid: uid,
                                thumbnailPath: contact.thumbnailPath,
                                givenName: contact.givenName,
                                familyName: contact.familyName,
                                hasThumbnail: contact.hasThumbnail,
                                phoneNumber: phoneNumber
                            }, UpdateMode.Modified);
                        });
                    })
                })
        })
}

async function getPhoneNumberUidMap() {
    return firestore().collection('Users')
        .get()
        .then(querySnapshot => {
            let phoneNumberUidMap = {}
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                phoneNumberUidMap[docData.phoneNumber] = doc.id
            });
            return phoneNumberUidMap;
        })
}

async function updateRegisteredUserStatus() {
    const events = realm.objects("Event");
    const filteredEvents = events
        .filtered(`(startDate > ${Date.now()} && startDate <= ${Date.now() + (100 * 15 * 60000)}) 
    || (startDate < ${Date.now()} && endDate > ${Date.now()})`)

    let userStatusMap = {}
    filteredEvents.forEach(event => {
        if (event.startDate < Date.now() && event.endDate > Date.now()) {
            userStatusMap[event.uid] = {
                "status": "IN_MEETING",
                "statusMessage": "In a meeting"
            }
        } else if (event.startDate <= (Date.now() + (100 * 15 * 60000))) {
            if (!(event.uid in userStatusMap)) {
                userStatusMap[event.uid] = {
                    "status": "UPCOMING_MEETING",
                    "statusMessage": "Has a meeting in 15 minutes"
                }
            }
        }
    })

    for (const [uid, value] of Object.entries(userStatusMap)) {
        updateContactStatus(uid, value["status"], value["statusMessage"])
    }
}

function updateContactStatus(uid, status, statusMessage) {
    const contacts = realm.objects("Contact");
    const matchedContact = contacts.filtered(`uid == '${uid}'`)

    matchedContact.forEach(contact => {
        realm.write(() => {
            contact.status = status
            contact.statusMessage = statusMessage
        });
    })
}

function getSortedContacts() {
    return realm.objects("Contact")
        .map(result => {
            return {
                recordID: result.recordID,
                uid: result.uid,
                thumbnailPath: result.thumbnailPath,
                givenName: result.givenName,
                familyName: result.familyName,
                hasThumbnail: result.hasThumbnail,
                phoneNumber: result.phoneNumber,
                status: result.status,
                statusMessage: result.statusMessage
            }
        }).sort(sortContacts)
}

function sortContacts(a, b) {
    return a.givenName.localeCompare(b.givenName)
}

export {
    updateRegisteredUserStatus,
    syncDeviceContacts,
    getSortedContacts
}