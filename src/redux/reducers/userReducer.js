const INITIAL_STATE = {
    user: null,
};


export default userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "SET_USER":
            return {
                user: action.payload
            }
        default:
            return state
    }
};