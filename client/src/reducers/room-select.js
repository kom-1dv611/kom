export default function(state = null, action) {
    switch(action.type) {
        case "ROOM_SELECTED":
            console.log("CLICKED222");
            return action.value;
        default:
            break;
    }
    return state;
}