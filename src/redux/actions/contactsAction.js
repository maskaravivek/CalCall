const syncContacts = contacts => (
    {
        type: 'SYNC_CONTACTS',
        payload: contacts,
    }
);

const addContact = contact => (
    {
        type: 'ADD_CONTACT',
        payload: contact,
    }
);

const removeContact = contact => (
    {
        type: 'REMOVE_CONTACT',
        payload: contact,
    }
);

export {
    syncContacts,
    addContact,
    removeContact,
}