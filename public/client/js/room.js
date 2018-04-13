let booking = $("#book").children().children();

let hours = booking[1];
let minutes = booking[2];

function setupButton(parent) {
    parent = $(parent);
    let obj =  {
        parent: parent,
        button: parent.children()[0],
        dropdown: parent.children()[1]
    };
    return obj;
}

$(".dropdown-item").click(function() {
    let value = $(event.target).text();
    let owner = $(event.target).parent().parent().children()[0];
    let suffix = $(owner).parent()[0] === hours ? "Hour" : "Minutes";

    if(suffix == "Hour" && value > 1) {
        suffix = "Hours";
    }

    $(owner).text(`${value} ${suffix}`);
});