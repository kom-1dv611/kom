import {combineReducers} from "redux";
import setup from "./setup";
import setupRoom from "./room-select";

const test = combineReducers({
    setupSelect: setup,
    setupRoom: setupRoom
});

export default test;