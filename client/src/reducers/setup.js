export default function(state = null, action) {
    switch(action.type) {
        case "SETUP_SELECTED":
            console.log("CLICKED");
            return action.value;
        default:
            break;
    }
    return state;
}