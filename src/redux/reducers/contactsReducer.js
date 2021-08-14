const CONTACTS_INITIAL_STATE = {
    contacts: [],
    selectedContact: null
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
        case "SET_SELECTED_CONTACT":
            return {
                ...state,
                selectedContact: action.payload
            }
        default:
            return state
    }
};

export {
    CONTACTS_INITIAL_STATE,
    contactsReducer
}