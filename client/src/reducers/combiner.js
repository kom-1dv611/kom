import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";
import busy from "./room-state";
import booked from "./submit";

const test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom,
    busyRoom: busy,
    submit: booked
});

export default test;