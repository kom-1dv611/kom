
export const GET_ROOM = "GET_ROOM";
export const UPDATE_ROOM = "UPDATE_ROOM";

export default function updateRoom(action, mode) {
    return {type: action, value: mode};
}