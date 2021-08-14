import { syncCalendarEvents, syncRegisteredContactEvents } from './events'
import { updateRegisteredUserStatus } from './contacts'
import { store } from '../redux/store'

function sync(uid, calendars) {
    return syncCalendarEvents(calendars, uid)
        .then(() => syncRegisteredContactEvents())
        .then(() => updateRegisteredUserStatus())

}

function backgroundSync() {
    console.log('performing background sync...')
    const state = store.getState()
    sync(state.user.uid, state.calendars.calendars)
}

export {
    sync,
    backgroundSync
}