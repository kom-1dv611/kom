export default function(state = null, action) {
    switch(action.type) {
        case "SCHEDULE_LOADED":
            return action.value;
        default:
            break;
    }
    return state;
}