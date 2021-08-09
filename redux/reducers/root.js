import { combineReducers } from 'redux';

import contactsReducer from './contactsReducer'
import calendarReducer from './calendarReducer'
import userReducer from './userReducer'

export default rootReducer = combineReducers({
  contacts: contactsReducer,
  calendars: calendarReducer,
  user: userReducer,
});