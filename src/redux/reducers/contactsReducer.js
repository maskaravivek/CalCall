const CONTACTS_INITIAL_STATE = {
    contacts: [],
};


function contactsReducer(state = CONTACTS_INITIAL_STATE, action) {
    switch (action.type) {
        case "SYNC_CONTACTS":
            return {
                contacts: action.payload
            }
        default:
            return state
    }
};

export {
    CONTACTS_INITIAL_STATE, 
    contactsReducer
}