import { createStore } from 'redux';

import rootReducer from './reducers';
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CALENDAR_INITIAL_STATE } from './reducers/calendarReducer'
import { CONTACTS_INITIAL_STATE } from './reducers/contactsReducer'
import { USER_INITIAL_STATE } from './reducers/userReducer'

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(persistedReducer, {
    "contacts": CONTACTS_INITIAL_STATE,
    "calendars": CALENDAR_INITIAL_STATE,
    "user": USER_INITIAL_STATE
}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
let persistor = persistStore(store)

export {
    store,
    persistor
}