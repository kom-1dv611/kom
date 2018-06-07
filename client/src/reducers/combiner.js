import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";
import busy from "./room-state";
import filter from "./filter-select";
import error from "./error";

let test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom,
    roomState: busy,
    filterSelect: filter,
    error: error
});

export default test;