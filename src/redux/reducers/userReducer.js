const USER_INITIAL_STATE = {
    uid: null,
    phoneNumber: null,
    isSignedIn: false
};


function userReducer(state = USER_INITIAL_STATE, action) {
    switch (action.type) {
        case "SET_USER_UID":
            return {
                ...state,
                uid: action.payload
            }
        case "SET_PHONE_NUMBER":
            return {
                ...state,
                phoneNumber: action.payload
            }
        case "SET_IS_SIGNED_IN":
            return {
                ...state,
                isSignedIn: action.payload
            }
        default:
            return state
    }
};

export {
    USER_INITIAL_STATE,
    userReducer
}