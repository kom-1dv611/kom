let lastClick;
const socket = io();

$(".submit").click(function() {
    let username = $("#username").val()
    //let time = $(lastClick).text();

    //socket.emit("newBooking", {username: username, time: time});
});

$("body").attr('id', $("#state").text() == "Available" ? 'available' : 'unavailable');

function makeCol(parent) {
    let col = $("<div>").prependTo("#bookingForm");
    col.addClass("col-md-auto");;
    return col;
}

$("#bookLater").click(function() {
    let col, time, date;
    $(this).parent().remove();

    col = makeCol("#bookingForm");
    time = $("<input>").appendTo(col);
    time.addClass("form-control");
    time.attr("type", "time")

    col = makeCol("#bookingForm");
    date = $("<input>").appendTo(col);
    date.addClass("form-control");
    date.attr("type", "date");
});