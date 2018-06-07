
export let GET_ROOM = "GET_ROOM";
export let UPDATE_ROOM = "UPDATE_ROOM";

export default function updateRoom(action, mode) {
    return {type: action, value: mode};
}