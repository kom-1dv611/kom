export default function(state = null, action) {
    console.log("?????")
    switch(action.type) {
        case "SCHEDULE_LOADED":
            console.log("SENT!")
            return action.value;
        default:
            break;
    }
    return state;
}