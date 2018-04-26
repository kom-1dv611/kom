import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";
import busy from "./room-state";
import filter from "./filter-select";

const test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom,
    busyRoom: busy,
    filterSelect: filter
});

export default test;