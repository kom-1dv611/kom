export default function(state = null, action) {
    switch(action.type) {
        case "ROOM_BOOKED":
            return action.value;
        default:
            break;
    }
    return state;
}