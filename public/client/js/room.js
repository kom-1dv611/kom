let lastClick;
const socket = io();

$(".preset").click(function() {
    let clicked = $(this);
    let normal = "btn-dark";
    let selected = "btn-primary";

    $(clicked).removeClass(normal);
    $(clicked).addClass(selected);

    if(lastClick != undefined) {
        $(lastClick).removeClass(selected);
        $(lastClick).addClass(normal)
    }

    lastClick = this;
});

$(".submit").click(function() {
    let username = $("#username").val()
    let time = $(lastClick).text();

    socket.emit("newBooking", {username: username, time: time});
});