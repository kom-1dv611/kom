let bookLater = false;
let bookingValid = false;
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
   let time = $("#time").val();
   let date = $("#date").val();
   if(time != "" || date != "") {
        bookLater = true;
        if(time == "" || date == "") {
            newError("Day or time is invalid.");
            bookingValid = false;
        } else {
            bookingValid = true;
        }
   }
});

$("#modalToggleUsername").click(function() {
    let msg;
    let errors = [];
    if(!durationSelected) {
        errors.push("You need to select a duration");
    }
    if(!bookingValid && bookLater) {
        errors.push("Day or time is invalid.");
    }
    if(errors.length > 0) {
        newError(errors.join(". "));
    } else {
        $("#confirmBooking").attr("type", "submit");
    }
});

function newError(text) {
    if(!errorExists()) {
        let error = makeWarning();
        msg = $(`<p>${text}</p>`).appendTo(error);
        msg.attr("id", "errorMsg");
    } else {
        msg = $("#errorMsg");
        msg.text(text)
    }
}

function errorExists() {
    return $("#errorMsg").length > 0;
}

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