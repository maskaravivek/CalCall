const setCalendars = calendars => (
    {
        type: 'SET_CALENDARS',
        payload: calendars,
    }
);

const setShareWithContacts = isAllowed => (
    {
        type: 'SHARE_WITH_CONTACTS',
        payload: isAllowed,
    }
);

const setSyncEventTitle = isAllowed => (
    {
        type: 'SYNC_EVENT_TITLE',
        payload: isAllowed,
    }
);

export {
    setCalendars,
    setShareWithContacts,
    setSyncEventTitle
}