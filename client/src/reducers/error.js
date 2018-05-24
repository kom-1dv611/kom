let error = "";
let duration = 0;

export default function(state = null, action) {
    switch(action.type) {
        case "NEW_ERROR":
            duration = 5;
            error = action.value;
            console.log("current msg is: " + error);
            break;
        case "GET_ERROR":
            return error;
        default:
            break;
    }
    return error;
}