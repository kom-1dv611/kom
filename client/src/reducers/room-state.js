export default function(state = null, action) {
    switch(action.type) {
        case "STATE_DETECTED":
            return action.value;
        default:
            break;
    }
    return state;
}