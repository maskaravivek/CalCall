const INITIAL_STATE = {
    calendars: [],
};


export default calendarsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "SET_CALENDARS":
            return {
                calendars: action.payload
            }
        default:
            return state
    }
};