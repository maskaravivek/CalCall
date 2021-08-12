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
        recordId: "string",
        uid: "string?",
        givenName: "string",
        familyName: "string",
        phoneNumber: "string",
        status: { type: "string", default: "AVAILABLE" },
        statusValidity: { type: "int", default: 0 },
        favorite: { type: "bool", default: false }
    },
    primaryKey: "recordId",
};

export default new Realm({ schema: [Event, Contact] });