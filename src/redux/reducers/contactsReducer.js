const INITIAL_STATE = {
    contacts: [],
};


export default contactsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "SYNC_CONTACTS":
            return {
                contacts: action.payload
            }
        default:
            return state
    }
};