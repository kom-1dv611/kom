import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";
import busy from "./room-state";
import filter from "./filter-select";
import booked from "./submit";
import schedule from "./schedule-select";
import cancel from "./cancel-booking";

const test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom,
    busyRoom: busy,
    filterSelect: filter,
    submit: booked,
    cancelBookinng: cancel,
    loadedSchedule: schedule
});

export default test;