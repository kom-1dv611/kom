import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";
import busy from "./room-state";

const test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom,
    busyRoom: busy
});

export default test;