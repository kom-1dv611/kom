let bookLater = false;
let durationSelected = false;

$(".btn-group-toggle").change(function() {
    if($(this).children().children().is(':checked')) {
        durationSelected = true;
        if(bookLater === false) {
            $("#modalToggleUsername").attr("data-toggle", "modal");
        }
    }
});

$("#confirmTime").click(function() {
   bookLater = true;
   // check if values are not equal to 0
});

$("#modalToggleUsername").click(function() {
    if(!durationSelected) {
        let error = makeWarning();
        error.append("<p>You need to select a duration</p>");
    }
});

function makeWarning() {
    let div = $("<div></div>").appendTo("body");
    let close = $("<button></button>").appendTo(div);
    let span = $("<span></span>").appendTo(close);

    div.addClass("alert alert-danger alert-dismissible text-center animated fadeIn");
    div.attr("role", "alert");
    div.attr("value", "bla")

    close.attr("type", "button");
    close.addClass("close");
    close.attr("data-dismiss", "alert");
    close.attr("aria-label", "Close");

    span.attr("aria-hidden", "true");
    span.html(`&times;`);

    return div;
}