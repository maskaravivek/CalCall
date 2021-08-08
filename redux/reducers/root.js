import { combineReducers } from 'redux';

import contactsReducer from './contactsReducer'
import calendarReducer from './calendarReducer'

export default rootReducer = combineReducers({
  contacts: contactsReducer,
  calendars: calendarReducer,
});