let error = {msg: ""}; //Returning the object allows updating it.
let duration = 0;

function getError() {
    return error.msg;
}

export default function(state = null, action) {
    switch(action.type) {
        case "NEW_ERROR":
            duration = 5;
            error.msg = action.value;
            console.log("current msg is: " + getError());
            break;
        default:
            return error;
    }
    return error;
}