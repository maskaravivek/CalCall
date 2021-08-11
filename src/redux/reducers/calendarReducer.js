const INITIAL_STATE = {
    calendars: [],
    syncEventTitle: true,
    shareWithContacts: true,
};


export default calendarsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "SET_CALENDARS":
            return {
                ...state,
                calendars: action.payload
            }
        case "SYNC_EVENT_TITLE":
            return {
                ...state,
                syncEventTitle: action.payload
            }
        case "SHARE_WITH_CONTACTS":
            return {
                ...state,
                shareWithContacts: action.payload
            }
        default:
            return state
    }
};