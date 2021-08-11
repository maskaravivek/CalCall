import { combineReducers } from 'redux';

import { contactsReducer } from './contactsReducer'
import { calendarsReducer } from './calendarReducer'
import { userReducer } from './userReducer'

export default rootReducer = combineReducers({
  contacts: contactsReducer,
  calendars: calendarsReducer,
  user: userReducer,
});