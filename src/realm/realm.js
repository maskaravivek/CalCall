import Realm from "realm";

class Event extends Realm.Object { }
Event.schema = {
    name: "Event",
    properties: {
        _id: "string",
        uid: "string",
        title: "string",
        availability: "string",
        startDate: "int",
        endDate: "int",
    },
    primaryKey: "_id",
};

class Contact extends Realm.Object { }
Contact.schema = {
    name: "Contact",
    properties: {
        recordID: "string",
        uid: "string?",
        thumbnailPath: "string",
        givenName: "string",
        familyName: "string",
        hasThumbnail: "bool",
        phoneNumber: "string",
        status: "string",
        statusMessage: "string",
        favorite: "bool"
    },
    primaryKey: "recordID",
};

export default new Realm({ schema: [Event, Contact] });