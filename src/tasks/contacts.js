import firestore from '@react-native-firebase/firestore';
import realm from '../realm/realm'
import Contacts from "react-native-contacts";
import { UpdateMode } from "realm";
import { selectContactPhone } from 'react-native-select-contact';

const UPCOMING_MEETING_TIME_INTERVAL = 100 * 15 * 60000;

function selectContactAndSave() {
    return selectContactPhone()
        .then(selection => {
            if (!selection) {
                return null;
            }

            let { contact, selectedPhone } = selection;
            contact["favorite"] = true
            console.log(`Selected ${selectedPhone.type} phone number ${selectedPhone.number} from ${contact.name}`);

            return getPhoneNumberUidMap()
                .then(phoneNumberUidMap => {
                    addContact(contact, contact.phones[0].number, phoneNumberUidMap);
                }).then(() => {
                    return getSortedContacts();
                })
        });
}

async function syncDeviceContacts() {
    return Contacts.getAll()
        .then(contacts => {
            return contacts
                .filter(c => c.phoneNumbers.length > 0 && c.givenName.length > 0)
                .map(c => {
                    return {
                        "givenName": c["givenName"] || "",
                        "familyName": c["familyName"] || "",
                        "recordId": c["recordId"],
                        "phoneNumbers": c["phoneNumbers"],
                        "favorite": false
                    }
                })
        }).then(contacts => {
            getPhoneNumberUidMap()
                .then(phoneNumberUidMap => {
                    contacts.forEach(contact => {
                        addContact(contact, contact.phoneNumbers[0].number, phoneNumberUidMap);
                    })
                })
        })
}

function addContact(contact, phoneNumber, phoneNumberUidMap) {
    let uid = phoneNumberUidMap[cleanedPhoneNumber(phoneNumber)];
    realm.write(() => {
        realm.create("Contact", {
            recordId: contact.recordId,
            uid: uid,
            givenName: contact.givenName,
            familyName: contact.familyName,
            phoneNumber: phoneNumber,
            favorite: contact.favorite
        }, UpdateMode.Modified);
    });
}

function removeContactFromDB(recordId) {
    const contacts = realm.objects("Contact");
    const matchedContact = contacts.filtered(`recordId == '${recordId}'`)

    matchedContact.forEach(contact => {
        realm.write(() => {
            realm.delete(contact);
        });
    })
}

function cleanedPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/[^\d]/g, '').slice(-10);
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
        .filtered(`(startDate > ${Date.now()} && startDate <= ${Date.now() + UPCOMING_MEETING_TIME_INTERVAL}) 
    || (startDate < ${Date.now()} && endDate > ${Date.now()})`)

    console.log('filtered', filteredEvents)

    let userStatusMap = {}
    filteredEvents.forEach(event => {
        if (event.startDate < Date.now() && event.endDate > Date.now()) {
            userStatusMap[event.uid] = {
                "status": "IN_MEETING",
                "statusValidity": event.endDate
            }
        } else if (event.startDate <= (Date.now() + UPCOMING_MEETING_TIME_INTERVAL)) {
            if (!(event.uid in userStatusMap)) {
                userStatusMap[event.uid] = {
                    "status": "UPCOMING_MEETING",
                    "statusValidity": event.startDate
                }
            }
        }
    })

    for (const [uid, value] of Object.entries(userStatusMap)) {
        updateContactStatus(uid, value["status"], value["statusValidity"])
    }
}

function updateContactStatus(uid, status, statusValidity) {
    const contacts = realm.objects("Contact");
    const matchedContact = contacts.filtered(`uid == '${uid}'`)

    matchedContact.forEach(contact => {
        console.log('updating status for uid', uid, status, statusValidity)
        realm.write(() => {
            contact.status = status
            contact.statusValidity = statusValidity
        });
    })

    const newcontact = realm.objects("Contact");
    console.log(newcontact)
}

function getSortedContacts() {
    return realm.objects("Contact")
        .map(result => {
            return {
                recordId: result.recordId,
                uid: result.uid,
                thumbnailPath: result.thumbnailPath,
                givenName: result.givenName,
                familyName: result.familyName,
                hasThumbnail: result.hasThumbnail,
                phoneNumber: result.phoneNumber,
                status: result.status,
                statusValidity: result.statusValidity
            }
        }).sort(sortContacts)
}

function sortContacts(a, b) {
    return a.givenName.localeCompare(b.givenName)
}

export {
    updateRegisteredUserStatus,
    syncDeviceContacts,
    getSortedContacts,
    selectContactAndSave,
    removeContactFromDB,
}