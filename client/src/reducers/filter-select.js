export default function(state = null, action) {
    switch(action.type) {
        case "FILTER_SELECTED":
            return action.value;
        default:
            break;
    }
    return state;
}