export default syncContacts = contacts => (
    {
        type: 'SYNC_CONTACTS',
        payload: contacts,
    }
);
