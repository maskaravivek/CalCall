const CONTACTS_INITIAL_STATE = {
    contacts: [],
};


function contactsReducer(state = CONTACTS_INITIAL_STATE, action) {
    switch (action.type) {
        case "SYNC_CONTACTS":
            return {
                ...state,
                contacts: action.payload
            }
        case "ADD_CONTACT":
            return {
                ...state,
                contacts: state.contacts.push(action.payload)
            }
        case "REMOVE_CONTACT":
            return {
                ...state,
                contacts: state.contacts.filter(item => item.recordId != action.payload.recordId)
            }
        default:
            return state
    }
};

export {
    CONTACTS_INITIAL_STATE,
    contactsReducer
}