export default function(state = null, action) {
    switch(action.type) {
        case "BOOKING_CANCELED":
            return action.value;
        default:
            break;
    }
    return state;
}