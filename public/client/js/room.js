const socket = io();

$("body").attr('id', $("#state").text() == "Available" ? 'available' : 'unavailable');

function makeCol(parent) {
    let col = $("<div>").prependTo("#bookingForm");
    col.addClass("col-md-auto animated fadeInLeft");;
    return col;
}

$("#bookLater").click(function() {
    let col, time, date, dateIcon, timeIcon;
    $(this).parent().remove();

    col = makeCol("#bookingForm");

    dateIcon = $("<i>").appendTo(col);
    dateIcon.addClass("fas fa-calendar-alt fa-2x");

    time = $("<input>").appendTo(col);
    time.addClass("form-control");
    time.attr("type", "time")

    col = makeCol("#bookingForm");

    dateIcon = $("<i>").appendTo(col);
    dateIcon.addClass("fas fa-clock fa-2x");

    date = $("<input>").appendTo(col);
    date.addClass("form-control");
    date.attr("type", "date");

    $(".btn-group").children().addClass("animated fadeInLeft");
});