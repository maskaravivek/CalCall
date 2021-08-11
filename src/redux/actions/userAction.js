const setUserUid = uid => (
    {
        type: 'SET_USER_UID',
        payload: uid,
    }
);

const setUserPhoneNumber = phoneNumber => (
    {
        type: 'SET_PHONE_NUMBER',
        payload: phoneNumber,
    }
);

const setIsSignedIn = isSignedIn => (
    {
        type: 'SET_IS_SIGNED_IN',
        payload: isSignedIn,
    }
);

export {
    setUserUid,
    setUserPhoneNumber,
    setIsSignedIn
}