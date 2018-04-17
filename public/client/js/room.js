let lastClick;
const socket = io();

$(".preset").click(function() {
    lastClick = this;
});

$(".submit").click(function() {
    let username = $("#username").val()
    let time = $(lastClick).text();

    socket.emit("newBooking", {username: username, time: time});
});

if($("#state").text() == "Available") {
    $("body").attr('id', 'available');
} else {
    $("body").attr('id', 'unavailable');
}